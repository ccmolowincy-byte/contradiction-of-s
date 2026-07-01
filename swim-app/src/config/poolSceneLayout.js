export const POOL_DECOR_ASSETS = [
  { id: 'chair', label: 'Chair', resourceId: 'poolChairModel', defaultScale: 2.6, surface: 'deck' },
  { id: 'parasol', label: 'Parasol', resourceId: 'poolParasolModel', defaultScale: 3.4, surface: 'deck' },
  { id: 'palm', label: 'Palm', resourceId: 'poolPalmModel', defaultScale: 3.0, surface: 'deck' },
  { id: 'cocktail', label: 'Cocktail', resourceId: 'poolCocktailModel', defaultScale: 0.62, surface: 'deck' },
  { id: 'flamingo', label: 'Flamingo', resourceId: 'poolFlamingoModel', defaultScale: 2.3, surface: 'water', floating: true },
];

export const DEFAULT_POOL_SCENE_LAYOUT = [
  {
    id: "chair-mqyeyadc-1",
    asset: "chair",
    position: {
      x: 3.95,
      y: 1.214,
      z: 4.562
    },
    rotation: {
      x: 3.142,
      y: -1.027,
      z: 3.142
    },
    scale: {
      x: 2.6,
      y: 2.6,
      z: 2.6
    },
    surface: "deck",
    floating: false,
    phase: 0,
    amp: 0
  },
  {
    id: "flamingo-mqyeyra9-1",
    asset: "flamingo",
    position: {
      x: -1.544,
      y: 1.116,
      z: -4.688
    },
    rotation: {
      x: 3.142,
      y: -1.352,
      z: 3.142
    },
    scale: {
      x: 1.107,
      y: 1.107,
      z: 1.107
    },
    surface: "water",
    floating: true,
    phase: 0,
    amp: 0.05
  },
  {
    id: "cocktail-mqyezwvv-1",
    asset: "cocktail",
    position: {
      x: -3.808,
      y: 1.513,
      z: 1.35
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 0.62,
      y: 0.62,
      z: 0.62
    },
    surface: "deck",
    floating: false,
    phase: 0,
    amp: 0
  }
];
