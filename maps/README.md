# SVG Maps

This directory contains SVG map data for Escape From Tarkov maps. The maps are designed to be web-friendly and can be used by community tools for displaying quest locations, spawns, extracts, and other interactive features.

## Overview

Maps are provided as SVG files for easy integration with web applications and tools. Each map is structured with layers representing different floors or areas, making it simple to show/hide specific sections.

## Usage

### Import Maps

SVG maps can be imported directly into most application settings. Each map uses SVG group elements to represent floors (layers in Adobe Illustrator source files).

### Layer Structure

Maps are organized hierarchically:
- **Floor Groups**: Top-level groups representing different floors
- **Feature Groups**: Sub-groups containing specific map features (roads, rocks, ramps, etc.)

You can selectively show, hide, or adjust the opacity of these layers based on your application needs.

### Metadata

Map metadata is available in [data/maps.json](../data/maps.json):

```json
{
  "svg": {
    "file": "map-filename.svg",
    "floors": ["floor1", "floor2"],
    "defaultFloor": "floor1"
  }
}
```

**Properties:**
- `file` - SVG filename for the map
- `floors` - Array of element IDs for SVG floor groups
- `defaultFloor` - Default floor layer to display

### Quest Coordinates

Quest objectives with fixed locations include GPS coordinates in [data/quests.json](../data/quests.json):

```json
{
  "gps": {
    "topPercent": 45.5,
    "leftPercent": 62.3,
    "floor": "floor1"
  }
}
```

**Properties:**
- `topPercent` - Y coordinate as percentage of map height
- `leftPercent` - X coordinate as percentage of map width
- `floor` - SVG group/layer ID for the objective location

## Map Creation Guidelines

When creating or updating maps, please follow these standards:

### Technical Requirements

- **SVG Only**: All maps must be entirely SVG-drawn, no raster images
- **Accuracy**: Match in-game maps as closely as possible
- **No Labels**: Do not include text labels in the SVG
- **Appropriate Detail**: Include landmarks and important features, but avoid excessive detail
- **Floor Groups**: Multi-floor maps (like Interchange) must use parent-level groups for each floor
- **Source Files**: Include source files (e.g., Adobe Illustrator) in addition to final SVG

### Design Standards

- **Consistency**: Use the existing color scheme for new maps
- **Post-Processing**: Color schemes can be adjusted in post-processing if needed
- **Simplicity**: Focus on functional clarity over artistic detail

## Future Metadata

Additional metadata planned for future releases:
- Extraction points
- Locked door locations
- Spawn points
- Loot locations
- Key usage locations

If you need specific metadata types, please open a discussion to propose a format. Pull requests are always welcome.

## Contributing

To contribute map improvements:

1. Follow the creation guidelines above
2. Include both SVG and source files
3. Test coordinates with existing quest data
4. Submit a pull request with detailed changes

## File Format

SVG files should be optimized for web use:
- Clean, semantic markup
- Minimal file size
- Consistent naming conventions
- Valid XML structure

## Support

For questions about map usage or contribution guidelines, please open a discussion on GitHub.


