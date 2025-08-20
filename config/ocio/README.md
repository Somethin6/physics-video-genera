# OpenColorIO Configuration for Physics Foundry

This directory contains the OCIO (OpenColorIO) configuration files for consistent color management across the Physics Foundry pipeline.

## Configuration Files

- `config.ocio` - Main OCIO configuration file
- `luts/` - Look-up tables for color transforms
- `displays/` - Display device profiles

## Color Spaces Supported

- **ACEScg** - Working space for internal processing
- **Rec.709** - Standard HD display
- **sRGB** - Web and monitor display
- **Linear** - Linear light for rendering

## View Transforms

- **AgX** - High-quality tone mapping
- **Filmic** - Cinematic look
- **Raw** - No transform (for testing)

## Usage

The OCIO configuration is automatically loaded when `OCIO` environment variable points to `config.ocio` file.

For development without OCIO installed, the system gracefully falls back to sRGB processing.