# Favicon Files

The favicon files in this directory provide icon support across different platforms:

- `favicon.svg` - Primary SVG favicon (modern browsers)
- `favicon-16x16.png` - Small size favicon (to be generated)
- `favicon-32x32.png` - Standard size favicon (to be generated)  
- `apple-touch-icon.png` - iOS home screen icon (to be generated)
- `site.webmanifest` - Web app manifest for PWA support

To generate the PNG files from the SVG, you can use tools like:
- Online converters (favicon.io, realfavicongenerator.net)
- ImageMagick: `convert favicon.svg -resize 32x32 favicon-32x32.png`
- Design tools like Figma, Sketch, or Adobe Illustrator

For now, the SVG favicon will work in modern browsers.