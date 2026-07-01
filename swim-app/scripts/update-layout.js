import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const jsonPath = process.argv[2] || 'C:/Users/user/Downloads/swim-scene-layout (1).json';

const payload = JSON.parse(readFileSync(jsonPath, 'utf8'));

function stringify(value, indent = 2) {
  return JSON.stringify(value, null, indent)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/`/g, '\\`');
}

// poolSceneLayout.js
const poolConfigPath = join(__dirname, '../src/config/poolSceneLayout.js');
const poolHeader = `export const POOL_DECOR_ASSETS = [
  { id: 'chair', label: 'Chair', resourceId: 'poolChairModel', defaultScale: 2.6, surface: 'deck' },
  { id: 'parasol', label: 'Parasol', resourceId: 'poolParasolModel', defaultScale: 3.4, surface: 'deck' },
  { id: 'palm', label: 'Palm', resourceId: 'poolPalmModel', defaultScale: 3.0, surface: 'deck' },
  { id: 'cocktail', label: 'Cocktail', resourceId: 'poolCocktailModel', defaultScale: 0.62, surface: 'deck' },
  { id: 'flamingo', label: 'Flamingo', resourceId: 'poolFlamingoModel', defaultScale: 2.3, surface: 'water', floating: true },
];

`;
writeFileSync(poolConfigPath, poolHeader + `export const DEFAULT_POOL_SCENE_LAYOUT = ${stringify(payload.props, 2)};\n`);

// environmentSceneLayout.js
const envConfigPath = join(__dirname, '../src/config/environmentSceneLayout.js');
const envSource = readFileSync(envConfigPath, 'utf8');
const envRegex = /export const DEFAULT_ENVIRONMENT_SCENE_LAYOUT = [\s\S]*?;/;
if (!envRegex.test(envSource)) {
  throw new Error('Could not find DEFAULT_ENVIRONMENT_SCENE_LAYOUT export');
}
writeFileSync(
  envConfigPath,
  envSource.replace(envRegex, `export const DEFAULT_ENVIRONMENT_SCENE_LAYOUT = ${stringify(payload.environment, 2)};`)
);

// foliageColors.js
const foliageConfigPath = join(__dirname, '../src/config/foliageColors.js');
const foliage = payload.foliage || {};
writeFileSync(
  foliageConfigPath,
  `export const DEFAULT_FOLIAGE_COLORS = ${stringify(foliage, 2)};\n`
);

console.log(`Updated pool layout with ${payload.props.length} props.`);
console.log(`Updated environment layout with ${payload.environment.length} items.`);
console.log(`Updated foliage colors${foliage.grass || foliage.bush ? '' : ' (empty)'}.`);
