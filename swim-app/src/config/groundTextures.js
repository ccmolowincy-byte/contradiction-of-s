/**
 * Ground texture presets for the Scene Composer swapper.
 *
 * The default entry points at the existing procedural rock detail texture.
 * The AI-generated entries are painterly, top-down ground textures that
 * replace the procedural diffuse when selected.
 */
export const GROUND_TEXTURES = [
  {
    id: 'default',
    label: 'Default rocks',
    assetId: 'groundRockMap',
  },
  {
    id: 'meadow',
    label: 'Iridescent meadow',
    assetId: 'groundTextureMeadow',
  },
  {
    id: 'sakura',
    label: 'Sakura path',
    assetId: 'groundTextureSakura',
  },
  {
    id: 'forest',
    label: 'Mystic forest floor',
    assetId: 'groundTextureForest',
  },
  {
    id: 'wheat',
    label: 'Golden wheat field',
    assetId: 'groundTextureWheat',
  },
  {
    id: 'shore',
    label: 'Crystal lake shore',
    assetId: 'groundTextureShore',
  },
  {
    id: 'moondustBeach',
    label: 'Moondust beach',
    assetId: 'groundTextureMoondustBeach',
  },
  {
    id: 'alienPavement',
    label: 'Alien pavement',
    assetId: 'groundTextureAlienPavement',
  },
  {
    id: 'sanctuaryRock',
    label: 'Sanctuary rock',
    assetId: 'groundTextureSanctuaryRock',
  },
  {
    id: 'starfallPlain',
    label: 'Starfall plain',
    assetId: 'groundTextureStarfallPlain',
  },
];

export const DEFAULT_GROUND_TEXTURE_ID = 'default';
