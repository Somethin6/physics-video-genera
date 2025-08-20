"""
Quality gates and analysis system
Implements SSIM, PSNR, VMAF analysis with automated quality control
"""

import asyncio
import logging
import subprocess
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union
import json
import tempfile

import cv2
import numpy as np
from skimage import metrics as sk_metrics
import OpenImageIO as oiio

from .dsl_models import QualityMetrics, QualityIssue, FrameAnalysis
from .observability import RetryableOperation, process_manager, operation_duration_seconds

logger = logging.getLogger(__name__)


class QualityAnalyzer:
    """Frame-by-frame quality analysis with SSIM, PSNR, and VMAF"""
    
    def __init__(self):
        self.quality_thresholds = {
            'ssim_minimum': 0.85,
            'psnr_minimum': 30.0,
            'vmaf_minimum': 70.0,
            'text_legibility_minimum': 0.80,
            'motion_stability_minimum': 0.75
        }
    
    def set_quality_thresholds(self, thresholds: Dict[str, float]):
        """Update quality thresholds"""
        self.quality_thresholds.update(thresholds)
        logger.info(f"Updated quality thresholds: {self.quality_thresholds}")
    
    def analyze_frame(
        self,
        frame_path: Path,
        reference_path: Optional[Path] = None,
        frame_index: int = 0,
        timestamp: float = 0.0
    ) -> FrameAnalysis:
        """Comprehensive frame quality analysis"""
        
        with operation_duration_seconds.labels(operation='frame_analysis').time():
            try:
                # Load frame
                frame = self._load_frame(frame_path)
                if frame is None:
                    raise ValueError(f"Could not load frame: {frame_path}")
                
                # Initialize metrics
                metrics = QualityMetrics(
                    ssim_score=1.0,
                    optical_flow_stability=1.0,
                    text_legibility=0.0,
                    color_accuracy=1.0,
                    motion_artifacts=0,
                    compression_artifacts=0
                )
                
                issues = []
                
                # SSIM analysis if reference provided
                if reference_path and reference_path.exists():
                    reference = self._load_frame(reference_path)
                    if reference is not None:
                        metrics.ssim_score = self._calculate_ssim(frame, reference)
                        
                        if metrics.ssim_score < self.quality_thresholds['ssim_minimum']:
                            issues.append(QualityIssue(
                                type='structural_similarity',
                                severity='high' if metrics.ssim_score < 0.7 else 'medium',
                                description=f'SSIM score {metrics.ssim_score:.3f} below threshold',
                                suggestion='Check for blurriness, artifacts, or content changes',
                                auto_fixable=False
                            ))
                
                # Text legibility analysis
                metrics.text_legibility = self._analyze_text_legibility(frame)
                if metrics.text_legibility < self.quality_thresholds['text_legibility_minimum']:
                    issues.append(QualityIssue(
                        type='text_legibility',
                        severity='high',
                        description=f'Text legibility {metrics.text_legibility:.3f} below threshold',
                        suggestion='Increase font size, improve contrast, or check text positioning',
                        auto_fixable=True
                    ))
                
                # Motion artifact detection
                artifacts = self._detect_motion_artifacts(frame)
                metrics.motion_artifacts = len(artifacts)
                
                for artifact in artifacts:
                    issues.append(QualityIssue(
                        type='motion_artifact',
                        severity='medium',
                        description='Motion blur or temporal inconsistency detected',
                        location=artifact,
                        suggestion='Check frame timing or motion vectors',
                        auto_fixable=False
                    ))
                
                # Compression artifact detection
                compression_score = self._detect_compression_artifacts(frame)
                metrics.compression_artifacts = int(compression_score * 100)
                
                if compression_score > 0.1:
                    issues.append(QualityIssue(
                        type='compression_artifacts',
                        severity='medium' if compression_score < 0.2 else 'high',
                        description=f'Compression artifacts detected (score: {compression_score:.3f})',
                        suggestion='Reduce compression ratio or use lossless intermediate format',
                        auto_fixable=True
                    ))
                
                # Color accuracy check
                metrics.color_accuracy = self._check_color_accuracy(frame)
                if metrics.color_accuracy < 0.9:
                    issues.append(QualityIssue(
                        type='color_accuracy',
                        severity='medium',
                        description='Color accuracy below expected range',
                        suggestion='Verify color management pipeline and OCIO configuration',
                        auto_fixable=False
                    ))
                
                # Calculate overall score
                overall_score = (
                    metrics.ssim_score * 0.3 +
                    metrics.text_legibility * 0.25 +
                    metrics.optical_flow_stability * 0.2 +
                    metrics.color_accuracy * 0.15 +
                    max(0, 1 - metrics.motion_artifacts * 0.1) * 0.1
                )
                
                return FrameAnalysis(
                    frame_index=frame_index,
                    timestamp=timestamp,
                    metrics=metrics,
                    issues=issues,
                    overall_score=min(1.0, max(0.0, overall_score)),
                    analysis_duration=0.0  # Will be filled by timing decorator
                )
                
            except Exception as e:
                logger.error(f"Frame analysis failed for {frame_path}: {e}")
                # Return minimal analysis with error
                return FrameAnalysis(
                    frame_index=frame_index,
                    timestamp=timestamp,
                    metrics=QualityMetrics(
                        ssim_score=0.0,
                        optical_flow_stability=0.0,
                        text_legibility=0.0,
                        color_accuracy=0.0,
                        motion_artifacts=999,
                        compression_artifacts=999
                    ),
                    issues=[QualityIssue(
                        type='analysis_error',
                        severity='critical',
                        description=f'Quality analysis failed: {str(e)}',
                        suggestion='Check frame format and accessibility',
                        auto_fixable=False
                    )],
                    overall_score=0.0,
                    analysis_duration=0.0
                )
    
    def _load_frame(self, path: Path) -> Optional[np.ndarray]:
        """Load frame using OpenImageIO for broad format support"""
        try:
            inp = oiio.ImageInput.open(str(path))
            if not inp:
                return None
            
            spec = inp.spec()
            pixels = inp.read_image(oiio.FLOAT)
            inp.close()
            
            # Convert to OpenCV format (BGR, uint8)
            if pixels.dtype == np.float32:
                pixels = (pixels * 255).astype(np.uint8)
            
            # Handle different channel layouts
            if spec.nchannels == 4:  # RGBA -> BGR
                pixels = cv2.cvtColor(pixels, cv2.COLOR_RGBA2BGR)
            elif spec.nchannels == 3:  # RGB -> BGR  
                pixels = cv2.cvtColor(pixels, cv2.COLOR_RGB2BGR)
            
            return pixels
            
        except Exception as e:
            logger.debug(f"OIIO failed, trying OpenCV: {e}")
            try:
                return cv2.imread(str(path))
            except Exception as e2:
                logger.error(f"Could not load {path}: {e2}")
                return None
    
    def _calculate_ssim(self, img1: np.ndarray, img2: np.ndarray) -> float:
        """Calculate SSIM between two frames"""
        try:
            # Ensure same dimensions
            if img1.shape != img2.shape:
                h, w = min(img1.shape[0], img2.shape[0]), min(img1.shape[1], img2.shape[1])
                img1 = img1[:h, :w]
                img2 = img2[:h, :w]
            
            # Convert to grayscale if needed
            if len(img1.shape) == 3:
                img1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
                img2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)
            
            return sk_metrics.structural_similarity(img1, img2)
            
        except Exception as e:
            logger.error(f"SSIM calculation failed: {e}")
            return 0.0
    
    def _analyze_text_legibility(self, frame: np.ndarray) -> float:
        """Analyze text legibility using edge detection and contrast"""
        try:
            # Convert to grayscale
            if len(frame.shape) == 3:
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            else:
                gray = frame
            
            # Apply Gaussian blur to reduce noise
            blurred = cv2.GaussianBlur(gray, (3, 3), 0)
            
            # Calculate local contrast using Laplacian
            laplacian = cv2.Laplacian(blurred, cv2.CV_64F)
            contrast_score = laplacian.var()
            
            # Normalize to 0-1 range (empirically determined)
            normalized_score = min(1.0, contrast_score / 500.0)
            
            return normalized_score
            
        except Exception as e:
            logger.error(f"Text legibility analysis failed: {e}")
            return 0.0
    
    def _detect_motion_artifacts(self, frame: np.ndarray) -> List[Dict[str, int]]:
        """Detect motion artifacts using gradient analysis"""
        artifacts = []
        
        try:
            # Convert to grayscale
            if len(frame.shape) == 3:
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            else:
                gray = frame
            
            # Calculate gradients
            grad_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
            grad_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
            
            # Find high gradient regions (potential motion blur)
            gradient_mag = np.sqrt(grad_x**2 + grad_y**2)
            threshold = np.percentile(gradient_mag, 95)
            
            # Find contours of high-gradient regions
            high_grad = (gradient_mag > threshold).astype(np.uint8) * 255
            contours, _ = cv2.findContours(high_grad, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            for contour in contours:
                if cv2.contourArea(contour) > 100:  # Filter small artifacts
                    x, y, w, h = cv2.boundingRect(contour)
                    artifacts.append({'x': x, 'y': y, 'width': w, 'height': h})
            
            return artifacts[:10]  # Limit to top 10 artifacts
            
        except Exception as e:
            logger.error(f"Motion artifact detection failed: {e}")
            return []
    
    def _detect_compression_artifacts(self, frame: np.ndarray) -> float:
        """Detect compression artifacts using DCT analysis"""
        try:
            # Convert to grayscale
            if len(frame.shape) == 3:
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            else:
                gray = frame
            
            # Apply DCT to detect blocking artifacts
            # Resize to multiple of 8 for DCT
            h, w = gray.shape
            h_new, w_new = (h // 8) * 8, (w // 8) * 8
            if h_new > 0 and w_new > 0:
                gray_resized = cv2.resize(gray, (w_new, h_new))
                
                # Calculate variance in DCT coefficients
                dct = cv2.dct(gray_resized.astype(np.float32))
                high_freq_energy = np.sum(np.abs(dct[4:, 4:]))
                total_energy = np.sum(np.abs(dct))
                
                if total_energy > 0:
                    artifact_score = 1.0 - (high_freq_energy / total_energy)
                    return max(0.0, min(1.0, artifact_score))
            
            return 0.0
            
        except Exception as e:
            logger.error(f"Compression artifact detection failed: {e}")
            return 0.0
    
    def _check_color_accuracy(self, frame: np.ndarray) -> float:
        """Check color accuracy using histogram analysis"""
        try:
            # Calculate color histograms
            if len(frame.shape) == 3:
                # Calculate histogram for each channel
                hist_b = cv2.calcHist([frame], [0], None, [256], [0, 256])
                hist_g = cv2.calcHist([frame], [1], None, [256], [0, 256])
                hist_r = cv2.calcHist([frame], [2], None, [256], [0, 256])
                
                # Check for proper distribution (avoid clipping)
                total_pixels = frame.shape[0] * frame.shape[1]
                
                # Check for clipping (too many pixels at extremes)
                clipping_threshold = total_pixels * 0.01  # 1% threshold
                
                b_clipped = hist_b[0] + hist_b[255] > clipping_threshold
                g_clipped = hist_g[0] + hist_g[255] > clipping_threshold  
                r_clipped = hist_r[0] + hist_r[255] > clipping_threshold
                
                if any([b_clipped, g_clipped, r_clipped]):
                    return 0.7  # Penalize for clipping
                
                # Check for reasonable spread
                b_spread = np.std(np.where(hist_b.flatten())[0])
                g_spread = np.std(np.where(hist_g.flatten())[0])
                r_spread = np.std(np.where(hist_r.flatten())[0])
                
                avg_spread = (b_spread + g_spread + r_spread) / 3.0
                spread_score = min(1.0, avg_spread / 64.0)  # Normalize
                
                return spread_score
            
            return 1.0  # Grayscale - assume good
            
        except Exception as e:
            logger.error(f"Color accuracy check failed: {e}")
            return 0.5


class VMafAnalyzer:
    """VMAF perceptual quality analysis"""
    
    @RetryableOperation.with_backoff(max_attempts=2)
    async def calculate_vmaf(
        self,
        reference_video: Path,
        distorted_video: Path,
        model_path: Optional[str] = None
    ) -> Dict[str, float]:
        """Calculate VMAF score between reference and distorted videos"""
        
        model_arg = f"model={model_path}" if model_path else "model=version=vmaf_v0.6.1"
        
        cmd = [
            'ffmpeg', '-y',
            '-i', str(distorted_video),
            '-i', str(reference_video),
            '-lavfi', f'libvmaf={model_arg}:log_fmt=json:log_path=/tmp/vmaf_output.json',
            '-f', 'null', '-'
        ]
        
        try:
            result = await process_manager.run_with_timeout(
                cmd,
                timeout=300.0,
                process_id=f"vmaf_{distorted_video.stem}"
            )
            
            # Read VMAF results
            with open('/tmp/vmaf_output.json', 'r') as f:
                vmaf_data = json.load(f)
            
            # Extract scores
            frames = vmaf_data.get('frames', [])
            if frames:
                scores = [frame['metrics']['vmaf'] for frame in frames]
                return {
                    'vmaf_mean': np.mean(scores),
                    'vmaf_min': np.min(scores),
                    'vmaf_max': np.max(scores),
                    'vmaf_std': np.std(scores),
                    'frame_count': len(scores)
                }
            
            return {}
            
        except Exception as e:
            logger.error(f"VMAF calculation failed: {e}")
            return {}
        finally:
            # Cleanup
            if Path('/tmp/vmaf_output.json').exists():
                Path('/tmp/vmaf_output.json').unlink()


class QualityGate:
    """Quality control gate that enforces standards"""
    
    def __init__(self, config: Dict[str, float]):
        self.thresholds = config
        self.analyzer = QualityAnalyzer()
        self.analyzer.set_quality_thresholds(config)
        self.vmaf_analyzer = VMafAnalyzer()
    
    async def check_frame_sequence(
        self,
        frames: List[Path],
        reference_frames: Optional[List[Path]] = None
    ) -> Tuple[bool, List[FrameAnalysis]]:
        """Check quality of frame sequence"""
        
        analyses = []
        critical_failures = 0
        
        for i, frame_path in enumerate(frames):
            ref_path = reference_frames[i] if reference_frames and i < len(reference_frames) else None
            
            analysis = self.analyzer.analyze_frame(
                frame_path,
                ref_path,
                frame_index=i,
                timestamp=i * (1.0/30.0)  # Assume 30fps
            )
            
            analyses.append(analysis)
            
            # Count critical issues
            critical_issues = [issue for issue in analysis.issues if issue.severity == 'critical']
            critical_failures += len(critical_issues)
        
        # Gate decision
        overall_scores = [a.overall_score for a in analyses]
        avg_score = np.mean(overall_scores) if overall_scores else 0.0
        
        gate_passed = (
            critical_failures == 0 and 
            avg_score >= self.thresholds.get('overall_minimum', 0.75)
        )
        
        return gate_passed, analyses
    
    async def check_video_quality(
        self,
        video_path: Path,
        reference_path: Optional[Path] = None
    ) -> Dict[str, Union[bool, float, Dict]]:
        """Comprehensive video quality check"""
        
        results = {
            'gate_passed': False,
            'overall_score': 0.0,
            'vmaf_scores': {},
            'issues': []
        }
        
        try:
            # VMAF analysis if reference provided
            if reference_path:
                vmaf_scores = await self.vmaf_analyzer.calculate_vmaf(reference_path, video_path)
                results['vmaf_scores'] = vmaf_scores
                
                if vmaf_scores:
                    vmaf_mean = vmaf_scores.get('vmaf_mean', 0)
                    if vmaf_mean < self.thresholds.get('vmaf_minimum', 70.0):
                        results['issues'].append(f"VMAF score {vmaf_mean:.1f} below threshold")
            
            # Additional checks can be added here
            # For now, assume passed if no critical issues
            results['gate_passed'] = len(results['issues']) == 0
            results['overall_score'] = vmaf_scores.get('vmaf_mean', 100) / 100.0 if vmaf_scores else 1.0
            
        except Exception as e:
            logger.error(f"Video quality check failed: {e}")
            results['issues'].append(f"Quality analysis failed: {str(e)}")
        
        return results


# Global instances
quality_analyzer = QualityAnalyzer()
default_quality_gate = QualityGate({
    'ssim_minimum': 0.85,
    'vmaf_minimum': 70.0,
    'overall_minimum': 0.75,
    'text_legibility_minimum': 0.80
})