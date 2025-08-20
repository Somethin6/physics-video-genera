"""
Color management and media processing pipeline
Implements OCIO enforcement, OpenEXR intermediates, and EBU R128 loudness normalization
"""

import logging
import os
import subprocess
import tempfile
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union

import numpy as np
from PIL import Image
import OpenImageIO as oiio
import PyOpenColorIO as ocio

from .observability import RetryableOperation, process_manager

logger = logging.getLogger(__name__)


class ColorManager:
    """OCIO-based color management system"""
    
    def __init__(self, config_path: Optional[str] = None):
        self.config_path = config_path or os.getenv('OCIO')
        if not self.config_path:
            raise ValueError("OCIO config path required. Set OCIO environment variable.")
        
        self.config = ocio.Config.CreateFromFile(self.config_path)
        logger.info(f"Loaded OCIO config: {self.config_path}")
    
    def get_display_transforms(self) -> List[str]:
        """Get available display transforms"""
        displays = []
        for i in range(self.config.getNumDisplays()):
            displays.append(self.config.getDisplay(i))
        return displays
    
    def get_current_config_info(self) -> Dict[str, str]:
        """Get current color config information for UI display"""
        return {
            'config_path': self.config_path,
            'description': self.config.getDescription(),
            'working_space': self.config.getColorSpace('scene_linear').getName(),
            'num_colorspaces': str(self.config.getNumColorSpaces()),
            'num_displays': str(self.config.getNumDisplays())
        }
    
    @RetryableOperation.with_backoff(max_attempts=2)
    def convert_colorspace(
        self,
        input_path: Path,
        output_path: Path, 
        src_colorspace: str,
        dst_colorspace: str
    ) -> bool:
        """Convert between color spaces using OCIO"""
        try:
            # Create processor
            processor = self.config.getProcessor(src_colorspace, dst_colorspace)
            
            # Read image
            inp = oiio.ImageInput.open(str(input_path))
            if not inp:
                raise RuntimeError(f"Could not open {input_path}")
            
            spec = inp.spec()
            pixels = inp.read_image(oiio.FLOAT)
            inp.close()
            
            # Apply color transform
            cpu_processor = processor.getDefaultCPUProcessor()
            cpu_processor.applyRGB(pixels)
            
            # Write output
            out = oiio.ImageOutput.create(str(output_path))
            if not out:
                raise RuntimeError(f"Could not create {output_path}")
            
            out.open(str(output_path), spec)
            out.write_image(pixels)
            out.close()
            
            logger.info(f"Color converted {input_path} -> {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Color conversion failed: {e}")
            return False


class OpenEXRManager:
    """OpenEXR intermediate format management"""
    
    COMPRESSION_PRESETS = {
        'zip': {'compression': 'zip', 'description': 'Fast read, moderate compression'},
        'piz': {'compression': 'piz', 'description': 'Good for grainy images'},
        'b44': {'compression': 'b44', 'description': 'Lossy, good for smooth gradients'},
        'dwaa': {'compression': 'dwaa', 'description': 'Modern, efficient compression'}
    }
    
    def __init__(self, compression: str = 'zip'):
        if compression not in self.COMPRESSION_PRESETS:
            raise ValueError(f"Unknown compression: {compression}")
        self.compression = compression
        logger.info(f"OpenEXR using {compression} compression")
    
    def convert_to_exr(
        self,
        input_path: Path,
        output_path: Path,
        metadata: Optional[Dict[str, str]] = None
    ) -> bool:
        """Convert image to OpenEXR with scene-linear data"""
        try:
            # Read input
            inp = oiio.ImageInput.open(str(input_path))
            if not inp:
                return False
            
            spec = inp.spec()
            pixels = inp.read_image(oiio.FLOAT)
            inp.close()
            
            # Configure EXR spec
            exr_spec = oiio.ImageSpec(spec.width, spec.height, spec.nchannels, oiio.FLOAT)
            exr_spec.attribute("compression", self.compression)
            
            # Add metadata
            if metadata:
                for key, value in metadata.items():
                    exr_spec.attribute(key, value)
            
            # Add pipeline metadata
            exr_spec.attribute("physics_foundry:compression", self.compression)
            exr_spec.attribute("physics_foundry:created", str(datetime.utcnow()))
            
            # Write EXR
            out = oiio.ImageOutput.create(str(output_path))
            if not out:
                return False
            
            out.open(str(output_path), exr_spec)
            out.write_image(pixels)
            out.close()
            
            logger.info(f"Converted to EXR: {input_path} -> {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"EXR conversion failed: {e}")
            return False
    
    def get_exr_info(self, path: Path) -> Dict[str, str]:
        """Get EXR file information"""
        try:
            inp = oiio.ImageInput.open(str(path))
            if not inp:
                return {}
            
            spec = inp.spec()
            info = {
                'resolution': f"{spec.width}x{spec.height}",
                'channels': str(spec.nchannels),
                'compression': spec.get_string_attribute("compression", "unknown"),
                'datatype': str(spec.format),
            }
            
            # Get custom attributes
            for attr in spec.extra_attribs:
                if attr.name.startswith("physics_foundry:"):
                    info[attr.name] = str(attr.value)
            
            inp.close()
            return info
            
        except Exception as e:
            logger.error(f"Failed to read EXR info: {e}")
            return {}


class AudioManager:
    """EBU R128 loudness normalization and audio processing"""
    
    def __init__(self):
        self.target_lufs = -23.0  # EBU R128 standard
        self.target_tp = -1.0     # True peak limit
    
    @RetryableOperation.with_backoff(max_attempts=3)
    async def normalize_loudness(
        self,
        input_path: Path,
        output_path: Path,
        target_lufs: Optional[float] = None
    ) -> Dict[str, float]:
        """Normalize audio to EBU R128 standard using FFmpeg loudnorm"""
        target_lufs = target_lufs or self.target_lufs
        
        # First pass - measure loudness
        measure_cmd = [
            'ffmpeg', '-i', str(input_path),
            '-af', f'loudnorm=I={target_lufs}:TP={self.target_tp}:LRA=7:print_format=json',
            '-f', 'null', '-'
        ]
        
        try:
            result = await process_manager.run_with_timeout(
                measure_cmd,
                timeout=60.0,
                process_id=f"loudnorm_measure_{input_path.stem}"
            )
            
            # Parse JSON output from stderr
            stderr_text = result.stderr.decode()
            json_start = stderr_text.find('{')
            if json_start == -1:
                raise RuntimeError("Could not find loudness measurement JSON")
            
            import json
            loudness_data = json.loads(stderr_text[json_start:])
            
            # Second pass - apply normalization
            normalize_cmd = [
                'ffmpeg', '-y', '-i', str(input_path),
                '-af', (
                    f'loudnorm=I={target_lufs}:TP={self.target_tp}:LRA=7:'
                    f'measured_I={loudness_data["input_i"]}:'
                    f'measured_LRA={loudness_data["input_lra"]}:'
                    f'measured_TP={loudness_data["input_tp"]}:'
                    f'measured_thresh={loudness_data["input_thresh"]}:'
                    f'offset={loudness_data["target_offset"]}:'
                    f'linear=true:print_format=json'
                ),
                str(output_path)
            ]
            
            result = await process_manager.run_with_timeout(
                normalize_cmd,
                timeout=120.0,
                process_id=f"loudnorm_apply_{input_path.stem}"
            )
            
            # Extract final measurements
            stderr_text = result.stderr.decode()
            json_start = stderr_text.rfind('{')  # Get last JSON block
            if json_start != -1:
                final_data = json.loads(stderr_text[json_start:])
                return {
                    'input_lufs': float(loudness_data['input_i']),
                    'output_lufs': float(final_data['output_i']),
                    'input_tp': float(loudness_data['input_tp']),
                    'output_tp': float(final_data['output_tp']),
                    'lra': float(final_data['output_lra'])
                }
            
            return {}
            
        except Exception as e:
            logger.error(f"Loudness normalization failed: {e}")
            raise
    
    async def analyze_audio(self, path: Path) -> Dict[str, float]:
        """Analyze audio levels without modification"""
        cmd = [
            'ffmpeg', '-i', str(path),
            '-af', 'loudnorm=print_format=json',
            '-f', 'null', '-'
        ]
        
        try:
            result = await process_manager.run_with_timeout(
                cmd,
                timeout=30.0,
                process_id=f"audio_analyze_{path.stem}"
            )
            
            stderr_text = result.stderr.decode()
            json_start = stderr_text.find('{')
            if json_start != -1:
                import json
                data = json.loads(stderr_text[json_start:])
                return {
                    'integrated_lufs': float(data['input_i']),
                    'true_peak': float(data['input_tp']),
                    'lra': float(data['input_lra']),
                    'threshold': float(data['input_thresh'])
                }
            
            return {}
            
        except Exception as e:
            logger.error(f"Audio analysis failed: {e}")
            return {}


class MediaPipeline:
    """Integrated media processing pipeline"""
    
    def __init__(self, ocio_config: Optional[str] = None):
        self.color_manager = ColorManager(ocio_config)
        self.exr_manager = OpenEXRManager()
        self.audio_manager = AudioManager()
    
    async def process_render_output(
        self,
        input_frames: List[Path],
        output_dir: Path,
        colorspace_transform: Optional[Tuple[str, str]] = None
    ) -> List[Path]:
        """Process raw render output to OpenEXR intermediates"""
        output_frames = []
        
        for frame_path in input_frames:
            # Generate output path
            output_path = output_dir / f"{frame_path.stem}.exr"
            
            # Convert to EXR
            success = self.exr_manager.convert_to_exr(
                frame_path,
                output_path,
                metadata={'source': str(frame_path)}
            )
            
            if success:
                # Apply color transform if specified
                if colorspace_transform:
                    temp_path = output_path.with_suffix('.temp.exr')
                    if self.color_manager.convert_colorspace(
                        output_path, temp_path, *colorspace_transform
                    ):
                        temp_path.replace(output_path)
                
                output_frames.append(output_path)
            else:
                logger.warning(f"Failed to process frame: {frame_path}")
        
        return output_frames
    
    async def create_video_sequence(
        self,
        frame_sequence: List[Path],
        output_path: Path,
        framerate: float = 30.0,
        audio_path: Optional[Path] = None
    ) -> bool:
        """Create final video from frame sequence"""
        
        # Create frame list file for FFmpeg
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            for frame in frame_sequence:
                f.write(f"file '{frame}'\n")
            frame_list_path = f.name
        
        try:
            cmd = [
                'ffmpeg', '-y',
                '-f', 'concat',
                '-safe', '0',
                '-r', str(framerate),
                '-i', frame_list_path
            ]
            
            # Add audio if provided
            if audio_path:
                # Normalize audio first
                normalized_audio = output_path.parent / f"{audio_path.stem}_normalized.wav"
                await self.audio_manager.normalize_loudness(audio_path, normalized_audio)
                
                cmd.extend(['-i', str(normalized_audio)])
                cmd.extend(['-c:a', 'aac', '-b:a', '192k'])
            
            # Video encoding with NVENC if available
            cmd.extend([
                '-c:v', 'libx264',  # Fallback to software encoding
                '-preset', 'medium',
                '-crf', '18',
                '-pix_fmt', 'yuv420p',
                str(output_path)
            ])
            
            result = await process_manager.run_with_timeout(
                cmd,
                timeout=300.0,
                process_id=f"video_encode_{output_path.stem}"
            )
            
            return result.returncode == 0
            
        except Exception as e:
            logger.error(f"Video creation failed: {e}")
            return False
            
        finally:
            # Cleanup
            if os.path.exists(frame_list_path):
                os.unlink(frame_list_path)


# Global instances
color_manager = None
media_pipeline = None

def initialize_media_pipeline(ocio_config: Optional[str] = None):
    """Initialize global media pipeline"""
    global color_manager, media_pipeline
    
    try:
        color_manager = ColorManager(ocio_config)
        media_pipeline = MediaPipeline(ocio_config)
        logger.info("Media pipeline initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize media pipeline: {e}")
        return False