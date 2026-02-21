# Certificate Fonts

## Optional Custom Fonts

The certificate generator uses system fonts by default (serif and sans-serif). For better styling, you can add custom fonts to this directory.

## Required Font Files

Place the following font files in this directory:

1. **Kerkis-Calligraphic.otf** (or similar elegant script font)
   - Used for: Recipient names
   - Alternative: Any decorative/script font like "Great Vibes", "Dancing Script", or "Corinthia"
   - Download: https://www.ctan.org/pkg/kerkis

2. **Lora-Regular.ttf**
   - Used for: Body text and headings
   - Alternative: Georgia, Times New Roman (serif fonts)
   - Download: https://fonts.google.com/specimen/Lora

3. **InstrumentSans-Regular.ttf**
   - Used for: Labels and secondary text
   - Alternative: Arial, Helvetica (sans-serif fonts)
   - Download: https://fonts.google.com/specimen/Instrument+Sans

## Setup

1. Download the font files
2. Place them in this directory (`server/src/utils/fonts/`)
3. Restart the server
4. The certificate generator will automatically use the custom fonts

## Current Status

The system works without these files using fallback fonts:
- EdwardianScript → serif
- Lora → serif
- InstrumentSans → sans-serif
