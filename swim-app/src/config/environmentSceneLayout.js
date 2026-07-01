/**
 * Environment asset definitions for the Scene Composer.
 *
 * Static assets are cloned or harvested from the scene. Dynamic grass, flower,
 * and bush assets are composer wrappers around the vendored shader systems so
 * their wind animation remains intact.
 */

export const ENVIRONMENT_DECOR_ASSETS = [
  { id: 'tree', label: 'Tree trunk', singleton: false },
  { id: 'rock', label: 'Rock', singleton: false },
  {
    id: 'proceduralGrass',
    label: 'Procedural grass',
    singleton: false,
    editable: true,
    seedable: true,
    defaults: {
      patchOptions: {
        shape: 'organic',
        baseRadius: 1.35,
        bladeCount: 520,
        bladeScaleMin: 0.94,
        bladeScaleMax: 1.08,
        hasFlowers: true,
        flowerCount: 5,
        flowerSize: 0.2,
        flowerScale: 0.38,
      },
    },
  },
  {
    id: 'flowerSprinkle',
    label: 'Flower sprinkle',
    singleton: false,
    editable: true,
    seedable: true,
    defaults: {
      patchOptions: {
        shape: 'organic',
        baseRadius: 0.48,
        bladeCount: 0,
        hasFlowers: true,
        flowerCountMin: 2,
        flowerCountMax: 5,
        flowerSize: 0.36,
        flowerScale: 0.68,
        flowerYOffsetMin: 0.14,
        flowerYOffsetMax: 0.22,
        yOffset: 0.02,
      },
    },
  },
  {
    id: 'grassPatch',
    label: 'Grass patch',
    singleton: false,
    editable: true,
    seedable: true,
    hidden: true,
  },
  {
    id: 'grassPatchSmall',
    label: 'Small grass patch',
    singleton: false,
    editable: true,
    seedable: true,
    hidden: true,
    defaults: {
      patchOptions: {
        shape: 'circle',
        baseRadius: 0.5,
        bladeCount: 160,
        hasFlowers: false,
      },
    },
  },
  {
    id: 'grassPatchLarge',
    label: 'Large grass patch',
    singleton: false,
    editable: true,
    seedable: true,
    hidden: true,
    defaults: {
      patchOptions: {
        shape: 'circle',
        baseRadius: 1.6,
        bladeCount: 800,
        hasFlowers: false,
      },
    },
  },
  {
    id: 'grassPatchSquare',
    label: 'Square grass patch',
    singleton: false,
    editable: true,
    seedable: true,
    hidden: true,
    defaults: {
      patchOptions: {
        shape: 'square',
        baseRadius: 1.0,
        bladeCount: 420,
        hasFlowers: false,
      },
    },
  },
  {
    id: 'grassPatchRing',
    label: 'Ring grass patch',
    singleton: false,
    editable: true,
    seedable: true,
    hidden: true,
    defaults: {
      patchOptions: {
        shape: 'ring',
        baseRadius: 1.2,
        bladeCount: 360,
        hasFlowers: false,
      },
    },
  },
  {
    id: 'grassPatchFlowers',
    label: 'Grass patch with flowers',
    singleton: false,
    editable: true,
    seedable: true,
    hidden: true,
    defaults: {
      patchOptions: {
        shape: 'circle',
        baseRadius: 1.0,
        bladeCount: 400,
        hasFlowers: true,
        flowerCount: 12,
        flowerSize: 0.22,
        flowerScale: 0.42,
      },
    },
  },
  {
    id: 'bush',
    label: 'Bush',
    singleton: false,
    editable: true,
    defaults: {
      bushOptions: {
        bushType: 'default',
        leafCount: 45,
        baseScale: 0.85,
        distributionScale: 1.0,
      },
    },
  },
  {
    id: 'bushSmall',
    label: 'Small bush',
    singleton: false,
    editable: true,
    defaults: {
      bushOptions: {
        bushType: 'default',
        leafCount: 28,
        baseScale: 0.55,
        distributionScale: 0.7,
      },
    },
  },
  {
    id: 'bushLarge',
    label: 'Large bush',
    singleton: false,
    editable: true,
    defaults: {
      bushOptions: {
        bushType: 'default',
        leafCount: 78,
        baseScale: 1.15,
        distributionScale: 1.35,
      },
    },
  },
  {
    id: 'bushCanopy',
    label: 'Leaf canopy bush',
    singleton: false,
    editable: true,
    defaults: {
      bushOptions: {
        bushType: 'tree',
        leafCount: 72,
        baseScale: 1.0,
        distributionScale: 1.25,
      },
    },
  },
  { id: 'lake', label: 'Water ripples', singleton: true, editable: true },
  {
    id: 'starLake',
    label: 'Star lake',
    singleton: false,
    editable: true,
    resourceId: 'starLakeModel',
    defaults: {
      scale: { x: 8.5, y: 8.5, z: 8.5 },
    },
  },
  { id: 'pool', label: 'Pool', singleton: true, editable: true },
  {
    id: 'ground',
    label: 'Ground',
    singleton: true,
    editable: true,
    defaults: { groundTexture: 'default' },
  },
];

export const DEFAULT_ENVIRONMENT_SCENE_LAYOUT = [
  {
    id: "ground",
    asset: "ground",
    position: {
      x: -0.961,
      y: -0.12,
      z: -3.118
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 9.61,
      y: 9.61,
      z: 9.61
    },
    groundTexture: "starfallPlain"
  },
  {
    id: "starLake-mqyd791d-1",
    asset: "starLake",
    position: {
      x: -1.533,
      y: 0,
      z: -1.191
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 15.71,
      y: 15.71,
      z: 15.71
    }
  },
  {
    id: "bushLarge-mqyd923b-1",
    asset: "bushLarge",
    position: {
      x: 25.426,
      y: 0,
      z: 8.3
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 78,
      baseScale: 1.15,
      distributionScale: 1.35,
      randomSeed: 217662564
    }
  },
  {
    id: "proceduralGrass-mqydb91x-1",
    asset: "proceduralGrass",
    position: {
      x: -4.95,
      y: 0.253,
      z: 7.208
    },
    rotation: {
      x: 0,
      y: 2.973,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 881139008
    }
  },
  {
    id: "proceduralGrass-mqydbbcl-2",
    asset: "proceduralGrass",
    position: {
      x: -6.908,
      y: 0.253,
      z: -7.295
    },
    rotation: {
      x: 0,
      y: 5.154,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 553839464
    }
  },
  {
    id: "proceduralGrass-mqydbcdi-3",
    asset: "proceduralGrass",
    position: {
      x: -4.817,
      y: 0.253,
      z: -9.56
    },
    rotation: {
      x: 0,
      y: 1.862,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 222777724
    }
  },
  {
    id: "proceduralGrass-mqydbd94-4",
    asset: "proceduralGrass",
    position: {
      x: -8.197,
      y: 0.253,
      z: -8.082
    },
    rotation: {
      x: 0,
      y: 0.474,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 96659341
    }
  },
  {
    id: "proceduralGrass-mqydbf2v-5",
    asset: "proceduralGrass",
    position: {
      x: -5.903,
      y: 0.253,
      z: -10.566
    },
    rotation: {
      x: 0,
      y: 3.237,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 227928653
    }
  },
  {
    id: "proceduralGrass-mqydbg1j-6",
    asset: "proceduralGrass",
    position: {
      x: -6.131,
      y: 0.253,
      z: -8.485
    },
    rotation: {
      x: 0,
      y: 4.209,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 654281123
    }
  },
  {
    id: "proceduralGrass-mqydbh17-7",
    asset: "proceduralGrass",
    position: {
      x: -6.452,
      y: 0.253,
      z: -8.885
    },
    rotation: {
      x: 0,
      y: 4.237,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 663164037
    }
  },
  {
    id: "proceduralGrass-mqydbk6g-8",
    asset: "proceduralGrass",
    position: {
      x: -7.365,
      y: 0.253,
      z: -7.104
    },
    rotation: {
      x: 0,
      y: 1.923,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 225939021
    }
  },
  {
    id: "proceduralGrass-mqydblld-9",
    asset: "proceduralGrass",
    position: {
      x: -7.773,
      y: 0.253,
      z: -4.163
    },
    rotation: {
      x: 0,
      y: 5.907,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 840316049
    }
  },
  {
    id: "proceduralGrass-mqydbn30-10",
    asset: "proceduralGrass",
    position: {
      x: -8.471,
      y: 0.253,
      z: -5.826
    },
    rotation: {
      x: 0,
      y: 2.855,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 704125142
    }
  },
  {
    id: "proceduralGrass-mqydbooq-11",
    asset: "proceduralGrass",
    position: {
      x: -7.68,
      y: 0.253,
      z: 7.321
    },
    rotation: {
      x: 0,
      y: 5.042,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 747883887
    }
  },
  {
    id: "proceduralGrass-mqydbp8s-12",
    asset: "proceduralGrass",
    position: {
      x: -6.373,
      y: 0.253,
      z: 7.918
    },
    rotation: {
      x: 0,
      y: 0.701,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 284957316
    }
  },
  {
    id: "proceduralGrass-mqydbq5l-13",
    asset: "proceduralGrass",
    position: {
      x: -8.111,
      y: 0.253,
      z: 8.579
    },
    rotation: {
      x: 0,
      y: 6.239,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 275245876
    }
  },
  {
    id: "proceduralGrass-mqydbrbc-14",
    asset: "proceduralGrass",
    position: {
      x: -3.268,
      y: 0.253,
      z: 7.11
    },
    rotation: {
      x: 0,
      y: 4.047,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 521070564
    }
  },
  {
    id: "proceduralGrass-mqydbrzw-15",
    asset: "proceduralGrass",
    position: {
      x: -5.138,
      y: 0.253,
      z: 5.14
    },
    rotation: {
      x: 0,
      y: 3.77,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 95148022
    }
  },
  {
    id: "proceduralGrass-mqydbto1-16",
    asset: "proceduralGrass",
    position: {
      x: -4.994,
      y: 0.253,
      z: 1.71
    },
    rotation: {
      x: 0,
      y: 2.89,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 588806622
    }
  },
  {
    id: "proceduralGrass-mqydbyt9-17",
    asset: "proceduralGrass",
    position: {
      x: 6.323,
      y: 0.253,
      z: -0.429
    },
    rotation: {
      x: 0,
      y: 4.095,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 141795181
    }
  },
  {
    id: "proceduralGrass-mqydbz87-18",
    asset: "proceduralGrass",
    position: {
      x: 6.99,
      y: 0.253,
      z: 1.726
    },
    rotation: {
      x: 0,
      y: 5.252,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 826771788
    }
  },
  {
    id: "proceduralGrass-mqydbziz-19",
    asset: "proceduralGrass",
    position: {
      x: 7.632,
      y: 0.253,
      z: -0.292
    },
    rotation: {
      x: 0,
      y: 5.616,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 58443986
    }
  },
  {
    id: "proceduralGrass-mqydc081-20",
    asset: "proceduralGrass",
    position: {
      x: 7.577,
      y: 0.253,
      z: 1.432
    },
    rotation: {
      x: 0,
      y: 4.071,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 754016278
    }
  },
  {
    id: "proceduralGrass-mqydc0xy-21",
    asset: "proceduralGrass",
    position: {
      x: 1.776,
      y: 0.253,
      z: -3.838
    },
    rotation: {
      x: 0,
      y: 1.457,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 64113404
    }
  },
  {
    id: "proceduralGrass-mqydc1h0-22",
    asset: "proceduralGrass",
    position: {
      x: 0.123,
      y: 0.253,
      z: -4.697
    },
    rotation: {
      x: 0,
      y: 0.287,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 763277888
    }
  },
  {
    id: "proceduralGrass-mqydc21i-23",
    asset: "proceduralGrass",
    position: {
      x: 1.7,
      y: -0.028,
      z: 3.4
    },
    rotation: {
      x: 0,
      y: 0.091,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 869512523
    }
  },
  {
    id: "proceduralGrass-mqydc2wf-24",
    asset: "proceduralGrass",
    position: {
      x: 3.593,
      y: 0.253,
      z: 2.523
    },
    rotation: {
      x: 0,
      y: 3.326,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 853781101
    }
  },
  {
    id: "proceduralGrass-mqydc4r9-25",
    asset: "proceduralGrass",
    position: {
      x: -1.818,
      y: 0.253,
      z: 5.593
    },
    rotation: {
      x: 0,
      y: 0.47,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 67040477
    }
  },
  {
    id: "proceduralGrass-mqydc5k9-26",
    asset: "proceduralGrass",
    position: {
      x: 1.367,
      y: 0.253,
      z: 7.12
    },
    rotation: {
      x: 0,
      y: 2.04,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 893003060
    }
  },
  {
    id: "proceduralGrass-mqydc9rk-27",
    asset: "proceduralGrass",
    position: {
      x: -8.239,
      y: 0.253,
      z: -1.649
    },
    rotation: {
      x: 0,
      y: 4.702,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 226708946
    }
  },
  {
    id: "proceduralGrass-mqydcab8-28",
    asset: "proceduralGrass",
    position: {
      x: -4.234,
      y: 0.253,
      z: -1.014
    },
    rotation: {
      x: 0,
      y: 0.34,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 692036865
    }
  },
  {
    id: "proceduralGrass-mqydcbjc-29",
    asset: "proceduralGrass",
    position: {
      x: -3.896,
      y: 0.253,
      z: -5.647
    },
    rotation: {
      x: 0,
      y: 1.706,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 319334423
    }
  },
  {
    id: "proceduralGrass-mqydcdcd-30",
    asset: "proceduralGrass",
    position: {
      x: -4.941,
      y: 0.253,
      z: -4.701
    },
    rotation: {
      x: 0,
      y: 5.662,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 574679226
    }
  },
  {
    id: "proceduralGrass-mqydcf2h-31",
    asset: "proceduralGrass",
    position: {
      x: -2.453,
      y: 0.253,
      z: -9.099
    },
    rotation: {
      x: 0,
      y: 5.934,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 549011955
    }
  },
  {
    id: "proceduralGrass-mqyde0gn-32",
    asset: "proceduralGrass",
    position: {
      x: 11.025,
      y: 0.253,
      z: -5.409
    },
    rotation: {
      x: 0,
      y: 4.292,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 536508946
    }
  },
  {
    id: "proceduralGrass-mqyde1xl-33",
    asset: "proceduralGrass",
    position: {
      x: 13.179,
      y: 0.253,
      z: -3.842
    },
    rotation: {
      x: 0,
      y: 0.259,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 655689278
    }
  },
  {
    id: "proceduralGrass-mqyde347-34",
    asset: "proceduralGrass",
    position: {
      x: 11.167,
      y: 0.118,
      z: -5.116
    },
    rotation: {
      x: 0,
      y: 1.724,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 276668744
    }
  },
  {
    id: "proceduralGrass-mqyde5ya-35",
    asset: "proceduralGrass",
    position: {
      x: 13.042,
      y: 0.135,
      z: -3.856
    },
    rotation: {
      x: 0,
      y: 5.952,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 135019331
    }
  },
  {
    id: "proceduralGrass-mqyde98f-36",
    asset: "proceduralGrass",
    position: {
      x: 4.296,
      y: 0.253,
      z: -12.835
    },
    rotation: {
      x: 0,
      y: 3.178,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 288804569
    }
  },
  {
    id: "proceduralGrass-mqydeagd-37",
    asset: "proceduralGrass",
    position: {
      x: 5.641,
      y: -0.05,
      z: -10.403
    },
    rotation: {
      x: 0,
      y: 4.15,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 196912453
    }
  },
  {
    id: "proceduralGrass-mqydedcw-38",
    asset: "proceduralGrass",
    position: {
      x: -2.719,
      y: -0.202,
      z: -16.318
    },
    rotation: {
      x: 0,
      y: 1.964,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 321270036
    }
  },
  {
    id: "proceduralGrass-mqydeg6y-39",
    asset: "proceduralGrass",
    position: {
      x: -4.922,
      y: -0.102,
      z: -7.263
    },
    rotation: {
      x: 0,
      y: 0.354,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 802303795
    }
  },
  {
    id: "proceduralGrass-mqydeikq-40",
    asset: "proceduralGrass",
    position: {
      x: -3.059,
      y: -0.107,
      z: -7.993
    },
    rotation: {
      x: 0,
      y: 0.738,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 293674065
    }
  },
  {
    id: "proceduralGrass-mqydelge-41",
    asset: "proceduralGrass",
    position: {
      x: -5.988,
      y: -0.052,
      z: -5.08
    },
    rotation: {
      x: 0,
      y: 3.516,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 201765220
    }
  },
  {
    id: "proceduralGrass-mqydeotb-42",
    asset: "proceduralGrass",
    position: {
      x: -4.954,
      y: -0.148,
      z: 3.345
    },
    rotation: {
      x: 0,
      y: 0.532,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 537201161
    }
  },
  {
    id: "proceduralGrass-mqyderab-43",
    asset: "proceduralGrass",
    position: {
      x: -1.59,
      y: -0.056,
      z: 7.813
    },
    rotation: {
      x: 0,
      y: 0.798,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 219417324
    }
  },
  {
    id: "proceduralGrass-mqydetf5-44",
    asset: "proceduralGrass",
    position: {
      x: -0.599,
      y: 0.142,
      z: 6.299
    },
    rotation: {
      x: 0,
      y: 5.207,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 72781845
    }
  },
  {
    id: "proceduralGrass-mqydezji-45",
    asset: "proceduralGrass",
    position: {
      x: 5.899,
      y: 0.253,
      z: 0.685
    },
    rotation: {
      x: 0,
      y: 3.64,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 266203806
    }
  },
  {
    id: "proceduralGrass-mqydf0v6-46",
    asset: "proceduralGrass",
    position: {
      x: 4.642,
      y: -0.048,
      z: -10.901
    },
    rotation: {
      x: 0,
      y: 6.093,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 58431518
    }
  },
  {
    id: "proceduralGrass-mqydf3x4-47",
    asset: "proceduralGrass",
    position: {
      x: 6.248,
      y: 0.253,
      z: -14.131
    },
    rotation: {
      x: 0,
      y: 3.581,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 94300988
    }
  },
  {
    id: "proceduralGrass-mqydf7wc-48",
    asset: "proceduralGrass",
    position: {
      x: 8.405,
      y: 0.253,
      z: -11.487
    },
    rotation: {
      x: 0,
      y: 4.816,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 210814907
    }
  },
  {
    id: "proceduralGrass-mqydf9an-49",
    asset: "proceduralGrass",
    position: {
      x: 6.994,
      y: -0.207,
      z: -9.211
    },
    rotation: {
      x: 0,
      y: 0.947,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 681635939
    }
  },
  {
    id: "proceduralGrass-mqydfdke-50",
    asset: "proceduralGrass",
    position: {
      x: 2.392,
      y: -0.109,
      z: -6.817
    },
    rotation: {
      x: 0,
      y: 0.131,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 740876825
    }
  },
  {
    id: "proceduralGrass-mqydigw5-51",
    asset: "proceduralGrass",
    position: {
      x: 0,
      y: 0,
      z: 23.3
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 821545252
    }
  },
  {
    id: "proceduralGrass-mqydijju-52",
    asset: "proceduralGrass",
    position: {
      x: 7.113,
      y: 0.253,
      z: 4.293
    },
    rotation: {
      x: 0,
      y: 3.372,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 168698135
    }
  },
  {
    id: "proceduralGrass-mqydimvh-53",
    asset: "proceduralGrass",
    position: {
      x: 0.885,
      y: -0.001,
      z: -7.142
    },
    rotation: {
      x: 0,
      y: 0.968,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 701458497
    }
  },
  {
    id: "proceduralGrass-mqydiovi-54",
    asset: "proceduralGrass",
    position: {
      x: 3.134,
      y: 0.253,
      z: -7.162
    },
    rotation: {
      x: 0,
      y: 2.626,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 785574744
    }
  },
  {
    id: "proceduralGrass-mqydipvs-55",
    asset: "proceduralGrass",
    position: {
      x: 2.527,
      y: 0.102,
      z: -5.539
    },
    rotation: {
      x: 0,
      y: 1.532,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 16414630
    }
  },
  {
    id: "proceduralGrass-mqydisue-56",
    asset: "proceduralGrass",
    position: {
      x: 4.799,
      y: 0.253,
      z: -3.698
    },
    rotation: {
      x: 0,
      y: 1.661,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 727202721
    }
  },
  {
    id: "proceduralGrass-mqyditdg-57",
    asset: "proceduralGrass",
    position: {
      x: 4.02,
      y: 0.046,
      z: -5.538
    },
    rotation: {
      x: 0,
      y: 4.641,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 223707937
    }
  },
  {
    id: "proceduralGrass-mqydiwkd-58",
    asset: "proceduralGrass",
    position: {
      x: 5.101,
      y: 0.253,
      z: -7.375
    },
    rotation: {
      x: 0,
      y: 2.261,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 789714469
    }
  },
  {
    id: "proceduralGrass-mqydiwy8-59",
    asset: "proceduralGrass",
    position: {
      x: 4.225,
      y: 0.042,
      z: -6.212
    },
    rotation: {
      x: 0,
      y: 2.269,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 148727176
    }
  },
  {
    id: "proceduralGrass-mqydizh9-60",
    asset: "proceduralGrass",
    position: {
      x: 1.304,
      y: 0.253,
      z: -13.185
    },
    rotation: {
      x: 0,
      y: 2.364,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 576093563
    }
  },
  {
    id: "proceduralGrass-mqydj1qr-61",
    asset: "proceduralGrass",
    position: {
      x: 3.199,
      y: 0.07,
      z: -11.883
    },
    rotation: {
      x: 0,
      y: 3.628,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 213467682
    }
  },
  {
    id: "proceduralGrass-mqydj5oe-62",
    asset: "proceduralGrass",
    position: {
      x: -2.501,
      y: 0.19,
      z: -14.389
    },
    rotation: {
      x: 0,
      y: 3.462,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 404934219
    }
  },
  {
    id: "proceduralGrass-mqydj7ob-63",
    asset: "proceduralGrass",
    position: {
      x: -3.74,
      y: 0.229,
      z: -13.539
    },
    rotation: {
      x: 0,
      y: 5.119,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 397254478
    }
  },
  {
    id: "proceduralGrass-mqydjb97-64",
    asset: "proceduralGrass",
    position: {
      x: -6.994,
      y: -0.006,
      z: 1.585
    },
    rotation: {
      x: 0,
      y: 3.602,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 186737156
    }
  },
  {
    id: "proceduralGrass-mqydjenv-65",
    asset: "proceduralGrass",
    position: {
      x: -3.771,
      y: 0.253,
      z: 7.948
    },
    rotation: {
      x: 0,
      y: 5.012,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 665443375
    }
  },
  {
    id: "proceduralGrass-mqydjfww-66",
    asset: "proceduralGrass",
    position: {
      x: -2.993,
      y: 0.253,
      z: 8.313
    },
    rotation: {
      x: 0,
      y: 3.155,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 3244508
    }
  },
  {
    id: "proceduralGrass-mqydjhvq-67",
    asset: "proceduralGrass",
    position: {
      x: -2.463,
      y: 0.121,
      z: 9.705
    },
    rotation: {
      x: 0,
      y: 5.708,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 586355518
    }
  },
  {
    id: "proceduralGrass-mqydjjlm-68",
    asset: "proceduralGrass",
    position: {
      x: -4.227,
      y: 0.222,
      z: 9.164
    },
    rotation: {
      x: 0,
      y: 2.779,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 84960466
    }
  },
  {
    id: "proceduralGrass-mqydjlse-69",
    asset: "proceduralGrass",
    position: {
      x: -5.778,
      y: 0.253,
      z: 9.732
    },
    rotation: {
      x: 0,
      y: 3.117,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 18894917
    }
  },
  {
    id: "proceduralGrass-mqydjmoc-70",
    asset: "proceduralGrass",
    position: {
      x: -4.08,
      y: 0.253,
      z: 10.65
    },
    rotation: {
      x: 0,
      y: 4.793,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 508902985
    }
  },
  {
    id: "proceduralGrass-mqydjmzb-71",
    asset: "proceduralGrass",
    position: {
      x: -3.137,
      y: 0.253,
      z: 11.084
    },
    rotation: {
      x: 0,
      y: 2.406,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 132963601
    }
  },
  {
    id: "proceduralGrass-mqydjnp3-72",
    asset: "proceduralGrass",
    position: {
      x: -1.046,
      y: 0.253,
      z: 10.197
    },
    rotation: {
      x: 0,
      y: 5.661,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 812943596
    }
  },
  {
    id: "proceduralGrass-mqydjoyb-73",
    asset: "proceduralGrass",
    position: {
      x: -6.942,
      y: 0.181,
      z: 3.452
    },
    rotation: {
      x: 0,
      y: 5.338,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 978817925
    }
  },
  {
    id: "proceduralGrass-mqydjr2t-74",
    asset: "proceduralGrass",
    position: {
      x: 3.624,
      y: 0.253,
      z: 0.276
    },
    rotation: {
      x: 0,
      y: 5.179,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 141289497
    }
  },
  {
    id: "proceduralGrass-mqydjsc6-75",
    asset: "proceduralGrass",
    position: {
      x: 4.307,
      y: 0.253,
      z: -1.307
    },
    rotation: {
      x: 0,
      y: 6.18,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 14205625
    }
  },
  {
    id: "proceduralGrass-mqydjt84-76",
    asset: "proceduralGrass",
    position: {
      x: 2.796,
      y: 0.253,
      z: 0.189
    },
    rotation: {
      x: 0,
      y: 1.054,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 505119830
    }
  },
  {
    id: "proceduralGrass-mqydjvf7-77",
    asset: "proceduralGrass",
    position: {
      x: -9.162,
      y: 0.253,
      z: -2.112
    },
    rotation: {
      x: 0,
      y: 2.915,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 936021203
    }
  },
  {
    id: "proceduralGrass-mqydjx65-78",
    asset: "proceduralGrass",
    position: {
      x: 5.407,
      y: 0.253,
      z: 2.072
    },
    rotation: {
      x: 0,
      y: 0.578,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 2115540
    }
  },
  {
    id: "proceduralGrass-mqydjz78-79",
    asset: "proceduralGrass",
    position: {
      x: 6.44,
      y: 0.028,
      z: -1.723
    },
    rotation: {
      x: 0,
      y: 3.531,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 50730792
    }
  },
  {
    id: "proceduralGrass-mqydk122-80",
    asset: "proceduralGrass",
    position: {
      x: 4.265,
      y: 0.142,
      z: 1.576
    },
    rotation: {
      x: 0,
      y: 5.065,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 250856724
    }
  },
  {
    id: "proceduralGrass-mqydk4fs-81",
    asset: "proceduralGrass",
    position: {
      x: 8.369,
      y: 0.253,
      z: -2.867
    },
    rotation: {
      x: 0,
      y: 3.896,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 268620504
    }
  },
  {
    id: "proceduralGrass-mqydk5nt-82",
    asset: "proceduralGrass",
    position: {
      x: 9.457,
      y: 0.253,
      z: -1.485
    },
    rotation: {
      x: 0,
      y: 0.171,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 294075549
    }
  },
  {
    id: "proceduralGrass-mqydk6mq-83",
    asset: "proceduralGrass",
    position: {
      x: 5.389,
      y: 0.253,
      z: 3.622
    },
    rotation: {
      x: 0,
      y: 4.462,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 975188845
    }
  },
  {
    id: "proceduralGrass-mqydk76e-84",
    asset: "proceduralGrass",
    position: {
      x: 3.95,
      y: 0.253,
      z: 4.335
    },
    rotation: {
      x: 0,
      y: 5.223,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 59297897
    }
  },
  {
    id: "proceduralGrass-mqydk7rj-85",
    asset: "proceduralGrass",
    position: {
      x: 5.148,
      y: 0.253,
      z: 5.012
    },
    rotation: {
      x: 0,
      y: 1.321,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 252683731
    }
  },
  {
    id: "proceduralGrass-mqydk8of-86",
    asset: "proceduralGrass",
    position: {
      x: 3.443,
      y: 0.253,
      z: 5.965
    },
    rotation: {
      x: 0,
      y: 2.379,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 498013523
    }
  },
  {
    id: "flowerSprinkle-mqydkb7n-1",
    asset: "flowerSprinkle",
    position: {
      x: -2.55,
      y: 0.506,
      z: 7.888
    },
    rotation: {
      x: 0,
      y: 0.072,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 0.48,
      bladeCount: 0,
      hasFlowers: true,
      flowerCountMin: 2,
      flowerCountMax: 5,
      flowerSize: 0.36,
      flowerScale: 0.68,
      flowerYOffsetMin: 0.14,
      flowerYOffsetMax: 0.22,
      yOffset: 0.02,
      randomSeed: 403460678
    }
  },
  {
    id: "flowerSprinkle-mqydken4-2",
    asset: "flowerSprinkle",
    position: {
      x: 3.828,
      y: 0.223,
      z: 5.618
    },
    rotation: {
      x: 0,
      y: 3.512,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 0.48,
      bladeCount: 0,
      hasFlowers: true,
      flowerCountMin: 2,
      flowerCountMax: 5,
      flowerSize: 0.36,
      flowerScale: 0.68,
      flowerYOffsetMin: 0.14,
      flowerYOffsetMax: 0.22,
      yOffset: 0.02,
      randomSeed: 158711657
    }
  },
  {
    id: "flowerSprinkle-mqydkfdc-3",
    asset: "flowerSprinkle",
    position: {
      x: 5.658,
      y: 0.223,
      z: 1.35
    },
    rotation: {
      x: 0,
      y: 5.651,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 0.48,
      bladeCount: 0,
      hasFlowers: true,
      flowerCountMin: 2,
      flowerCountMax: 5,
      flowerSize: 0.36,
      flowerScale: 0.68,
      flowerYOffsetMin: 0.14,
      flowerYOffsetMax: 0.22,
      yOffset: 0.02,
      randomSeed: 223123610
    }
  },
  {
    id: "flowerSprinkle-mqydkg30-4",
    asset: "flowerSprinkle",
    position: {
      x: -8.819,
      y: 0.223,
      z: -3.038
    },
    rotation: {
      x: 0,
      y: 1.238,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 0.48,
      bladeCount: 0,
      hasFlowers: true,
      flowerCountMin: 2,
      flowerCountMax: 5,
      flowerSize: 0.36,
      flowerScale: 0.68,
      flowerYOffsetMin: 0.14,
      flowerYOffsetMax: 0.22,
      yOffset: 0.02,
      randomSeed: 121226219
    }
  },
  {
    id: "flowerSprinkle-mqydkh2q-5",
    asset: "flowerSprinkle",
    position: {
      x: -3.879,
      y: 0.223,
      z: -5.678
    },
    rotation: {
      x: 0,
      y: 4.086,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 0.48,
      bladeCount: 0,
      hasFlowers: true,
      flowerCountMin: 2,
      flowerCountMax: 5,
      flowerSize: 0.36,
      flowerScale: 0.68,
      flowerYOffsetMin: 0.14,
      flowerYOffsetMax: 0.22,
      yOffset: 0.02,
      randomSeed: 879568538
    }
  },
  {
    id: "flowerSprinkle-mqydkhqn-6",
    asset: "flowerSprinkle",
    position: {
      x: -8.252,
      y: 0.223,
      z: -6.97
    },
    rotation: {
      x: 0,
      y: 5.94,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 0.48,
      bladeCount: 0,
      hasFlowers: true,
      flowerCountMin: 2,
      flowerCountMax: 5,
      flowerSize: 0.36,
      flowerScale: 0.68,
      flowerYOffsetMin: 0.14,
      flowerYOffsetMax: 0.22,
      yOffset: 0.02,
      randomSeed: 791440396
    }
  },
  {
    id: "flowerSprinkle-mqydkiqq-7",
    asset: "flowerSprinkle",
    position: {
      x: -9.389,
      y: 1.087,
      z: -2.289
    },
    rotation: {
      x: 0,
      y: 3.1,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 0.48,
      bladeCount: 0,
      hasFlowers: true,
      flowerCountMin: 2,
      flowerCountMax: 5,
      flowerSize: 0.36,
      flowerScale: 0.68,
      flowerYOffsetMin: 0.14,
      flowerYOffsetMax: 0.22,
      yOffset: 0.02,
      randomSeed: 835615746
    }
  },
  {
    id: "flowerSprinkle-mqydkmt2-8",
    asset: "flowerSprinkle",
    position: {
      x: -7.028,
      y: 0.223,
      z: 3.66
    },
    rotation: {
      x: 0,
      y: 1.128,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 0.48,
      bladeCount: 0,
      hasFlowers: true,
      flowerCountMin: 2,
      flowerCountMax: 5,
      flowerSize: 0.36,
      flowerScale: 0.68,
      flowerYOffsetMin: 0.14,
      flowerYOffsetMax: 0.22,
      yOffset: 0.02,
      randomSeed: 681690989
    }
  },
  {
    id: "flowerSprinkle-mqydknyv-9",
    asset: "flowerSprinkle",
    position: {
      x: -4.711,
      y: 0.223,
      z: 3.074
    },
    rotation: {
      x: 0,
      y: 3.329,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 0.48,
      bladeCount: 0,
      hasFlowers: true,
      flowerCountMin: 2,
      flowerCountMax: 5,
      flowerSize: 0.36,
      flowerScale: 0.68,
      flowerYOffsetMin: 0.14,
      flowerYOffsetMax: 0.22,
      yOffset: 0.02,
      randomSeed: 815512168
    }
  },
  {
    id: "flowerSprinkle-mqydkplo-10",
    asset: "flowerSprinkle",
    position: {
      x: -6.084,
      y: 0.223,
      z: 8.916
    },
    rotation: {
      x: 0,
      y: 5.136,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 0.48,
      bladeCount: 0,
      hasFlowers: true,
      flowerCountMin: 2,
      flowerCountMax: 5,
      flowerSize: 0.36,
      flowerScale: 0.68,
      flowerYOffsetMin: 0.14,
      flowerYOffsetMax: 0.22,
      yOffset: 0.02,
      randomSeed: 847071763
    }
  },
  {
    id: "flowerSprinkle-mqydkqpz-11",
    asset: "flowerSprinkle",
    position: {
      x: 4.632,
      y: 0.223,
      z: 5.223
    },
    rotation: {
      x: 0,
      y: 3.869,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 0.48,
      bladeCount: 0,
      hasFlowers: true,
      flowerCountMin: 2,
      flowerCountMax: 5,
      flowerSize: 0.36,
      flowerScale: 0.68,
      flowerYOffsetMin: 0.14,
      flowerYOffsetMax: 0.22,
      yOffset: 0.02,
      randomSeed: 858264904
    }
  },
  {
    id: "flowerSprinkle-mqydks30-12",
    asset: "flowerSprinkle",
    position: {
      x: -3.387,
      y: 0.223,
      z: -7.181
    },
    rotation: {
      x: 0,
      y: 2.099,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 0.48,
      bladeCount: 0,
      hasFlowers: true,
      flowerCountMin: 2,
      flowerCountMax: 5,
      flowerSize: 0.36,
      flowerScale: 0.68,
      flowerYOffsetMin: 0.14,
      flowerYOffsetMax: 0.22,
      yOffset: 0.02,
      randomSeed: 421520550
    }
  },
  {
    id: "flowerSprinkle-mqydksqf-13",
    asset: "flowerSprinkle",
    position: {
      x: 3.618,
      y: 0.223,
      z: -6.95
    },
    rotation: {
      x: 0,
      y: 5.968,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 0.48,
      bladeCount: 0,
      hasFlowers: true,
      flowerCountMin: 2,
      flowerCountMax: 5,
      flowerSize: 0.36,
      flowerScale: 0.68,
      flowerYOffsetMin: 0.14,
      flowerYOffsetMax: 0.22,
      yOffset: 0.02,
      randomSeed: 739015595
    }
  },
  {
    id: "flowerSprinkle-mqydkur9-14",
    asset: "flowerSprinkle",
    position: {
      x: 1.945,
      y: 0.223,
      z: -14.15
    },
    rotation: {
      x: 0,
      y: 1.704,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 0.48,
      bladeCount: 0,
      hasFlowers: true,
      flowerCountMin: 2,
      flowerCountMax: 5,
      flowerSize: 0.36,
      flowerScale: 0.68,
      flowerYOffsetMin: 0.14,
      flowerYOffsetMax: 0.22,
      yOffset: 0.02,
      randomSeed: 473739080
    }
  },
  {
    id: "flowerSprinkle-mqydkv8q-15",
    asset: "flowerSprinkle",
    position: {
      x: 4.035,
      y: 0.223,
      z: -12.295
    },
    rotation: {
      x: 0,
      y: 4.887,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 0.48,
      bladeCount: 0,
      hasFlowers: true,
      flowerCountMin: 2,
      flowerCountMax: 5,
      flowerSize: 0.36,
      flowerScale: 0.68,
      flowerYOffsetMin: 0.14,
      flowerYOffsetMax: 0.22,
      yOffset: 0.02,
      randomSeed: 78195902
    }
  },
  {
    id: "flowerSprinkle-mqydkw85-16",
    asset: "flowerSprinkle",
    position: {
      x: 5.102,
      y: 0.223,
      z: -10.691
    },
    rotation: {
      x: 0,
      y: 0.985,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 0.48,
      bladeCount: 0,
      hasFlowers: true,
      flowerCountMin: 2,
      flowerCountMax: 5,
      flowerSize: 0.36,
      flowerScale: 0.68,
      flowerYOffsetMin: 0.14,
      flowerYOffsetMax: 0.22,
      yOffset: 0.02,
      randomSeed: 349510656
    }
  },
  {
    id: "flowerSprinkle-mqydkx3r-17",
    asset: "flowerSprinkle",
    position: {
      x: -5.258,
      y: 0.223,
      z: -7.32
    },
    rotation: {
      x: 0,
      y: 5.88,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 0.48,
      bladeCount: 0,
      hasFlowers: true,
      flowerCountMin: 2,
      flowerCountMax: 5,
      flowerSize: 0.36,
      flowerScale: 0.68,
      flowerYOffsetMin: 0.14,
      flowerYOffsetMax: 0.22,
      yOffset: 0.02,
      randomSeed: 152399260
    }
  },
  {
    id: "flowerSprinkle-mqydkyq4-18",
    asset: "flowerSprinkle",
    position: {
      x: 4.224,
      y: 0.223,
      z: 1.227
    },
    rotation: {
      x: 0,
      y: 0.555,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 0.48,
      bladeCount: 0,
      hasFlowers: true,
      flowerCountMin: 2,
      flowerCountMax: 5,
      flowerSize: 0.36,
      flowerScale: 0.68,
      flowerYOffsetMin: 0.14,
      flowerYOffsetMax: 0.22,
      yOffset: 0.02,
      randomSeed: 413628203
    }
  },
  {
    id: "tree-0-mqydl5eq-1",
    asset: "tree-0",
    position: {
      x: -3.163,
      y: 3.166,
      z: -13.887
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    }
  },
  {
    id: "tree-1-mqydlk5t-1",
    asset: "tree-1",
    position: {
      x: 2.228,
      y: 2.772,
      z: 3.184
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    }
  },
  {
    id: "tree-3-mqydlz4d-1",
    asset: "tree-3",
    position: {
      x: 3.629,
      y: 3.493,
      z: -5.455
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    }
  },
  {
    id: "tree-4-mqydmsv6-1",
    asset: "tree-4",
    position: {
      x: -8.768,
      y: 3.803,
      z: -2.231
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    }
  },
  {
    id: "tree-3-mqydnma0-2",
    asset: "tree-3",
    position: {
      x: -6.388,
      y: 3.554,
      z: 8.981
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    }
  },
  {
    id: "bush-mqydoxlg-1",
    asset: "bush",
    position: {
      x: -7.317,
      y: 6.337,
      z: 8.186
    },
    rotation: {
      x: 0,
      y: 0.782,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 692995592
    }
  },
  {
    id: "bushCanopy-mqydpojk-1",
    asset: "bushCanopy",
    position: {
      x: 1.198,
      y: 4.974,
      z: 5.985
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 0.733,
      y: 0.733,
      z: 0.733
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 440916967
    }
  },
  {
    id: "bushLarge-mqydqnc1-2",
    asset: "bushLarge",
    position: {
      x: -9.869,
      y: 3.153,
      z: -2.337
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 0.341,
      y: 0.341,
      z: 0.341
    },
    bushOptions: {
      bushType: "default",
      leafCount: 78,
      baseScale: 1.15,
      distributionScale: 1.35,
      randomSeed: 474736399
    }
  },
  {
    id: "bushCanopy-mqydrrou-2",
    asset: "bushCanopy",
    position: {
      x: -7.53,
      y: 6.199,
      z: -1.983
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 0.766,
      y: 0.766,
      z: 0.766
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 524890148
    }
  },
  {
    id: "bushCanopy-mqyds3aa-3",
    asset: "bushCanopy",
    position: {
      x: -7.37,
      y: 3.052,
      z: -1.214
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 0.342,
      y: 0.342,
      z: 0.342
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 529615285
    }
  },
  {
    id: "bushCanopy-mqydtq5d-4",
    asset: "bushCanopy",
    position: {
      x: 4.415,
      y: 4.511,
      z: 1.705
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 358479942
    }
  },
  {
    id: "bushCanopy-mqydty43-5",
    asset: "bushCanopy",
    position: {
      x: 3.329,
      y: 6.202,
      z: 3.051
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 802264614
    }
  },
  {
    id: "bush-mqydu7a7-2",
    asset: "bush",
    position: {
      x: 1.558,
      y: 6.604,
      z: -5.165
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 356082283
    }
  },
  {
    id: "bush-mqydudvc-3",
    asset: "bush",
    position: {
      x: 3.423,
      y: 2.721,
      z: -6.36
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 0.44,
      y: 0.44,
      z: 0.44
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 728372313
    }
  },
  {
    id: "bush-mqydukqf-4",
    asset: "bush",
    position: {
      x: 3.939,
      y: 6.083,
      z: -3.296
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 802182868
    }
  },
  {
    id: "bush-mqydurye-5",
    asset: "bush",
    position: {
      x: 4.179,
      y: 6.262,
      z: -7.189
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 880491426
    }
  },
  {
    id: "bush-mqydx4q4-6",
    asset: "bush",
    position: {
      x: -2.898,
      y: 5.358,
      z: -12.487
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 605928017
    }
  },
  {
    id: "bush-mqydxcg3-7",
    asset: "bush",
    position: {
      x: -4.329,
      y: 6.604,
      z: -14.135
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 767656075
    }
  },
  {
    id: "bush-mqydxjlt-8",
    asset: "bush",
    position: {
      x: -5.38,
      y: 3.901,
      z: 8.589
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 0.522,
      y: 0.522,
      z: 0.522
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 266878711
    }
  },
  {
    id: "bush-mqydxwr0-9",
    asset: "bush",
    position: {
      x: -6.073,
      y: 4.014,
      z: 10.432
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 0.327,
      y: 0.327,
      z: 0.327
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 313999852
    }
  },
  {
    id: "bushSmall-mqye02jx-1",
    asset: "bushSmall",
    position: {
      x: -6.499,
      y: 2.82,
      z: 8.3
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 28,
      baseScale: 0.55,
      distributionScale: 0.7,
      randomSeed: 539747543
    }
  },
  {
    id: "bushSmall-mqye09ry-2",
    asset: "bushSmall",
    position: {
      x: -5.496,
      y: 7.204,
      z: 8.6
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 28,
      baseScale: 0.55,
      distributionScale: 0.7,
      randomSeed: 574420496
    }
  },
  {
    id: "bushSmall-mqye0hmi-3",
    asset: "bushSmall",
    position: {
      x: -7.009,
      y: 6.472,
      z: 10.387
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 28,
      baseScale: 0.55,
      distributionScale: 0.7,
      randomSeed: 874741365
    }
  },
  {
    id: "bushCanopy-mqye0r0p-6",
    asset: "bushCanopy",
    position: {
      x: -8.804,
      y: 5.074,
      z: -3.953
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 0.752,
      y: 0.752,
      z: 0.752
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 621280460
    }
  },
  {
    id: "bushCanopy-mqye1ba8-7",
    asset: "bushCanopy",
    position: {
      x: -9.444,
      y: 8.221,
      z: -2.556
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 0.743,
      y: 0.743,
      z: 0.743
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 817923762
    }
  },
  {
    id: "bushCanopy-mqye25t9-8",
    asset: "bushCanopy",
    position: {
      x: 4.009,
      y: 3.925,
      z: -4.343
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 0.228,
      y: 0.228,
      z: 0.228
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 428546104
    }
  },
  {
    id: "bush-mqye3p5p-10",
    asset: "bush",
    position: {
      x: 1.428,
      y: 3.029,
      z: 1.983
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 0.371,
      y: 0.371,
      z: 0.371
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 384496895
    }
  },
  {
    id: "bush-mqye4du2-11",
    asset: "bush",
    position: {
      x: 2.539,
      y: -0.352,
      z: -9.618
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 186002156
    }
  },
  {
    id: "bushLarge-mqye4p5v-3",
    asset: "bushLarge",
    position: {
      x: -7.509,
      y: 0,
      z: 11.072
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 78,
      baseScale: 1.15,
      distributionScale: 1.35,
      randomSeed: 885229556
    }
  },
  {
    id: "bushCanopy-mqye52py-9",
    asset: "bushCanopy",
    position: {
      x: -8.971,
      y: -0.237,
      z: 0.339
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 840362523
    }
  },
  {
    id: "proceduralGrass-mqye5g84-87",
    asset: "proceduralGrass",
    position: {
      x: -8.72,
      y: 0.097,
      z: 5.973
    },
    rotation: {
      x: 0,
      y: 3.601,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 988370675
    }
  },
  {
    id: "proceduralGrass-mqye5gmb-88",
    asset: "proceduralGrass",
    position: {
      x: -9.308,
      y: 0.097,
      z: 3.985
    },
    rotation: {
      x: 0,
      y: 4.637,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 237708848
    }
  },
  {
    id: "proceduralGrass-mqye5h33-89",
    asset: "proceduralGrass",
    position: {
      x: -11.532,
      y: 0.097,
      z: 3.043
    },
    rotation: {
      x: 0,
      y: 5.742,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 66051803
    }
  },
  {
    id: "proceduralGrass-mqye5hex-90",
    asset: "proceduralGrass",
    position: {
      x: -12.019,
      y: 0.097,
      z: 0.432
    },
    rotation: {
      x: 0,
      y: 0.184,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 187943042
    }
  },
  {
    id: "proceduralGrass-mqye5hz5-91",
    asset: "proceduralGrass",
    position: {
      x: -9.304,
      y: 0.097,
      z: -3.227
    },
    rotation: {
      x: 0,
      y: 1.612,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 95225165
    }
  },
  {
    id: "proceduralGrass-mqye5ih9-92",
    asset: "proceduralGrass",
    position: {
      x: -11.099,
      y: 0.097,
      z: 1.312
    },
    rotation: {
      x: 0,
      y: 3.143,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 14961887
    }
  },
  {
    id: "proceduralGrass-mqye5j21-93",
    asset: "proceduralGrass",
    position: {
      x: -8.539,
      y: 0.097,
      z: 2.548
    },
    rotation: {
      x: 0,
      y: 0.653,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 384316172
    }
  },
  {
    id: "proceduralGrass-mqye5joa-94",
    asset: "proceduralGrass",
    position: {
      x: -10.781,
      y: 0.097,
      z: 4.488
    },
    rotation: {
      x: 0,
      y: 3.53,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 646592546
    }
  },
  {
    id: "proceduralGrass-mqye5k7b-95",
    asset: "proceduralGrass",
    position: {
      x: -10.73,
      y: 0.097,
      z: 6.818
    },
    rotation: {
      x: 0,
      y: 1.679,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 536135035
    }
  },
  {
    id: "proceduralGrass-mqye5kla-96",
    asset: "proceduralGrass",
    position: {
      x: -13.612,
      y: 0.097,
      z: 7.556
    },
    rotation: {
      x: 0,
      y: 1.123,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 155016657
    }
  },
  {
    id: "proceduralGrass-mqye5l0d-97",
    asset: "proceduralGrass",
    position: {
      x: -12.539,
      y: 0.097,
      z: 4.562
    },
    rotation: {
      x: 0,
      y: 1.815,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 847633004
    }
  },
  {
    id: "proceduralGrass-mqye5lhk-98",
    asset: "proceduralGrass",
    position: {
      x: -13.453,
      y: 0.097,
      z: 2.713
    },
    rotation: {
      x: 0,
      y: 4.381,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 282710591
    }
  },
  {
    id: "proceduralGrass-mqye5ltc-99",
    asset: "proceduralGrass",
    position: {
      x: -13.859,
      y: 0.097,
      z: 1.412
    },
    rotation: {
      x: 0,
      y: 5.469,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 448481696
    }
  },
  {
    id: "proceduralGrass-mqye5m88-100",
    asset: "proceduralGrass",
    position: {
      x: -12.501,
      y: 0.097,
      z: -2.016
    },
    rotation: {
      x: 0,
      y: 6.213,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 337592546
    }
  },
  {
    id: "proceduralGrass-mqye5n4z-101",
    asset: "proceduralGrass",
    position: {
      x: -16.535,
      y: 0.097,
      z: 6.274
    },
    rotation: {
      x: 0,
      y: 5.087,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 862785764
    }
  },
  {
    id: "proceduralGrass-mqye5nrk-102",
    asset: "proceduralGrass",
    position: {
      x: -10.437,
      y: 0.097,
      z: -1.446
    },
    rotation: {
      x: 0,
      y: 4.011,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 677579439
    }
  },
  {
    id: "proceduralGrass-mqye5o3w-103",
    asset: "proceduralGrass",
    position: {
      x: -10.052,
      y: 0.097,
      z: -5.075
    },
    rotation: {
      x: 0,
      y: 5.825,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 46127839
    }
  },
  {
    id: "proceduralGrass-mqye5pjt-104",
    asset: "proceduralGrass",
    position: {
      x: -10.866,
      y: 0.097,
      z: -4.012
    },
    rotation: {
      x: 0,
      y: 1.599,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 578542409
    }
  },
  {
    id: "proceduralGrass-mqye5pu3-105",
    asset: "proceduralGrass",
    position: {
      x: -14.849,
      y: 0.097,
      z: -0.452
    },
    rotation: {
      x: 0,
      y: 3.886,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 871341242
    }
  },
  {
    id: "proceduralGrass-mqye5qj3-106",
    asset: "proceduralGrass",
    position: {
      x: -12.038,
      y: 0.097,
      z: 10.475
    },
    rotation: {
      x: 0,
      y: 4.549,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 454396583
    }
  },
  {
    id: "proceduralGrass-mqye5qws-107",
    asset: "proceduralGrass",
    position: {
      x: -6.331,
      y: 0.097,
      z: 5.269
    },
    rotation: {
      x: 0,
      y: 2.72,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 384771062
    }
  },
  {
    id: "proceduralGrass-mqye5rfx-108",
    asset: "proceduralGrass",
    position: {
      x: -10.181,
      y: 0.097,
      z: 8.683
    },
    rotation: {
      x: 0,
      y: 1.524,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 181786544
    }
  },
  {
    id: "proceduralGrass-mqye5s47-109",
    asset: "proceduralGrass",
    position: {
      x: -8.468,
      y: 0.097,
      z: 4.343
    },
    rotation: {
      x: 0,
      y: 5.338,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 149153211
    }
  },
  {
    id: "proceduralGrass-mqye5sup-110",
    asset: "proceduralGrass",
    position: {
      x: -8.638,
      y: 0.097,
      z: 9.502
    },
    rotation: {
      x: 0,
      y: 4.82,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 373757310
    }
  },
  {
    id: "proceduralGrass-mqye5td7-111",
    asset: "proceduralGrass",
    position: {
      x: -8.371,
      y: 0.097,
      z: 7.077
    },
    rotation: {
      x: 0,
      y: 4.549,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 409007759
    }
  },
  {
    id: "proceduralGrass-mqye5uh2-112",
    asset: "proceduralGrass",
    position: {
      x: -9.414,
      y: 0.097,
      z: 1.677
    },
    rotation: {
      x: 0,
      y: 0.891,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 835180184
    }
  },
  {
    id: "proceduralGrass-mqye5vg7-113",
    asset: "proceduralGrass",
    position: {
      x: -11.406,
      y: 0.097,
      z: 7.955
    },
    rotation: {
      x: 0,
      y: 5.417,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 658293125
    }
  },
  {
    id: "proceduralGrass-mqye5vx8-114",
    asset: "proceduralGrass",
    position: {
      x: -10.625,
      y: 0.097,
      z: 10.63
    },
    rotation: {
      x: 0,
      y: 4.349,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 359920492
    }
  },
  {
    id: "proceduralGrass-mqye5wav-115",
    asset: "proceduralGrass",
    position: {
      x: -9.317,
      y: 0.097,
      z: 11.91
    },
    rotation: {
      x: 0,
      y: 4.526,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 636216301
    }
  },
  {
    id: "proceduralGrass-mqye5wqp-116",
    asset: "proceduralGrass",
    position: {
      x: -7.895,
      y: 0.097,
      z: 12.512
    },
    rotation: {
      x: 0,
      y: 0.864,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 242137617
    }
  },
  {
    id: "proceduralGrass-mqye5x3f-117",
    asset: "proceduralGrass",
    position: {
      x: -4.272,
      y: 0.097,
      z: 11.612
    },
    rotation: {
      x: 0,
      y: 3.152,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 1265569
    }
  },
  {
    id: "proceduralGrass-mqye5ycr-118",
    asset: "proceduralGrass",
    position: {
      x: 2.696,
      y: 0.097,
      z: 8.846
    },
    rotation: {
      x: 0,
      y: 2.096,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 138860909
    }
  },
  {
    id: "proceduralGrass-mqye5ytf-119",
    asset: "proceduralGrass",
    position: {
      x: 5.373,
      y: 0.097,
      z: 7.244
    },
    rotation: {
      x: 0,
      y: 3.46,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 879120427
    }
  },
  {
    id: "proceduralGrass-mqye5zem-120",
    asset: "proceduralGrass",
    position: {
      x: 9.502,
      y: 0.097,
      z: 4.248
    },
    rotation: {
      x: 0,
      y: 5.777,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 962866417
    }
  },
  {
    id: "proceduralGrass-mqye60cz-121",
    asset: "proceduralGrass",
    position: {
      x: 11.266,
      y: 0.097,
      z: -0.439
    },
    rotation: {
      x: 0,
      y: 0.289,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 411543732
    }
  },
  {
    id: "proceduralGrass-mqye61sx-122",
    asset: "proceduralGrass",
    position: {
      x: 6.608,
      y: 0.097,
      z: -6.757
    },
    rotation: {
      x: 0,
      y: 5.22,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 539477295
    }
  },
  {
    id: "proceduralGrass-mqye62zu-123",
    asset: "proceduralGrass",
    position: {
      x: 9.903,
      y: 0.097,
      z: -5.906
    },
    rotation: {
      x: 0,
      y: 0.632,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 746800347
    }
  },
  {
    id: "proceduralGrass-mqye63s8-124",
    asset: "proceduralGrass",
    position: {
      x: 8.401,
      y: 0.097,
      z: -4.236
    },
    rotation: {
      x: 0,
      y: 2.304,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 921775479
    }
  },
  {
    id: "proceduralGrass-mqye64mw-125",
    asset: "proceduralGrass",
    position: {
      x: 6.611,
      y: 0.097,
      z: -13.091
    },
    rotation: {
      x: 0,
      y: 5.988,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 826976934
    }
  },
  {
    id: "proceduralGrass-mqye658h-126",
    asset: "proceduralGrass",
    position: {
      x: 0.727,
      y: 0.097,
      z: -15.501
    },
    rotation: {
      x: 0,
      y: 4.582,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 274866258
    }
  },
  {
    id: "proceduralGrass-mqye65ic-127",
    asset: "proceduralGrass",
    position: {
      x: -1.898,
      y: 0.097,
      z: -13.882
    },
    rotation: {
      x: 0,
      y: 2.656,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 627367899
    }
  },
  {
    id: "proceduralGrass-mqye65zy-128",
    asset: "proceduralGrass",
    position: {
      x: -4.325,
      y: 0.097,
      z: -14.222
    },
    rotation: {
      x: 0,
      y: 3.857,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 831682047
    }
  },
  {
    id: "proceduralGrass-mqye66om-129",
    asset: "proceduralGrass",
    position: {
      x: -6.663,
      y: 0.097,
      z: -12.332
    },
    rotation: {
      x: 0,
      y: 3.903,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 538970187
    }
  },
  {
    id: "proceduralGrass-mqye6766-130",
    asset: "proceduralGrass",
    position: {
      x: -8.288,
      y: 0.097,
      z: -10.471
    },
    rotation: {
      x: 0,
      y: 4.512,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 946727973
    }
  },
  {
    id: "proceduralGrass-mqye67ip-131",
    asset: "proceduralGrass",
    position: {
      x: -9.131,
      y: 0.092,
      z: -8.401
    },
    rotation: {
      x: 0,
      y: 1.086,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 528770075
    }
  },
  {
    id: "proceduralGrass-mqye68ao-132",
    asset: "proceduralGrass",
    position: {
      x: -11.054,
      y: 0.097,
      z: -6.394
    },
    rotation: {
      x: 0,
      y: 0.274,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 53144464
    }
  },
  {
    id: "proceduralGrass-mqye68qy-133",
    asset: "proceduralGrass",
    position: {
      x: -12.631,
      y: 0.097,
      z: -4.86
    },
    rotation: {
      x: 0,
      y: 4.308,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 650012558
    }
  },
  {
    id: "proceduralGrass-mqye690x-134",
    asset: "proceduralGrass",
    position: {
      x: -13.927,
      y: 0.097,
      z: -3.866
    },
    rotation: {
      x: 0,
      y: 4.948,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 761530573
    }
  },
  {
    id: "proceduralGrass-mqye6ac3-135",
    asset: "proceduralGrass",
    position: {
      x: -15.144,
      y: 0.097,
      z: 0.631
    },
    rotation: {
      x: 0,
      y: 3.057,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 474565555
    }
  },
  {
    id: "proceduralGrass-mqye6aub-136",
    asset: "proceduralGrass",
    position: {
      x: -12.646,
      y: 0.097,
      z: -1.142
    },
    rotation: {
      x: 0,
      y: 2.31,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 84902465
    }
  },
  {
    id: "proceduralGrass-mqye6b7j-137",
    asset: "proceduralGrass",
    position: {
      x: -14.215,
      y: 0.097,
      z: -3.397
    },
    rotation: {
      x: 0,
      y: 0.743,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 335641555
    }
  },
  {
    id: "proceduralGrass-mqye6d2g-138",
    asset: "proceduralGrass",
    position: {
      x: -11.301,
      y: 0.097,
      z: 9.567
    },
    rotation: {
      x: 0,
      y: 4.394,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 195027641
    }
  },
  {
    id: "proceduralGrass-mqye6dhu-139",
    asset: "proceduralGrass",
    position: {
      x: -12.356,
      y: 0.097,
      z: 8.63
    },
    rotation: {
      x: 0,
      y: 3.452,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 246437931
    }
  },
  {
    id: "proceduralGrass-mqye6dzn-140",
    asset: "proceduralGrass",
    position: {
      x: -11.991,
      y: 0.097,
      z: 6.072
    },
    rotation: {
      x: 0,
      y: 3.729,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 547519455
    }
  },
  {
    id: "bushCanopy-mqye6i2e-10",
    asset: "bushCanopy",
    position: {
      x: -11.556,
      y: 0,
      z: 12.688
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 2.051,
      y: 2.051,
      z: 2.051
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 272074201
    }
  },
  {
    id: "bushCanopy-mqye78m1-11",
    asset: "bushCanopy",
    position: {
      x: -5.341,
      y: 0,
      z: 25.165
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 2.714,
      y: 2.714,
      z: 2.714
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 245277741
    }
  },
  {
    id: "bushCanopy-mqye7cvf-12",
    asset: "bushCanopy",
    position: {
      x: -9.914,
      y: 0,
      z: 22.945
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1.967,
      y: 1.967,
      z: 1.967
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 405354316
    }
  },
  {
    id: "bush-mqye87pt-12",
    asset: "bush",
    position: {
      x: 0,
      y: 0,
      z: 24.824
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1.964,
      y: 1.964,
      z: 1.964
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 390305175
    }
  },
  {
    id: "bush-mqye8isp-13",
    asset: "bush",
    position: {
      x: 0,
      y: 0,
      z: 13.842
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 525875126
    }
  },
  {
    id: "bushCanopy-mqye8lft-13",
    asset: "bushCanopy",
    position: {
      x: 5.91,
      y: 0,
      z: 28.822
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1.831,
      y: 1.831,
      z: 1.831
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 608214688
    }
  },
  {
    id: "bushCanopy-mqye9i2s-14",
    asset: "bushCanopy",
    position: {
      x: 12.846,
      y: 0,
      z: 12.2
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 832978994
    }
  },
  {
    id: "bushLarge-mqye9wr0-4",
    asset: "bushLarge",
    position: {
      x: 10.116,
      y: 0,
      z: 23.791
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 78,
      baseScale: 1.15,
      distributionScale: 1.35,
      randomSeed: 671148899
    }
  },
  {
    id: "bushLarge-mqyea3s1-5",
    asset: "bushLarge",
    position: {
      x: 19.664,
      y: 0,
      z: 21.625
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 78,
      baseScale: 1.15,
      distributionScale: 1.35,
      randomSeed: 630722888
    }
  },
  {
    id: "bushLarge-mqyeaaw7-6",
    asset: "bushLarge",
    position: {
      x: 25.747,
      y: 0,
      z: 17.959
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 78,
      baseScale: 1.15,
      distributionScale: 1.35,
      randomSeed: 66389218
    }
  },
  {
    id: "bushLarge-mqyeam2k-7",
    asset: "bushLarge",
    position: {
      x: 27.819,
      y: 0,
      z: 11.443
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 78,
      baseScale: 1.15,
      distributionScale: 1.35,
      randomSeed: 776334782
    }
  },
  {
    id: "bushCanopy-mqyebing-15",
    asset: "bushCanopy",
    position: {
      x: 28.843,
      y: 0,
      z: -1.929
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 73455928
    }
  },
  {
    id: "bushCanopy-mqyeiena-16",
    asset: "bushCanopy",
    position: {
      x: 19.495,
      y: 0.047,
      z: 19.042
    },
    rotation: {
      x: 0,
      y: 4.904,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 938901459
    }
  },
  {
    id: "bushCanopy-mqyeifew-17",
    asset: "bushCanopy",
    position: {
      x: 22.237,
      y: 0.047,
      z: 18.314
    },
    rotation: {
      x: 0,
      y: 2.108,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 939522988
    }
  },
  {
    id: "bush-mqyeiht5-14",
    asset: "bush",
    position: {
      x: 22.812,
      y: 0.047,
      z: 16.375
    },
    rotation: {
      x: 0,
      y: 0.322,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 421770945
    }
  },
  {
    id: "bush-mqyeijib-15",
    asset: "bush",
    position: {
      x: 29.471,
      y: 0.047,
      z: -4.679
    },
    rotation: {
      x: 0,
      y: 2.968,
      z: 0
    },
    scale: {
      x: 2.145,
      y: 2.145,
      z: 2.145
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 895678240
    }
  },
  {
    id: "bush-mqyeio0k-16",
    asset: "bush",
    position: {
      x: 0,
      y: 0,
      z: 12.8
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 406395851
    }
  },
  {
    id: "bush-mqyeioib-17",
    asset: "bush",
    position: {
      x: 28.878,
      y: 0.047,
      z: -5.059
    },
    rotation: {
      x: 0,
      y: 0.895,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 6645013
    }
  },
  {
    id: "bushCanopy-mqyeit8y-18",
    asset: "bushCanopy",
    position: {
      x: 26.72,
      y: 0.047,
      z: -13.3
    },
    rotation: {
      x: 0,
      y: 0.037,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 370165368
    }
  },
  {
    id: "bush-mqyeiunb-18",
    asset: "bush",
    position: {
      x: 25.459,
      y: 0.047,
      z: -15.626
    },
    rotation: {
      x: 0,
      y: 5.174,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 311847404
    }
  },
  {
    id: "bush-mqyeiwz8-19",
    asset: "bush",
    position: {
      x: 0,
      y: 0,
      z: 13.7
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 336268421
    }
  },
  {
    id: "bush-mqyeix9z-20",
    asset: "bush",
    position: {
      x: 23.63,
      y: 0.047,
      z: -14.523
    },
    rotation: {
      x: 0,
      y: 1.269,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 134554899
    }
  },
  {
    id: "bushCanopy-mqyej1iz-19",
    asset: "bushCanopy",
    position: {
      x: 21.567,
      y: 0.047,
      z: -20.404
    },
    rotation: {
      x: 0,
      y: 4.801,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 290252867
    }
  },
  {
    id: "bushCanopy-mqyej2ci-20",
    asset: "bushCanopy",
    position: {
      x: 20.364,
      y: 0.047,
      z: -22.06
    },
    rotation: {
      x: 0,
      y: 3.575,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 429399940
    }
  },
  {
    id: "bush-mqyej42e-21",
    asset: "bush",
    position: {
      x: 19.778,
      y: 0.047,
      z: -20.087
    },
    rotation: {
      x: 0,
      y: 0.653,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 417575580
    }
  },
  {
    id: "bush-mqyej58h-22",
    asset: "bush",
    position: {
      x: 18.284,
      y: 0.047,
      z: -20.532
    },
    rotation: {
      x: 0,
      y: 3.107,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 123813730
    }
  },
  {
    id: "bush-mqyej635-23",
    asset: "bush",
    position: {
      x: 15.414,
      y: 0.047,
      z: -23.78
    },
    rotation: {
      x: 0,
      y: 3.694,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 416842642
    }
  },
  {
    id: "bush-mqyej6ej-24",
    asset: "bush",
    position: {
      x: 16.47,
      y: 0.047,
      z: -24.99
    },
    rotation: {
      x: 0,
      y: 1.07,
      z: 0
    },
    scale: {
      x: 2.258,
      y: 2.258,
      z: 2.258
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 52753224
    }
  },
  {
    id: "bush-mqyej8u7-25",
    asset: "bush",
    position: {
      x: 16.757,
      y: 0.047,
      z: -24.042
    },
    rotation: {
      x: 0,
      y: 3.119,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 845098406
    }
  },
  {
    id: "bush-mqyej9hy-26",
    asset: "bush",
    position: {
      x: 6.433,
      y: 0.047,
      z: -28.801
    },
    rotation: {
      x: 0,
      y: 2.871,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 645553326
    }
  },
  {
    id: "bush-mqyeja5g-27",
    asset: "bush",
    position: {
      x: 7.327,
      y: 0.047,
      z: -24.636
    },
    rotation: {
      x: 0,
      y: 3.306,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 30945485
    }
  },
  {
    id: "bush-mqyejfzx-28",
    asset: "bush",
    position: {
      x: 0,
      y: 0,
      z: 16.4
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 709581167
    }
  },
  {
    id: "bush-mqyejgyv-29",
    asset: "bush",
    position: {
      x: 8.895,
      y: 0.047,
      z: -20.29
    },
    rotation: {
      x: 0,
      y: 3.315,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 303707597
    }
  },
  {
    id: "bush-mqyejj40-30",
    asset: "bush",
    position: {
      x: 1.507,
      y: -0.213,
      z: 1.935
    },
    rotation: {
      x: 0,
      y: 4.819,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 8412195
    }
  },
  {
    id: "bush-mqyejl2m-31",
    asset: "bush",
    position: {
      x: 6.305,
      y: 0.047,
      z: -11.201
    },
    rotation: {
      x: 0,
      y: 2.562,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 543650195
    }
  },
  {
    id: "bush-mqyejltw-32",
    asset: "bush",
    position: {
      x: 11.338,
      y: 0.047,
      z: -21.84
    },
    rotation: {
      x: 0,
      y: 0.976,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 759478079
    }
  },
  {
    id: "bush-mqyejpwu-33",
    asset: "bush",
    position: {
      x: 11.401,
      y: 0.047,
      z: -27.638
    },
    rotation: {
      x: 0,
      y: 0.489,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 485194941
    }
  },
  {
    id: "bush-mqyejqad-34",
    asset: "bush",
    position: {
      x: 10.246,
      y: 0.047,
      z: -27.47
    },
    rotation: {
      x: 0,
      y: 4.188,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 882945289
    }
  },
  {
    id: "bush-mqyejr0h-35",
    asset: "bush",
    position: {
      x: 0.076,
      y: 0.047,
      z: -29.567
    },
    rotation: {
      x: 0,
      y: 0.481,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 460596763
    }
  },
  {
    id: "bush-mqyejtk9-36",
    asset: "bush",
    position: {
      x: 5.512,
      y: 0.047,
      z: -7.928
    },
    rotation: {
      x: 0,
      y: 0.047,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 746695829
    }
  },
  {
    id: "bush-mqyejv01-37",
    asset: "bush",
    position: {
      x: -0.554,
      y: 0.047,
      z: -29.582
    },
    rotation: {
      x: 0,
      y: 1.043,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 187731613
    }
  },
  {
    id: "bushCanopy-mqyejyrl-21",
    asset: "bushCanopy",
    position: {
      x: -10.339,
      y: 0.047,
      z: -27.746
    },
    rotation: {
      x: 0,
      y: 6.256,
      z: 0
    },
    scale: {
      x: 1.885,
      y: 1.885,
      z: 1.885
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 676862499
    }
  },
  {
    id: "bushCanopy-mqyek308-22",
    asset: "bushCanopy",
    position: {
      x: -6.325,
      y: 0.047,
      z: -28.012
    },
    rotation: {
      x: 0,
      y: 4.377,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 968608749
    }
  },
  {
    id: "bush-mqyek4gl-38",
    asset: "bush",
    position: {
      x: -6.928,
      y: 0.047,
      z: -26.507
    },
    rotation: {
      x: 0,
      y: 0.268,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 670537813
    }
  },
  {
    id: "bush-mqyek51q-39",
    asset: "bush",
    position: {
      x: -7.564,
      y: 0.047,
      z: -28.788
    },
    rotation: {
      x: 0,
      y: 4.624,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 142163621
    }
  },
  {
    id: "bush-mqyek5hn-40",
    asset: "bush",
    position: {
      x: -7.993,
      y: 0.047,
      z: -25.805
    },
    rotation: {
      x: 0,
      y: 0.002,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 753710431
    }
  },
  {
    id: "bush-mqyek6ma-41",
    asset: "bush",
    position: {
      x: -15.439,
      y: 0.047,
      z: -25.322
    },
    rotation: {
      x: 0,
      y: 4.403,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 337021102
    }
  },
  {
    id: "bush-mqyek7cd-42",
    asset: "bush",
    position: {
      x: -16.615,
      y: 0.047,
      z: -24.616
    },
    rotation: {
      x: 0,
      y: 3.102,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 231087758
    }
  },
  {
    id: "bushCanopy-mqyek95w-23",
    asset: "bushCanopy",
    position: {
      x: -17.622,
      y: 0.047,
      z: -23.621
    },
    rotation: {
      x: 0,
      y: 4.32,
      z: 0
    },
    scale: {
      x: 1.656,
      y: 1.656,
      z: 1.656
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 275277497
    }
  },
  {
    id: "bushCanopy-mqyekaew-24",
    asset: "bushCanopy",
    position: {
      x: -17.244,
      y: 0.047,
      z: -23.804
    },
    rotation: {
      x: 0,
      y: 0.34,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 662768576
    }
  },
  {
    id: "bushCanopy-mqyekbh4-25",
    asset: "bushCanopy",
    position: {
      x: -22.071,
      y: 0.047,
      z: -20.074
    },
    rotation: {
      x: 0,
      y: 3.969,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 720501979
    }
  },
  {
    id: "bushCanopy-mqyekc0r-26",
    asset: "bushCanopy",
    position: {
      x: -23.355,
      y: 0.047,
      z: -18.767
    },
    rotation: {
      x: 0,
      y: 5.115,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 548437095
    }
  },
  {
    id: "bush-mqyekdhl-43",
    asset: "bush",
    position: {
      x: -22.732,
      y: 0.047,
      z: -17.38
    },
    rotation: {
      x: 0,
      y: 2.927,
      z: 0
    },
    scale: {
      x: 2.182,
      y: 2.182,
      z: 2.182
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 532168782
    }
  },
  {
    id: "bush-mqyekfmu-44",
    asset: "bush",
    position: {
      x: -23.315,
      y: 0.047,
      z: -18.259
    },
    rotation: {
      x: 0,
      y: 3.957,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 798788294
    }
  },
  {
    id: "bush-mqyekgvm-45",
    asset: "bush",
    position: {
      x: -28.877,
      y: 0.047,
      z: -7.842
    },
    rotation: {
      x: 0,
      y: 5.493,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 450324352
    }
  },
  {
    id: "bush-mqyekhza-46",
    asset: "bush",
    position: {
      x: -27.147,
      y: 0.047,
      z: -9.706
    },
    rotation: {
      x: 0,
      y: 3.885,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 816457626
    }
  },
  {
    id: "bush-mqyekib9-47",
    asset: "bush",
    position: {
      x: -27.116,
      y: 0.047,
      z: -7.107
    },
    rotation: {
      x: 0,
      y: 5.065,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 132693515
    }
  },
  {
    id: "bush-mqyekjnq-48",
    asset: "bush",
    position: {
      x: -29.882,
      y: 0.047,
      z: -0.172
    },
    rotation: {
      x: 0,
      y: 2.441,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 771160894
    }
  },
  {
    id: "bush-mqyekk7j-49",
    asset: "bush",
    position: {
      x: -28.818,
      y: 0.047,
      z: 1.622
    },
    rotation: {
      x: 0,
      y: 5.623,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 842272192
    }
  },
  {
    id: "bushCanopy-mqyekmg2-27",
    asset: "bushCanopy",
    position: {
      x: -29.581,
      y: 0.047,
      z: 4.289
    },
    rotation: {
      x: 0,
      y: 4.473,
      z: 0
    },
    scale: {
      x: 0.015,
      y: 0.015,
      z: 0.015
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 375780364
    }
  },
  {
    id: "bushCanopy-mqyekw6t-28",
    asset: "bushCanopy",
    position: {
      x: -29.534,
      y: 0.047,
      z: 3.535
    },
    rotation: {
      x: 0,
      y: 0.628,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 883308207
    }
  },
  {
    id: "bushCanopy-mqyekwz5-29",
    asset: "bushCanopy",
    position: {
      x: -28.57,
      y: 0.047,
      z: 4.131
    },
    rotation: {
      x: 0,
      y: 2.891,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 164939747
    }
  },
  {
    id: "bushCanopy-mqyekxpd-30",
    asset: "bushCanopy",
    position: {
      x: -27.856,
      y: 0.047,
      z: 10.454
    },
    rotation: {
      x: 0,
      y: 6.089,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "tree",
      leafCount: 72,
      baseScale: 1,
      distributionScale: 1.25,
      randomSeed: 674693507
    }
  },
  {
    id: "bush-mqyekz4h-50",
    asset: "bush",
    position: {
      x: -28.233,
      y: 0.047,
      z: 8.171
    },
    rotation: {
      x: 0,
      y: 0.378,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 534446093
    }
  },
  {
    id: "bush-mqyekzkw-51",
    asset: "bush",
    position: {
      x: -26.927,
      y: 0.047,
      z: 9.32
    },
    rotation: {
      x: 0,
      y: 4.595,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 481343382
    }
  },
  {
    id: "bush-mqyekzxn-52",
    asset: "bush",
    position: {
      x: -24.712,
      y: 0.047,
      z: 14.242
    },
    rotation: {
      x: 0,
      y: 2.738,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 507934913
    }
  },
  {
    id: "bush-mqyel09n-53",
    asset: "bush",
    position: {
      x: -23.96,
      y: 0.047,
      z: 15.535
    },
    rotation: {
      x: 0,
      y: 0.786,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 330269736
    }
  },
  {
    id: "bush-mqyel12d-54",
    asset: "bush",
    position: {
      x: -20.745,
      y: 0.047,
      z: 14.462
    },
    rotation: {
      x: 0,
      y: 0.9,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 950873239
    }
  },
  {
    id: "bush-mqyel1m1-55",
    asset: "bush",
    position: {
      x: -18.788,
      y: 0.047,
      z: 20.916
    },
    rotation: {
      x: 0,
      y: 1.303,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 158765429
    }
  },
  {
    id: "bush-mqyel1zc-56",
    asset: "bush",
    position: {
      x: -20.192,
      y: 0.047,
      z: 21.912
    },
    rotation: {
      x: 0,
      y: 0.99,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 722265452
    }
  },
  {
    id: "bush-mqyel2q2-57",
    asset: "bush",
    position: {
      x: -18.068,
      y: 0.047,
      z: 21.556
    },
    rotation: {
      x: 0,
      y: 5.738,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 963559129
    }
  },
  {
    id: "bush-mqyel3oc-58",
    asset: "bush",
    position: {
      x: -15.763,
      y: 0.047,
      z: 25.225
    },
    rotation: {
      x: 0,
      y: 1.587,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 481799014
    }
  },
  {
    id: "bush-mqyel4hv-59",
    asset: "bush",
    position: {
      x: -14.543,
      y: 0.047,
      z: 24.177
    },
    rotation: {
      x: 0,
      y: 4.961,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 598672818
    }
  },
  {
    id: "proceduralGrass-mqyelahd-141",
    asset: "proceduralGrass",
    position: {
      x: 5.445,
      y: 0.097,
      z: 11.626
    },
    rotation: {
      x: 0,
      y: 0.939,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 500906884
    }
  },
  {
    id: "proceduralGrass-mqyelasl-142",
    asset: "proceduralGrass",
    position: {
      x: 6.871,
      y: 0.097,
      z: 15.883
    },
    rotation: {
      x: 0,
      y: 0.256,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 224465864
    }
  },
  {
    id: "proceduralGrass-mqyelbfj-143",
    asset: "proceduralGrass",
    position: {
      x: 2.854,
      y: 0.097,
      z: 22.959
    },
    rotation: {
      x: 0,
      y: 3.521,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 941044380
    }
  },
  {
    id: "proceduralGrass-mqyelc43-144",
    asset: "proceduralGrass",
    position: {
      x: 5.554,
      y: 0.097,
      z: 24.555
    },
    rotation: {
      x: 0,
      y: 6.189,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 970343456
    }
  },
  {
    id: "proceduralGrass-mqyelcxy-145",
    asset: "proceduralGrass",
    position: {
      x: 5.94,
      y: 0.097,
      z: 14.159
    },
    rotation: {
      x: 0,
      y: 0.116,
      z: 0
    },
    scale: {
      x: 1.002,
      y: 1.002,
      z: 1.002
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 80028138
    }
  },
  {
    id: "proceduralGrass-mqyeldr9-146",
    asset: "proceduralGrass",
    position: {
      x: 3.788,
      y: 0.097,
      z: 18.276
    },
    rotation: {
      x: 0,
      y: 0.856,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 429744138
    }
  },
  {
    id: "proceduralGrass-mqyelea1-147",
    asset: "proceduralGrass",
    position: {
      x: 4.77,
      y: 0.097,
      z: 22.116
    },
    rotation: {
      x: 0,
      y: 1.256,
      z: 0
    },
    scale: {
      x: 1.766,
      y: 1.766,
      z: 1.766
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 524632307
    }
  },
  {
    id: "proceduralGrass-mqyelhv1-148",
    asset: "proceduralGrass",
    position: {
      x: 7.212,
      y: 0.097,
      z: 25.877
    },
    rotation: {
      x: 0,
      y: 2.467,
      z: 0
    },
    scale: {
      x: 2.192,
      y: 2.192,
      z: 2.192
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 569949361
    }
  },
  {
    id: "proceduralGrass-mqyelk3v-149",
    asset: "proceduralGrass",
    position: {
      x: 11.007,
      y: 0.097,
      z: 15.318
    },
    rotation: {
      x: 0,
      y: 2.539,
      z: 0
    },
    scale: {
      x: 1.943,
      y: 1.943,
      z: 1.943
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 326705094
    }
  },
  {
    id: "proceduralGrass-mqyellgo-150",
    asset: "proceduralGrass",
    position: {
      x: 11.969,
      y: 0.097,
      z: 20.655
    },
    rotation: {
      x: 0,
      y: 4.616,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 592489635
    }
  },
  {
    id: "proceduralGrass-mqyelm23-151",
    asset: "proceduralGrass",
    position: {
      x: 8.006,
      y: 0.097,
      z: 20.533
    },
    rotation: {
      x: 0,
      y: 4.967,
      z: 0
    },
    scale: {
      x: 0.909,
      y: 0.909,
      z: 0.909
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 283241528
    }
  },
  {
    id: "proceduralGrass-mqyelper-152",
    asset: "proceduralGrass",
    position: {
      x: 10.801,
      y: 0.097,
      z: 21.672
    },
    rotation: {
      x: 0,
      y: 0.828,
      z: 0
    },
    scale: {
      x: 1.582,
      y: 1.582,
      z: 1.582
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 155175731
    }
  },
  {
    id: "proceduralGrass-mqyelsw3-153",
    asset: "proceduralGrass",
    position: {
      x: 2.719,
      y: 0.097,
      z: 27.242
    },
    rotation: {
      x: 0,
      y: 4.07,
      z: 0
    },
    scale: {
      x: 1.714,
      y: 1.714,
      z: 1.714
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 271774374
    }
  },
  {
    id: "proceduralGrass-mqyelvi2-154",
    asset: "proceduralGrass",
    position: {
      x: 3.254,
      y: 0.097,
      z: 30.534
    },
    rotation: {
      x: 0,
      y: 1.501,
      z: 0
    },
    scale: {
      x: 1.199,
      y: 1.199,
      z: 1.199
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 237349697
    }
  },
  {
    id: "proceduralGrass-mqyelyq7-155",
    asset: "proceduralGrass",
    position: {
      x: 9.875,
      y: 0.097,
      z: -8.189
    },
    rotation: {
      x: 0,
      y: 1.102,
      z: 0
    },
    scale: {
      x: 1.569,
      y: 1.569,
      z: 1.569
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 970948303
    }
  },
  {
    id: "proceduralGrass-mqyem1f3-156",
    asset: "proceduralGrass",
    position: {
      x: 13.201,
      y: 0.097,
      z: -6.25
    },
    rotation: {
      x: 0,
      y: 2.981,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 62730130
    }
  },
  {
    id: "proceduralGrass-mqyem43s-157",
    asset: "proceduralGrass",
    position: {
      x: 20.152,
      y: 0.097,
      z: -14.908
    },
    rotation: {
      x: 0,
      y: 4.141,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 100556911
    }
  },
  {
    id: "proceduralGrass-mqyem4ts-158",
    asset: "proceduralGrass",
    position: {
      x: 19.429,
      y: 0.097,
      z: -16.117
    },
    rotation: {
      x: 0,
      y: 6.181,
      z: 0
    },
    scale: {
      x: 2.106,
      y: 2.106,
      z: 2.106
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 692842565
    }
  },
  {
    id: "proceduralGrass-mqyem764-159",
    asset: "proceduralGrass",
    position: {
      x: 21.494,
      y: 0.097,
      z: -17.147
    },
    rotation: {
      x: 0,
      y: 1.088,
      z: 0
    },
    scale: {
      x: 2.252,
      y: 2.252,
      z: 2.252
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 29489712
    }
  },
  {
    id: "proceduralGrass-mqyem9d0-160",
    asset: "proceduralGrass",
    position: {
      x: 20.501,
      y: 0.097,
      z: -10.056
    },
    rotation: {
      x: 0,
      y: 3.42,
      z: 0
    },
    scale: {
      x: 1.619,
      y: 1.619,
      z: 1.619
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 277159014
    }
  },
  {
    id: "proceduralGrass-mqyemc82-161",
    asset: "proceduralGrass",
    position: {
      x: 8.806,
      y: 0.097,
      z: 13.917
    },
    rotation: {
      x: 0,
      y: 1.468,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 233951380
    }
  },
  {
    id: "proceduralGrass-mqyemhnh-162",
    asset: "proceduralGrass",
    position: {
      x: -26.336,
      y: 0.097,
      z: -3.985
    },
    rotation: {
      x: 0,
      y: 2.06,
      z: 0
    },
    scale: {
      x: 2.181,
      y: 2.181,
      z: 2.181
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 199642357
    }
  },
  {
    id: "proceduralGrass-mqyemjju-163",
    asset: "proceduralGrass",
    position: {
      x: -24.089,
      y: 0.097,
      z: -0.174
    },
    rotation: {
      x: 0,
      y: 2.01,
      z: 0
    },
    scale: {
      x: 2.462,
      y: 2.462,
      z: 2.462
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 750193139
    }
  },
  {
    id: "proceduralGrass-mqyemkwn-164",
    asset: "proceduralGrass",
    position: {
      x: -28.481,
      y: 0.097,
      z: -1.745
    },
    rotation: {
      x: 0,
      y: 5.287,
      z: 0
    },
    scale: {
      x: 2.041,
      y: 2.041,
      z: 2.041
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 497264467
    }
  },
  {
    id: "proceduralGrass-mqyemme9-165",
    asset: "proceduralGrass",
    position: {
      x: -28.838,
      y: 0.097,
      z: -4.467
    },
    rotation: {
      x: 0,
      y: 0.18,
      z: 0
    },
    scale: {
      x: 3.337,
      y: 3.337,
      z: 3.337
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 889433659
    }
  },
  {
    id: "proceduralGrass-mqyemp5o-166",
    asset: "proceduralGrass",
    position: {
      x: -19.964,
      y: 0.097,
      z: -7.809
    },
    rotation: {
      x: 0,
      y: 4.213,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 754833199
    }
  },
  {
    id: "proceduralGrass-mqyemqfq-167",
    asset: "proceduralGrass",
    position: {
      x: -25.092,
      y: 0.097,
      z: -14.545
    },
    rotation: {
      x: 0,
      y: 5.831,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 447943805
    }
  },
  {
    id: "proceduralGrass-mqyemr50-168",
    asset: "proceduralGrass",
    position: {
      x: -24.814,
      y: 0.097,
      z: -11.99
    },
    rotation: {
      x: 0,
      y: 0.57,
      z: 0
    },
    scale: {
      x: 2.686,
      y: 2.686,
      z: 2.686
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 3157783
    }
  },
  {
    id: "proceduralGrass-mqyemsi0-169",
    asset: "proceduralGrass",
    position: {
      x: -26.469,
      y: 0.097,
      z: -13.491
    },
    rotation: {
      x: 0,
      y: 4.058,
      z: 0
    },
    scale: {
      x: 2.88,
      y: 2.88,
      z: 2.88
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 361027756
    }
  },
  {
    id: "proceduralGrass-mqyemv0p-170",
    asset: "proceduralGrass",
    position: {
      x: -15.616,
      y: 0.097,
      z: -13.421
    },
    rotation: {
      x: 0,
      y: 0.155,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 402464383
    }
  },
  {
    id: "proceduralGrass-mqyemxwo-171",
    asset: "proceduralGrass",
    position: {
      x: -14.389,
      y: 0.097,
      z: 19.522
    },
    rotation: {
      x: 0,
      y: 4.248,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 302277072
    }
  },
  {
    id: "proceduralGrass-mqyemyi5-172",
    asset: "proceduralGrass",
    position: {
      x: -14.447,
      y: 0.097,
      z: 20.921
    },
    rotation: {
      x: 0,
      y: 1.946,
      z: 0
    },
    scale: {
      x: 4.25,
      y: 4.25,
      z: 4.25
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 99728638
    }
  },
  {
    id: "proceduralGrass-mqyen0xw-173",
    asset: "proceduralGrass",
    position: {
      x: -10.54,
      y: 0.097,
      z: 18.561
    },
    rotation: {
      x: 0,
      y: 3.244,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 513618047
    }
  },
  {
    id: "proceduralGrass-mqyen1pj-174",
    asset: "proceduralGrass",
    position: {
      x: -3.927,
      y: 0.097,
      z: 14.784
    },
    rotation: {
      x: 0,
      y: 5.395,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 17038381
    }
  },
  {
    id: "proceduralGrass-mqyen22m-175",
    asset: "proceduralGrass",
    position: {
      x: -6.601,
      y: 0.097,
      z: 13.448
    },
    rotation: {
      x: 0,
      y: 2.067,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 476611914
    }
  },
  {
    id: "proceduralGrass-mqyen2if-176",
    asset: "proceduralGrass",
    position: {
      x: -1.863,
      y: 0.097,
      z: 12.334
    },
    rotation: {
      x: 0,
      y: 2.86,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 245053706
    }
  },
  {
    id: "proceduralGrass-mqyen2wj-177",
    asset: "proceduralGrass",
    position: {
      x: -3.226,
      y: 0.097,
      z: 12.406
    },
    rotation: {
      x: 0,
      y: 4.733,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 474177583
    }
  },
  {
    id: "proceduralGrass-mqyen3e9-178",
    asset: "proceduralGrass",
    position: {
      x: 0.798,
      y: 0.097,
      z: 8.444
    },
    rotation: {
      x: 0,
      y: 6.174,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 804048330
    }
  },
  {
    id: "proceduralGrass-mqyen3wz-179",
    asset: "proceduralGrass",
    position: {
      x: 2.234,
      y: 0.097,
      z: 12.897
    },
    rotation: {
      x: 0,
      y: 3.067,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 572365278
    }
  },
  {
    id: "proceduralGrass-mqyen50z-180",
    asset: "proceduralGrass",
    position: {
      x: 1.44,
      y: 0.097,
      z: 16.125
    },
    rotation: {
      x: 0,
      y: 2.549,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 399797859
    }
  },
  {
    id: "proceduralGrass-mqyen5s4-181",
    asset: "proceduralGrass",
    position: {
      x: 1.108,
      y: 0.097,
      z: 19.564
    },
    rotation: {
      x: 0,
      y: 0.123,
      z: 0
    },
    scale: {
      x: 2.614,
      y: 2.614,
      z: 2.614
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 55935964
    }
  },
  {
    id: "proceduralGrass-mqyen787-182",
    asset: "proceduralGrass",
    position: {
      x: -3.337,
      y: 0.097,
      z: 17.297
    },
    rotation: {
      x: 0,
      y: 4.104,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 834282819
    }
  },
  {
    id: "proceduralGrass-mqyen83g-183",
    asset: "proceduralGrass",
    position: {
      x: -6.399,
      y: 0.097,
      z: 15.255
    },
    rotation: {
      x: 0,
      y: 2.667,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 110533245
    }
  },
  {
    id: "proceduralGrass-mqyen8w8-184",
    asset: "proceduralGrass",
    position: {
      x: -2.406,
      y: 0.097,
      z: 13.849
    },
    rotation: {
      x: 0,
      y: 3.187,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 635790391
    }
  },
  {
    id: "proceduralGrass-mqyen9ay-185",
    asset: "proceduralGrass",
    position: {
      x: 4.762,
      y: 0.097,
      z: 6.514
    },
    rotation: {
      x: 0,
      y: 3.911,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 330511260
    }
  },
  {
    id: "proceduralGrass-mqyenaff-186",
    asset: "proceduralGrass",
    position: {
      x: 16.619,
      y: 0.097,
      z: 12.211
    },
    rotation: {
      x: 0,
      y: 4.534,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 579620907
    }
  },
  {
    id: "proceduralGrass-mqyenb3b-187",
    asset: "proceduralGrass",
    position: {
      x: 16.555,
      y: 0.097,
      z: 10.143
    },
    rotation: {
      x: 0,
      y: 2.96,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 677437773
    }
  },
  {
    id: "proceduralGrass-mqyenbfv-188",
    asset: "proceduralGrass",
    position: {
      x: 17.839,
      y: 0.097,
      z: 14.046
    },
    rotation: {
      x: 0,
      y: 6.01,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 236010576
    }
  },
  {
    id: "proceduralGrass-mqyenbz6-189",
    asset: "proceduralGrass",
    position: {
      x: 20.389,
      y: 0.097,
      z: 12.647
    },
    rotation: {
      x: 0,
      y: 3.162,
      z: 0
    },
    scale: {
      x: 2.718,
      y: 2.718,
      z: 2.718
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 598916029
    }
  },
  {
    id: "proceduralGrass-mqyendk4-190",
    asset: "proceduralGrass",
    position: {
      x: 23.099,
      y: 0.097,
      z: 10.888
    },
    rotation: {
      x: 0,
      y: 4.229,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 935990649
    }
  },
  {
    id: "proceduralGrass-mqyene0o-191",
    asset: "proceduralGrass",
    position: {
      x: 16.905,
      y: 0.097,
      z: 5.858
    },
    rotation: {
      x: 0,
      y: 4.644,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 978252170
    }
  },
  {
    id: "proceduralGrass-mqyenfr0-192",
    asset: "proceduralGrass",
    position: {
      x: 18.312,
      y: 0.097,
      z: 6.77
    },
    rotation: {
      x: 0,
      y: 5.116,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 731806168
    }
  },
  {
    id: "proceduralGrass-mqyenh2u-193",
    asset: "proceduralGrass",
    position: {
      x: 20.349,
      y: 0.097,
      z: 8.197
    },
    rotation: {
      x: 0,
      y: 1.781,
      z: 0
    },
    scale: {
      x: 2.343,
      y: 2.343,
      z: 2.343
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 138323809
    }
  },
  {
    id: "proceduralGrass-mqyenij6-194",
    asset: "proceduralGrass",
    position: {
      x: 7.061,
      y: 0.097,
      z: 5.607
    },
    rotation: {
      x: 0,
      y: 1.061,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 656817583
    }
  },
  {
    id: "proceduralGrass-mqyenjgp-195",
    asset: "proceduralGrass",
    position: {
      x: 9.634,
      y: 0.097,
      z: 8.442
    },
    rotation: {
      x: 0,
      y: 1.892,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 470971763
    }
  },
  {
    id: "proceduralGrass-mqyenk67-196",
    asset: "proceduralGrass",
    position: {
      x: 9.013,
      y: 0.097,
      z: 6.571
    },
    rotation: {
      x: 0,
      y: 4.58,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 566925169
    }
  },
  {
    id: "proceduralGrass-mqyenkrz-197",
    asset: "proceduralGrass",
    position: {
      x: 10.118,
      y: 0.097,
      z: 6.06
    },
    rotation: {
      x: 0,
      y: 6.122,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 875888375
    }
  },
  {
    id: "proceduralGrass-mqyenley-198",
    asset: "proceduralGrass",
    position: {
      x: 11.021,
      y: 0.097,
      z: 3.244
    },
    rotation: {
      x: 0,
      y: 3.241,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 956438049
    }
  },
  {
    id: "proceduralGrass-mqyenlx3-199",
    asset: "proceduralGrass",
    position: {
      x: 9.053,
      y: 0.097,
      z: 1.064
    },
    rotation: {
      x: 0,
      y: 0.889,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 975278744
    }
  },
  {
    id: "proceduralGrass-mqyenmay-200",
    asset: "proceduralGrass",
    position: {
      x: 10.846,
      y: 0.097,
      z: 1.217
    },
    rotation: {
      x: 0,
      y: 4.852,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 50190834
    }
  },
  {
    id: "proceduralGrass-mqyennfq-201",
    asset: "proceduralGrass",
    position: {
      x: 4.118,
      y: 0.097,
      z: 8.334
    },
    rotation: {
      x: 0,
      y: 2.867,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 248954503
    }
  },
  {
    id: "proceduralGrass-mqyennys-202",
    asset: "proceduralGrass",
    position: {
      x: 0.293,
      y: 0.097,
      z: 10.39
    },
    rotation: {
      x: 0,
      y: 4.142,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 767748656
    }
  },
  {
    id: "proceduralGrass-mqyenol5-203",
    asset: "proceduralGrass",
    position: {
      x: 2.548,
      y: 0.097,
      z: 10.434
    },
    rotation: {
      x: 0,
      y: 6.259,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 494981937
    }
  },
  {
    id: "proceduralGrass-mqyenp0e-204",
    asset: "proceduralGrass",
    position: {
      x: 4.828,
      y: 0.097,
      z: 9.883
    },
    rotation: {
      x: 0,
      y: 0.762,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 103677966
    }
  },
  {
    id: "proceduralGrass-mqyenphd-205",
    asset: "proceduralGrass",
    position: {
      x: 7.584,
      y: 0.097,
      z: 11.775
    },
    rotation: {
      x: 0,
      y: 0.152,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 797528108
    }
  },
  {
    id: "proceduralGrass-mqyenprz-206",
    asset: "proceduralGrass",
    position: {
      x: 8.97,
      y: 0.097,
      z: 10.745
    },
    rotation: {
      x: 0,
      y: 4.295,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 605743250
    }
  },
  {
    id: "proceduralGrass-mqyenq4x-207",
    asset: "proceduralGrass",
    position: {
      x: 7.55,
      y: 0.097,
      z: 9.349
    },
    rotation: {
      x: 0,
      y: 0.579,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 855078982
    }
  },
  {
    id: "proceduralGrass-mqyenrhm-208",
    asset: "proceduralGrass",
    position: {
      x: 12.724,
      y: 0.097,
      z: 9.972
    },
    rotation: {
      x: 0,
      y: 3.832,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 605380247
    }
  },
  {
    id: "proceduralGrass-mqyenryr-209",
    asset: "proceduralGrass",
    position: {
      x: 10.799,
      y: 0.097,
      z: 8.527
    },
    rotation: {
      x: 0,
      y: 3.816,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 69392792
    }
  },
  {
    id: "proceduralGrass-mqyensid-210",
    asset: "proceduralGrass",
    position: {
      x: 7.055,
      y: 0.097,
      z: 7.2
    },
    rotation: {
      x: 0,
      y: 3.458,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 23675020
    }
  },
  {
    id: "proceduralGrass-mqyentcc-211",
    asset: "proceduralGrass",
    position: {
      x: 12.558,
      y: 0.097,
      z: 6.447
    },
    rotation: {
      x: 0,
      y: 0.799,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 969001263
    }
  },
  {
    id: "proceduralGrass-mqyentoh-212",
    asset: "proceduralGrass",
    position: {
      x: 7.513,
      y: 0.097,
      z: 2.13
    },
    rotation: {
      x: 0,
      y: 2.032,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 282469107
    }
  },
  {
    id: "proceduralGrass-mqyenu6l-213",
    asset: "proceduralGrass",
    position: {
      x: 7.526,
      y: 0.097,
      z: 4.46
    },
    rotation: {
      x: 0,
      y: 1.209,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 997065085
    }
  },
  {
    id: "proceduralGrass-mqyenuir-214",
    asset: "proceduralGrass",
    position: {
      x: 14.951,
      y: 0.097,
      z: 5.207
    },
    rotation: {
      x: 0,
      y: 5.688,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 5755460
    }
  },
  {
    id: "proceduralGrass-mqyenv8q-215",
    asset: "proceduralGrass",
    position: {
      x: 20.403,
      y: 0.097,
      z: 1.937
    },
    rotation: {
      x: 0,
      y: 1.221,
      z: 0
    },
    scale: {
      x: 2.237,
      y: 2.237,
      z: 2.237
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 963976306
    }
  },
  {
    id: "proceduralGrass-mqyenww0-216",
    asset: "proceduralGrass",
    position: {
      x: 23.632,
      y: 0.097,
      z: -0.135
    },
    rotation: {
      x: 0,
      y: 2.129,
      z: 0
    },
    scale: {
      x: 3.156,
      y: 3.156,
      z: 3.156
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 653359335
    }
  },
  {
    id: "proceduralGrass-mqyenyuu-217",
    asset: "proceduralGrass",
    position: {
      x: 21.998,
      y: 0.097,
      z: 4.341
    },
    rotation: {
      x: 0,
      y: 0.113,
      z: 0
    },
    scale: {
      x: 3.395,
      y: 3.395,
      z: 3.395
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 388568498
    }
  },
  {
    id: "proceduralGrass-mqyeo1wn-218",
    asset: "proceduralGrass",
    position: {
      x: 17.083,
      y: -0.982,
      z: -5.085
    },
    rotation: {
      x: 0,
      y: 1.47,
      z: 0
    },
    scale: {
      x: 3.585,
      y: 3.585,
      z: 3.585
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 973501323
    }
  },
  {
    id: "proceduralGrass-mqyeo3an-219",
    asset: "proceduralGrass",
    position: {
      x: 20.561,
      y: 0.097,
      z: -4.745
    },
    rotation: {
      x: 0,
      y: 2.958,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 51250858
    }
  },
  {
    id: "proceduralGrass-mqyeo3ly-220",
    asset: "proceduralGrass",
    position: {
      x: 21.29,
      y: 0.097,
      z: -4.149
    },
    rotation: {
      x: 0,
      y: 2.585,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 218996278
    }
  },
  {
    id: "proceduralGrass-mqyeo4rn-221",
    asset: "proceduralGrass",
    position: {
      x: 25.999,
      y: 0.097,
      z: -10.123
    },
    rotation: {
      x: 0,
      y: 3.422,
      z: 0
    },
    scale: {
      x: 3.073,
      y: 3.073,
      z: 3.073
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 944223974
    }
  },
  {
    id: "proceduralGrass-mqyeo6jr-222",
    asset: "proceduralGrass",
    position: {
      x: 18.387,
      y: 0.097,
      z: -10.276
    },
    rotation: {
      x: 0,
      y: 1.704,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 552546950
    }
  },
  {
    id: "proceduralGrass-mqyeo7dm-223",
    asset: "proceduralGrass",
    position: {
      x: 13.655,
      y: 0.097,
      z: -8.242
    },
    rotation: {
      x: 0,
      y: 5.223,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 112450714
    }
  },
  {
    id: "proceduralGrass-mqyeo7yb-224",
    asset: "proceduralGrass",
    position: {
      x: 6.905,
      y: 0.097,
      z: -4.906
    },
    rotation: {
      x: 0,
      y: 5.21,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 970520476
    }
  },
  {
    id: "proceduralGrass-mqyeo8gk-225",
    asset: "proceduralGrass",
    position: {
      x: 13.24,
      y: 0.097,
      z: -10.84
    },
    rotation: {
      x: 0,
      y: 4.401,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 992767312
    }
  },
  {
    id: "proceduralGrass-mqyeo9nf-226",
    asset: "proceduralGrass",
    position: {
      x: 19.652,
      y: 0.097,
      z: -12.094
    },
    rotation: {
      x: 0,
      y: 1.252,
      z: 0
    },
    scale: {
      x: 2.143,
      y: 2.143,
      z: 2.143
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 293551363
    }
  },
  {
    id: "proceduralGrass-mqyeoao1-227",
    asset: "proceduralGrass",
    position: {
      x: 18.376,
      y: 0.097,
      z: -12.342
    },
    rotation: {
      x: 0,
      y: 0.342,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 386436370
    }
  },
  {
    id: "proceduralGrass-mqyeockr-228",
    asset: "proceduralGrass",
    position: {
      x: 16.323,
      y: 0.097,
      z: -20.061
    },
    rotation: {
      x: 0,
      y: 0.992,
      z: 0
    },
    scale: {
      x: 2.293,
      y: 2.293,
      z: 2.293
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 675388197
    }
  },
  {
    id: "proceduralGrass-mqyeodss-229",
    asset: "proceduralGrass",
    position: {
      x: 15.01,
      y: 0.097,
      z: -20.904
    },
    rotation: {
      x: 0,
      y: 0.211,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 896850859
    }
  },
  {
    id: "proceduralGrass-mqyeoezf-230",
    asset: "proceduralGrass",
    position: {
      x: 12.628,
      y: 0.097,
      z: -25.443
    },
    rotation: {
      x: 0,
      y: 4.709,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 926773698
    }
  },
  {
    id: "proceduralGrass-mqyeofui-231",
    asset: "proceduralGrass",
    position: {
      x: 13.036,
      y: 0.097,
      z: -23.84
    },
    rotation: {
      x: 0,
      y: 1.157,
      z: 0
    },
    scale: {
      x: 2.05,
      y: 2.05,
      z: 2.05
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 437667607
    }
  },
  {
    id: "proceduralGrass-mqyeoh7h-232",
    asset: "proceduralGrass",
    position: {
      x: 12.71,
      y: 0.097,
      z: -26.659
    },
    rotation: {
      x: 0,
      y: 6.225,
      z: 0
    },
    scale: {
      x: 1.402,
      y: 1.402,
      z: 1.402
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 882418390
    }
  },
  {
    id: "proceduralGrass-mqyeoiwm-233",
    asset: "proceduralGrass",
    position: {
      x: 8.406,
      y: 0.097,
      z: -26.903
    },
    rotation: {
      x: 0,
      y: 3.83,
      z: 0
    },
    scale: {
      x: 2.304,
      y: 2.304,
      z: 2.304
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 585263805
    }
  },
  {
    id: "proceduralGrass-mqyeolsn-234",
    asset: "proceduralGrass",
    position: {
      x: 9.353,
      y: 0.097,
      z: -26.965
    },
    rotation: {
      x: 0,
      y: 2.274,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 352293598
    }
  },
  {
    id: "proceduralGrass-mqyeomnw-235",
    asset: "proceduralGrass",
    position: {
      x: 4.088,
      y: 0.097,
      z: -26.808
    },
    rotation: {
      x: 0,
      y: 2.049,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 308896814
    }
  },
  {
    id: "proceduralGrass-mqyeon8j-236",
    asset: "proceduralGrass",
    position: {
      x: 2.975,
      y: 0.097,
      z: -29.351
    },
    rotation: {
      x: 0,
      y: 2.161,
      z: 0
    },
    scale: {
      x: 1.969,
      y: 1.969,
      z: 1.969
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 186743368
    }
  },
  {
    id: "proceduralGrass-mqyeoosg-237",
    asset: "proceduralGrass",
    position: {
      x: 5.432,
      y: 0.097,
      z: -21.109
    },
    rotation: {
      x: 0,
      y: 6.145,
      z: 0
    },
    scale: {
      x: 1.392,
      y: 1.392,
      z: 1.392
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 273435542
    }
  },
  {
    id: "proceduralGrass-mqyeoppu-238",
    asset: "proceduralGrass",
    position: {
      x: 5.604,
      y: 0.097,
      z: -23.946
    },
    rotation: {
      x: 0,
      y: 1.862,
      z: 0
    },
    scale: {
      x: 1.297,
      y: 1.297,
      z: 1.297
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 103118430
    }
  },
  {
    id: "proceduralGrass-mqyeoqqb-239",
    asset: "proceduralGrass",
    position: {
      x: 3.757,
      y: 0.097,
      z: -25.426
    },
    rotation: {
      x: 0,
      y: 5.617,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 199152857
    }
  },
  {
    id: "proceduralGrass-mqyeorc3-240",
    asset: "proceduralGrass",
    position: {
      x: 2.135,
      y: 0.097,
      z: -19.802
    },
    rotation: {
      x: 0,
      y: 4.062,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 448834036
    }
  },
  {
    id: "proceduralGrass-mqyeorw0-241",
    asset: "proceduralGrass",
    position: {
      x: -0.007,
      y: 0.097,
      z: -14.083
    },
    rotation: {
      x: 0,
      y: 2.323,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 224868509
    }
  },
  {
    id: "proceduralGrass-mqyeossm-242",
    asset: "proceduralGrass",
    position: {
      x: 2.791,
      y: 0.097,
      z: -15.339
    },
    rotation: {
      x: 0,
      y: 0.843,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 957778970
    }
  },
  {
    id: "proceduralGrass-mqyeot6v-243",
    asset: "proceduralGrass",
    position: {
      x: 4.912,
      y: 0.097,
      z: -14.425
    },
    rotation: {
      x: 0,
      y: 4.985,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 478362592
    }
  },
  {
    id: "proceduralGrass-mqyeotno-244",
    asset: "proceduralGrass",
    position: {
      x: 0.954,
      y: 0.097,
      z: -23.121
    },
    rotation: {
      x: 0,
      y: 3.921,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 627025965
    }
  },
  {
    id: "proceduralGrass-mqyeouck-245",
    asset: "proceduralGrass",
    position: {
      x: -1.857,
      y: 0.097,
      z: -27.199
    },
    rotation: {
      x: 0,
      y: 2.188,
      z: 0
    },
    scale: {
      x: 1.79,
      y: 1.79,
      z: 1.79
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 772659321
    }
  },
  {
    id: "proceduralGrass-mqyeovdy-246",
    asset: "proceduralGrass",
    position: {
      x: -3.805,
      y: 0.097,
      z: -27.349
    },
    rotation: {
      x: 0,
      y: 5.798,
      z: 0
    },
    scale: {
      x: 1.218,
      y: 1.218,
      z: 1.218
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 516819686
    }
  },
  {
    id: "proceduralGrass-mqyeowuo-247",
    asset: "proceduralGrass",
    position: {
      x: -4.824,
      y: 0.097,
      z: -24.041
    },
    rotation: {
      x: 0,
      y: 3.413,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 56765600
    }
  },
  {
    id: "proceduralGrass-mqyeoye2-248",
    asset: "proceduralGrass",
    position: {
      x: -6.248,
      y: -0.219,
      z: -19.507
    },
    rotation: {
      x: 0,
      y: 1.811,
      z: 0
    },
    scale: {
      x: 2.003,
      y: 2.003,
      z: 2.003
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 398051842
    }
  },
  {
    id: "proceduralGrass-mqyep00h-249",
    asset: "proceduralGrass",
    position: {
      x: -3.325,
      y: 0.097,
      z: -22.542
    },
    rotation: {
      x: 0,
      y: 2.862,
      z: 0
    },
    scale: {
      x: 2.098,
      y: 2.098,
      z: 2.098
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 46946055
    }
  },
  {
    id: "proceduralGrass-mqyep1gl-250",
    asset: "proceduralGrass",
    position: {
      x: -1.046,
      y: 0.097,
      z: -17.496
    },
    rotation: {
      x: 0,
      y: 2.812,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 426974699
    }
  },
  {
    id: "proceduralGrass-mqyep2hg-251",
    asset: "proceduralGrass",
    position: {
      x: -3.585,
      y: 0.097,
      z: -10.123
    },
    rotation: {
      x: 0,
      y: 1.385,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 617781601
    }
  },
  {
    id: "proceduralGrass-mqyep30d-252",
    asset: "proceduralGrass",
    position: {
      x: -5.016,
      y: 0.097,
      z: -12.212
    },
    rotation: {
      x: 0,
      y: 1.127,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 318383357
    }
  },
  {
    id: "proceduralGrass-mqyep3al-253",
    asset: "proceduralGrass",
    position: {
      x: -6.41,
      y: 0.097,
      z: -15.956
    },
    rotation: {
      x: 0,
      y: 1.595,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 111605183
    }
  },
  {
    id: "proceduralGrass-mqyep4kw-254",
    asset: "proceduralGrass",
    position: {
      x: -7.943,
      y: 0.097,
      z: -11.163
    },
    rotation: {
      x: 0,
      y: 5.418,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 443573874
    }
  },
  {
    id: "proceduralGrass-mqyep58g-255",
    asset: "proceduralGrass",
    position: {
      x: -11.119,
      y: 0.097,
      z: -17.612
    },
    rotation: {
      x: 0,
      y: 2.171,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 877516828
    }
  },
  {
    id: "proceduralGrass-mqyep63h-256",
    asset: "proceduralGrass",
    position: {
      x: -12.727,
      y: 0.097,
      z: -24.266
    },
    rotation: {
      x: 0,
      y: 1.336,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 456566992
    }
  },
  {
    id: "proceduralGrass-mqyep6ei-257",
    asset: "proceduralGrass",
    position: {
      x: -12.293,
      y: 0.097,
      z: -26.069
    },
    rotation: {
      x: 0,
      y: 5.506,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 553782405
    }
  },
  {
    id: "proceduralGrass-mqyep7ue-258",
    asset: "proceduralGrass",
    position: {
      x: -13.855,
      y: 0.097,
      z: -25.264
    },
    rotation: {
      x: 0,
      y: 3.229,
      z: 0
    },
    scale: {
      x: 2.196,
      y: 2.196,
      z: 2.196
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 321079412
    }
  },
  {
    id: "proceduralGrass-mqyep9k4-259",
    asset: "proceduralGrass",
    position: {
      x: -13.268,
      y: 0.097,
      z: -21.849
    },
    rotation: {
      x: 0,
      y: 3.309,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 882751834
    }
  },
  {
    id: "proceduralGrass-mqyepask-260",
    asset: "proceduralGrass",
    position: {
      x: -19.779,
      y: 0.097,
      z: -20.955
    },
    rotation: {
      x: 0,
      y: 5.779,
      z: 0
    },
    scale: {
      x: 1.781,
      y: 1.781,
      z: 1.781
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 387457908
    }
  },
  {
    id: "proceduralGrass-mqyepc6v-261",
    asset: "proceduralGrass",
    position: {
      x: -11.718,
      y: 0.097,
      z: -13.761
    },
    rotation: {
      x: 0,
      y: 0.585,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 281677955
    }
  },
  {
    id: "proceduralGrass-mqyepcot-262",
    asset: "proceduralGrass",
    position: {
      x: -10.552,
      y: 0.097,
      z: -14.703
    },
    rotation: {
      x: 0,
      y: 2.464,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 124882752
    }
  },
  {
    id: "proceduralGrass-mqyepd15-263",
    asset: "proceduralGrass",
    position: {
      x: -18.094,
      y: 0.097,
      z: -18.944
    },
    rotation: {
      x: 0,
      y: 3.506,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 897089652
    }
  },
  {
    id: "proceduralGrass-mqyepdlg-264",
    asset: "proceduralGrass",
    position: {
      x: -9.421,
      y: 0.097,
      z: -11.435
    },
    rotation: {
      x: 0,
      y: 3.945,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 466816702
    }
  },
  {
    id: "proceduralGrass-mqyepe0v-265",
    asset: "proceduralGrass",
    position: {
      x: -7.99,
      y: 0.097,
      z: -9.299
    },
    rotation: {
      x: 0,
      y: 1.336,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 718241970
    }
  },
  {
    id: "proceduralGrass-mqyepehu-266",
    asset: "proceduralGrass",
    position: {
      x: -12.613,
      y: 0.097,
      z: -11.626
    },
    rotation: {
      x: 0,
      y: 0.724,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 823521853
    }
  },
  {
    id: "proceduralGrass-mqyepf06-267",
    asset: "proceduralGrass",
    position: {
      x: -12.937,
      y: 0.097,
      z: -9.769
    },
    rotation: {
      x: 0,
      y: 3.253,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 335543397
    }
  },
  {
    id: "proceduralGrass-mqyepf7o-268",
    asset: "proceduralGrass",
    position: {
      x: -16.078,
      y: 0.097,
      z: -11.412
    },
    rotation: {
      x: 0,
      y: 3.415,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 651367216
    }
  },
  {
    id: "proceduralGrass-mqyepfzn-269",
    asset: "proceduralGrass",
    position: {
      x: -19.574,
      y: 0.097,
      z: -12.595
    },
    rotation: {
      x: 0,
      y: 5.865,
      z: 0
    },
    scale: {
      x: 2.226,
      y: 2.226,
      z: 2.226
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 751283785
    }
  },
  {
    id: "proceduralGrass-mqyephe1-270",
    asset: "proceduralGrass",
    position: {
      x: -17.465,
      y: 0.097,
      z: -8.154
    },
    rotation: {
      x: 0,
      y: 4.724,
      z: 0
    },
    scale: {
      x: 1.678,
      y: 1.678,
      z: 1.678
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 540292706
    }
  },
  {
    id: "proceduralGrass-mqyeqqc7-271",
    asset: "proceduralGrass",
    position: {
      x: -14.365,
      y: 0.097,
      z: -7.396
    },
    rotation: {
      x: 0,
      y: 4.205,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 947807557
    }
  },
  {
    id: "proceduralGrass-mqyeqqul-272",
    asset: "proceduralGrass",
    position: {
      x: -15.926,
      y: 0.097,
      z: -6.245
    },
    rotation: {
      x: 0,
      y: 2.584,
      z: 0
    },
    scale: {
      x: 1.5,
      y: 1.5,
      z: 1.5
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 739644567
    }
  },
  {
    id: "proceduralGrass-mqyeqv0g-273",
    asset: "proceduralGrass",
    position: {
      x: -12.055,
      y: 0.097,
      z: -8.152
    },
    rotation: {
      x: 0,
      y: 4.509,
      z: 0
    },
    scale: {
      x: 1.128,
      y: 1.128,
      z: 1.128
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 352558150
    }
  },
  {
    id: "proceduralGrass-mqyeqxbu-274",
    asset: "proceduralGrass",
    position: {
      x: -10.14,
      y: 0.097,
      z: -9.939
    },
    rotation: {
      x: 0,
      y: 4.98,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 262201912
    }
  },
  {
    id: "proceduralGrass-mqyer0hn-275",
    asset: "proceduralGrass",
    position: {
      x: -16.074,
      y: 0.097,
      z: -4.176
    },
    rotation: {
      x: 0,
      y: 5.956,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 133558753
    }
  },
  {
    id: "proceduralGrass-mqyer1fu-276",
    asset: "proceduralGrass",
    position: {
      x: -16.979,
      y: 0.097,
      z: -9.153
    },
    rotation: {
      x: 0,
      y: 2.003,
      z: 0
    },
    scale: {
      x: 1.617,
      y: 1.617,
      z: 1.617
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 488570772
    }
  },
  {
    id: "proceduralGrass-mqyer3jt-277",
    asset: "proceduralGrass",
    position: {
      x: -19.489,
      y: 0.097,
      z: -5.145
    },
    rotation: {
      x: 0,
      y: 0.959,
      z: 0
    },
    scale: {
      x: 2.016,
      y: 2.016,
      z: 2.016
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 683793073
    }
  },
  {
    id: "proceduralGrass-mqyer64f-278",
    asset: "proceduralGrass",
    position: {
      x: -19.98,
      y: 0.097,
      z: -1.972
    },
    rotation: {
      x: 0,
      y: 0.24,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 201894883
    }
  },
  {
    id: "proceduralGrass-mqyer6dc-279",
    asset: "proceduralGrass",
    position: {
      x: -18.543,
      y: 0.097,
      z: -0.18
    },
    rotation: {
      x: 0,
      y: 3.692,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 518055966
    }
  },
  {
    id: "proceduralGrass-mqyer73x-280",
    asset: "proceduralGrass",
    position: {
      x: -16.697,
      y: 0.097,
      z: -1.94
    },
    rotation: {
      x: 0,
      y: 5.125,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 378947675
    }
  },
  {
    id: "proceduralGrass-mqyer83m-281",
    asset: "proceduralGrass",
    position: {
      x: -16.45,
      y: 0.097,
      z: 1.448
    },
    rotation: {
      x: 0,
      y: 3.861,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 928198675
    }
  },
  {
    id: "proceduralGrass-mqyer8lg-282",
    asset: "proceduralGrass",
    position: {
      x: -14.889,
      y: 0.097,
      z: 3.095
    },
    rotation: {
      x: 0,
      y: 2.428,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 263254672
    }
  },
  {
    id: "proceduralGrass-mqyer8tp-283",
    asset: "proceduralGrass",
    position: {
      x: -18.813,
      y: 0.097,
      z: 3.904
    },
    rotation: {
      x: 0,
      y: 2.441,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 839689676
    }
  },
  {
    id: "proceduralGrass-mqyer9l9-284",
    asset: "proceduralGrass",
    position: {
      x: -28.075,
      y: 0.097,
      z: 6.347
    },
    rotation: {
      x: 0,
      y: 0.052,
      z: 0
    },
    scale: {
      x: 1.483,
      y: 1.483,
      z: 1.483
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 65204605
    }
  },
  {
    id: "proceduralGrass-mqyerb93-285",
    asset: "proceduralGrass",
    position: {
      x: -20.525,
      y: 0.097,
      z: 5.518
    },
    rotation: {
      x: 0,
      y: 0.865,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 347529536
    }
  },
  {
    id: "proceduralGrass-mqyerbow-286",
    asset: "proceduralGrass",
    position: {
      x: -22.056,
      y: 0.097,
      z: 3.863
    },
    rotation: {
      x: 0,
      y: 0.366,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 870317694
    }
  },
  {
    id: "proceduralGrass-mqyerd33-287",
    asset: "proceduralGrass",
    position: {
      x: -19.396,
      y: 0.097,
      z: 7.612
    },
    rotation: {
      x: 0,
      y: 4.831,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 562279405
    }
  },
  {
    id: "proceduralGrass-mqyerdi4-288",
    asset: "proceduralGrass",
    position: {
      x: -15.223,
      y: 0.097,
      z: 6.428
    },
    rotation: {
      x: 0,
      y: 1.087,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 163267008
    }
  },
  {
    id: "proceduralGrass-mqyere9c-289",
    asset: "proceduralGrass",
    position: {
      x: -16.537,
      y: 0.097,
      z: 3.446
    },
    rotation: {
      x: 0,
      y: 0.138,
      z: 0
    },
    scale: {
      x: 0.856,
      y: 0.856,
      z: 0.856
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 127003824
    }
  },
  {
    id: "proceduralGrass-mqyerhgo-290",
    asset: "proceduralGrass",
    position: {
      x: -20.362,
      y: 0.097,
      z: 11.017
    },
    rotation: {
      x: 0,
      y: 4.8,
      z: 0
    },
    scale: {
      x: 2.588,
      y: 2.588,
      z: 2.588
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 632383003
    }
  },
  {
    id: "proceduralGrass-mqyerk7o-291",
    asset: "proceduralGrass",
    position: {
      x: -19.925,
      y: 0.097,
      z: 11.83
    },
    rotation: {
      x: 0,
      y: 5.935,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 693293811
    }
  },
  {
    id: "proceduralGrass-mqyerlaa-292",
    asset: "proceduralGrass",
    position: {
      x: -17.4,
      y: 0.097,
      z: 15.281
    },
    rotation: {
      x: 0,
      y: 4.722,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 991286924
    }
  },
  {
    id: "proceduralGrass-mqyermcg-293",
    asset: "proceduralGrass",
    position: {
      x: -14.331,
      y: -0.22,
      z: 11.119
    },
    rotation: {
      x: 0,
      y: 2.132,
      z: 0
    },
    scale: {
      x: 0.977,
      y: 0.977,
      z: 0.977
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 665240940
    }
  },
  {
    id: "proceduralGrass-mqyerqva-294",
    asset: "proceduralGrass",
    position: {
      x: -12.117,
      y: 0.074,
      z: 7.778
    },
    rotation: {
      x: 0,
      y: 4.407,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 734446163
    }
  },
  {
    id: "proceduralGrass-mqyersob-295",
    asset: "proceduralGrass",
    position: {
      x: -14.494,
      y: -0.116,
      z: 6.972
    },
    rotation: {
      x: 0,
      y: 3.584,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 717894435
    }
  },
  {
    id: "proceduralGrass-mqyeruj3-296",
    asset: "proceduralGrass",
    position: {
      x: -14,
      y: -0.035,
      z: 5.324
    },
    rotation: {
      x: 0,
      y: 4.839,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 118474796
    }
  },
  {
    id: "proceduralGrass-mqyerwgd-297",
    asset: "proceduralGrass",
    position: {
      x: -15.192,
      y: 0.097,
      z: 9.951
    },
    rotation: {
      x: 0,
      y: 2.809,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 466205683
    }
  },
  {
    id: "proceduralGrass-mqyerxbf-298",
    asset: "proceduralGrass",
    position: {
      x: -15.515,
      y: -0.147,
      z: 6.15
    },
    rotation: {
      x: 0,
      y: 5.394,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 206660409
    }
  },
  {
    id: "proceduralGrass-mqyerysh-299",
    asset: "proceduralGrass",
    position: {
      x: -16.674,
      y: -0.339,
      z: 4.707
    },
    rotation: {
      x: 0,
      y: 6.107,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 716675435
    }
  },
  {
    id: "proceduralGrass-mqyes2rb-300",
    asset: "proceduralGrass",
    position: {
      x: -14.681,
      y: -0.339,
      z: 4.347
    },
    rotation: {
      x: 0,
      y: 0.561,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 405342260
    }
  },
  {
    id: "proceduralGrass-mqyes6bk-301",
    asset: "proceduralGrass",
    position: {
      x: -6.836,
      y: -0.278,
      z: -14.453
    },
    rotation: {
      x: 0,
      y: 1.263,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 274525726
    }
  },
  {
    id: "proceduralGrass-mqyes8rk-302",
    asset: "proceduralGrass",
    position: {
      x: -3.546,
      y: 0.097,
      z: -17.522
    },
    rotation: {
      x: 0,
      y: 4.479,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 134146053
    }
  },
  {
    id: "proceduralGrass-mqyesa6h-303",
    asset: "proceduralGrass",
    position: {
      x: 1.139,
      y: -0.225,
      z: -17.539
    },
    rotation: {
      x: 0,
      y: 2.177,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 33905488
    }
  },
  {
    id: "proceduralGrass-mqyescnn-304",
    asset: "proceduralGrass",
    position: {
      x: -13.403,
      y: -0.216,
      z: 3.783
    },
    rotation: {
      x: 0,
      y: 2.868,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 963161685
    }
  },
  {
    id: "proceduralGrass-mqyesgdp-305",
    asset: "proceduralGrass",
    position: {
      x: 14.348,
      y: -0.207,
      z: 4.048
    },
    rotation: {
      x: 0,
      y: 2.416,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 850741679
    }
  },
  {
    id: "proceduralGrass-mqyesia7-306",
    asset: "proceduralGrass",
    position: {
      x: 17.831,
      y: -0.175,
      z: 2.488
    },
    rotation: {
      x: 0,
      y: 0.878,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 951322898
    }
  },
  {
    id: "proceduralGrass-mqyesmg4-307",
    asset: "proceduralGrass",
    position: {
      x: 16.356,
      y: -0.07,
      z: -10.832
    },
    rotation: {
      x: 0,
      y: 0.81,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 251586752
    }
  },
  {
    id: "proceduralGrass-mqyesrbp-308",
    asset: "proceduralGrass",
    position: {
      x: 0,
      y: 0,
      z: 100.4
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 717557657
    }
  },
  {
    id: "proceduralGrass-mqyestek-309",
    asset: "proceduralGrass",
    position: {
      x: 19.921,
      y: 0.097,
      z: -10.62
    },
    rotation: {
      x: 0,
      y: 5.33,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 448280797
    }
  },
  {
    id: "proceduralGrass-mqyeswmb-310",
    asset: "proceduralGrass",
    position: {
      x: 0,
      y: 0,
      z: 101
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 271034998
    }
  },
  {
    id: "bush-mqyetk0x-60",
    asset: "bush",
    position: {
      x: 16.631,
      y: 0.047,
      z: -0.74
    },
    rotation: {
      x: 0,
      y: 0.584,
      z: 0
    },
    scale: {
      x: 1.626,
      y: 1.626,
      z: 1.626
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 668500318
    }
  },
  {
    id: "proceduralGrass-mqyetuv0-311",
    asset: "proceduralGrass",
    position: {
      x: 12.497,
      y: 0.097,
      z: 4.229
    },
    rotation: {
      x: 0,
      y: 4.245,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 391583879
    }
  },
  {
    id: "proceduralGrass-mqyetw3f-312",
    asset: "proceduralGrass",
    position: {
      x: 10.299,
      y: -0.248,
      z: -2.875
    },
    rotation: {
      x: 0,
      y: 2.321,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 20486667
    }
  },
  {
    id: "proceduralGrass-mqyetyd7-313",
    asset: "proceduralGrass",
    position: {
      x: 14.385,
      y: -0.278,
      z: 1.914
    },
    rotation: {
      x: 0,
      y: 1.341,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 846216329
    }
  },
  {
    id: "proceduralGrass-mqyeu0y7-314",
    asset: "proceduralGrass",
    position: {
      x: 13.5,
      y: -0.271,
      z: 7.529
    },
    rotation: {
      x: 0,
      y: 3.508,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 717972397
    }
  },
  {
    id: "proceduralGrass-mqyeu371-315",
    asset: "proceduralGrass",
    position: {
      x: 12.533,
      y: -0.262,
      z: 2.265
    },
    rotation: {
      x: 0,
      y: 1.599,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 912205691
    }
  },
  {
    id: "proceduralGrass-mqyeu725-316",
    asset: "proceduralGrass",
    position: {
      x: 5.306,
      y: 0.097,
      z: -4.733
    },
    rotation: {
      x: 0,
      y: 0.153,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 108793934
    }
  },
  {
    id: "proceduralGrass-mqyeu8dt-317",
    asset: "proceduralGrass",
    position: {
      x: 4.487,
      y: 0.097,
      z: -2.571
    },
    rotation: {
      x: 0,
      y: 2.508,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 966874437
    }
  },
  {
    id: "proceduralGrass-mqyeua2s-318",
    asset: "proceduralGrass",
    position: {
      x: -11.412,
      y: 0.097,
      z: 16.18
    },
    rotation: {
      x: 0,
      y: 4.333,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 831385664
    }
  },
  {
    id: "proceduralGrass-mqyeuaqc-319",
    asset: "proceduralGrass",
    position: {
      x: -6.611,
      y: 0.097,
      z: 17.447
    },
    rotation: {
      x: 0,
      y: 5.01,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 265138242
    }
  },
  {
    id: "proceduralGrass-mqyf4c03-320",
    asset: "proceduralGrass",
    position: {
      x: 13.019,
      y: 0.097,
      z: -16.293
    },
    rotation: {
      x: 0,
      y: 3.856,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 228460613
    }
  },
  {
    id: "proceduralGrass-mqyf4dhe-321",
    asset: "proceduralGrass",
    position: {
      x: 12.868,
      y: 0.097,
      z: -19.377
    },
    rotation: {
      x: 0,
      y: 0.265,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 139119682
    }
  },
  {
    id: "proceduralGrass-mqyf4drd-322",
    asset: "proceduralGrass",
    position: {
      x: 9.695,
      y: 0.097,
      z: -17.553
    },
    rotation: {
      x: 0,
      y: 4.407,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 474947645
    }
  },
  {
    id: "proceduralGrass-mqyf4fin-323",
    asset: "proceduralGrass",
    position: {
      x: 5.966,
      y: 0.097,
      z: -16.091
    },
    rotation: {
      x: 0,
      y: 1.707,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 842451167
    }
  },
  {
    id: "proceduralGrass-mqyf4g84-324",
    asset: "proceduralGrass",
    position: {
      x: 6.291,
      y: 0.097,
      z: -19.237
    },
    rotation: {
      x: 0,
      y: 4.323,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 486035286
    }
  },
  {
    id: "proceduralGrass-mqyf4gkr-325",
    asset: "proceduralGrass",
    position: {
      x: 4.312,
      y: 0.097,
      z: -18.018
    },
    rotation: {
      x: 0,
      y: 0.816,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 671941138
    }
  },
  {
    id: "proceduralGrass-mqyf4hfj-326",
    asset: "proceduralGrass",
    position: {
      x: 11.553,
      y: 0.097,
      z: -19.081
    },
    rotation: {
      x: 0,
      y: 2.303,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 859385556
    }
  },
  {
    id: "proceduralGrass-mqyf4hw4-327",
    asset: "proceduralGrass",
    position: {
      x: 4.397,
      y: 0.097,
      z: -15.196
    },
    rotation: {
      x: 0,
      y: 4.665,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 785409151
    }
  },
  {
    id: "proceduralGrass-mqyf4iuh-328",
    asset: "proceduralGrass",
    position: {
      x: 10.059,
      y: 0.097,
      z: -14.126
    },
    rotation: {
      x: 0,
      y: 4.497,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 777827589
    }
  },
  {
    id: "proceduralGrass-mqyf4j9p-329",
    asset: "proceduralGrass",
    position: {
      x: 15.57,
      y: 0.097,
      z: -14.395
    },
    rotation: {
      x: 0,
      y: 0.003,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 427021312
    }
  },
  {
    id: "proceduralGrass-mqyf4lsz-330",
    asset: "proceduralGrass",
    position: {
      x: 12.68,
      y: 0.097,
      z: -12.426
    },
    rotation: {
      x: 0,
      y: 6.135,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 61036337
    }
  },
  {
    id: "proceduralGrass-mqyf4mbo-331",
    asset: "proceduralGrass",
    position: {
      x: 10.478,
      y: 0.097,
      z: -10.955
    },
    rotation: {
      x: 0,
      y: 1.336,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 350726367
    }
  },
  {
    id: "proceduralGrass-mqyf4n52-332",
    asset: "proceduralGrass",
    position: {
      x: 16.39,
      y: 0.097,
      z: -16.461
    },
    rotation: {
      x: 0,
      y: 0.118,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 442708734
    }
  },
  {
    id: "proceduralGrass-mqyf4o5o-333",
    asset: "proceduralGrass",
    position: {
      x: 8.806,
      y: 0.097,
      z: -10.195
    },
    rotation: {
      x: 0,
      y: 2.109,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 957501840
    }
  },
  {
    id: "proceduralGrass-mqyf4pge-334",
    asset: "proceduralGrass",
    position: {
      x: -1.203,
      y: 0.097,
      z: -11.89
    },
    rotation: {
      x: 0,
      y: 4.006,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 651942076
    }
  },
  {
    id: "proceduralGrass-mqyf4qq0-335",
    asset: "proceduralGrass",
    position: {
      x: 10.753,
      y: 0.097,
      z: -16.324
    },
    rotation: {
      x: 0,
      y: 2.842,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 675972416
    }
  },
  {
    id: "proceduralGrass-mqyf4r5x-336",
    asset: "proceduralGrass",
    position: {
      x: 15.141,
      y: 0.097,
      z: -17.463
    },
    rotation: {
      x: 0,
      y: 5.925,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 767363101
    }
  },
  {
    id: "proceduralGrass-mqyf4rna-337",
    asset: "proceduralGrass",
    position: {
      x: 2.2,
      y: 0.097,
      z: -13.31
    },
    rotation: {
      x: 0,
      y: 1.368,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 441851802
    }
  },
  {
    id: "proceduralGrass-mqyf4t8y-338",
    asset: "proceduralGrass",
    position: {
      x: 8.445,
      y: 0.097,
      z: -11.802
    },
    rotation: {
      x: 0,
      y: 4.361,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 459997981
    }
  },
  {
    id: "proceduralGrass-mqyf4tlx-339",
    asset: "proceduralGrass",
    position: {
      x: 8.462,
      y: 0.097,
      z: -14.472
    },
    rotation: {
      x: 0,
      y: 4.538,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 194888676
    }
  },
  {
    id: "proceduralGrass-mqyf4u50-340",
    asset: "proceduralGrass",
    position: {
      x: 7.368,
      y: 0.097,
      z: -14.411
    },
    rotation: {
      x: 0,
      y: 5.528,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 982159305
    }
  },
  {
    id: "proceduralGrass-mqyf4uu3-341",
    asset: "proceduralGrass",
    position: {
      x: 10.971,
      y: 0.097,
      z: -12.76
    },
    rotation: {
      x: 0,
      y: 2.527,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 389082700
    }
  },
  {
    id: "proceduralGrass-mqyf4vlh-342",
    asset: "proceduralGrass",
    position: {
      x: 7.133,
      y: 0.097,
      z: -19.725
    },
    rotation: {
      x: 0,
      y: 0.448,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 382072444
    }
  },
  {
    id: "proceduralGrass-mqyf4w14-343",
    asset: "proceduralGrass",
    position: {
      x: 3.153,
      y: 0.097,
      z: -14.209
    },
    rotation: {
      x: 0,
      y: 3.056,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 200235040
    }
  },
  {
    id: "proceduralGrass-mqyf4xd5-344",
    asset: "proceduralGrass",
    position: {
      x: -0.198,
      y: 0.097,
      z: -17.308
    },
    rotation: {
      x: 0,
      y: 4.822,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 718631511
    }
  },
  {
    id: "proceduralGrass-mqyf4y9y-345",
    asset: "proceduralGrass",
    position: {
      x: 0.447,
      y: 0.097,
      z: -20.04
    },
    rotation: {
      x: 0,
      y: 5.308,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 173733577
    }
  },
  {
    id: "proceduralGrass-mqyf4ytq-346",
    asset: "proceduralGrass",
    position: {
      x: 3.445,
      y: 0.097,
      z: -20.977
    },
    rotation: {
      x: 0,
      y: 3.815,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 204736354
    }
  },
  {
    id: "proceduralGrass-mqyf4zge-347",
    asset: "proceduralGrass",
    position: {
      x: 2.544,
      y: 0.097,
      z: -22.556
    },
    rotation: {
      x: 0,
      y: 5.541,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 355405290
    }
  },
  {
    id: "proceduralGrass-mqyf50hh-348",
    asset: "proceduralGrass",
    position: {
      x: 1.142,
      y: 0.097,
      z: -15.649
    },
    rotation: {
      x: 0,
      y: 4.689,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 132390831
    }
  },
  {
    id: "proceduralGrass-mqyf519t-349",
    asset: "proceduralGrass",
    position: {
      x: 3.048,
      y: 0.097,
      z: -16.658
    },
    rotation: {
      x: 0,
      y: 5.269,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 385356194
    }
  },
  {
    id: "proceduralGrass-mqyf51l5-350",
    asset: "proceduralGrass",
    position: {
      x: 1.023,
      y: 0.097,
      z: -18.535
    },
    rotation: {
      x: 0,
      y: 0.595,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 892379079
    }
  },
  {
    id: "proceduralGrass-mqyf52su-351",
    asset: "proceduralGrass",
    position: {
      x: -2.765,
      y: 0.097,
      z: -11.611
    },
    rotation: {
      x: 0,
      y: 0.898,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 271206159
    }
  },
  {
    id: "proceduralGrass-mqyf56wd-352",
    asset: "proceduralGrass",
    position: {
      x: -5.125,
      y: 0.097,
      z: -3.104
    },
    rotation: {
      x: 0,
      y: 4.185,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 374439981
    }
  },
  {
    id: "proceduralGrass-mqyf57vi-353",
    asset: "proceduralGrass",
    position: {
      x: -12.633,
      y: 0.097,
      z: -6.486
    },
    rotation: {
      x: 0,
      y: 5.308,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    },
    patchOptions: {
      shape: "organic",
      baseRadius: 1.35,
      bladeCount: 520,
      bladeScaleMin: 0.94,
      bladeScaleMax: 1.08,
      hasFlowers: true,
      flowerCount: 5,
      flowerSize: 0.2,
      flowerScale: 0.38,
      randomSeed: 470585768
    }
  },
  {
    id: "rock-mqyf75hm-1",
    asset: "rock",
    position: {
      x: 4.191,
      y: 1.287,
      z: 13.93
    },
    rotation: {
      x: 0,
      y: 4.166,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    }
  },
  {
    id: "rock-6-mqyf77hr-1",
    asset: "rock-6",
    position: {
      x: 2.861,
      y: 0.589,
      z: 14.662
    },
    rotation: {
      x: 0,
      y: 5.973,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    }
  },
  {
    id: "rock-10-mqyf7bsw-1",
    asset: "rock-10",
    position: {
      x: 3.704,
      y: 0.979,
      z: 14.716
    },
    rotation: {
      x: 0,
      y: 6.106,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    }
  },
  {
    id: "rock-11-mqyf7ffv-1",
    asset: "rock-11",
    position: {
      x: -5.505,
      y: 0.12,
      z: 12.314
    },
    rotation: {
      x: 0,
      y: 4.322,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    }
  },
  {
    id: "rock-11-mqyf7itw-2",
    asset: "rock-11",
    position: {
      x: -0.291,
      y: -0.13,
      z: 7.417
    },
    rotation: {
      x: 0,
      y: 0.884,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    }
  },
  {
    id: "rock-14-mqyf7prw-1",
    asset: "rock-14",
    position: {
      x: 6.553,
      y: 0.123,
      z: -3.787
    },
    rotation: {
      x: 0,
      y: 1.262,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    }
  },
  {
    id: "rock-11-mqyf7uco-3",
    asset: "rock-11",
    position: {
      x: -8.614,
      y: 0.013,
      z: -14.761
    },
    rotation: {
      x: 0,
      y: 0.052,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    }
  },
  {
    id: "rock-12-mqyf7yab-1",
    asset: "rock-12",
    position: {
      x: -14.585,
      y: 0.171,
      z: -10.116
    },
    rotation: {
      x: 0,
      y: 5.845,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    }
  },
  {
    id: "rock-2-mqyf818y-1",
    asset: "rock-2",
    position: {
      x: -10.167,
      y: 0.333,
      z: 2.917
    },
    rotation: {
      x: 0,
      y: 3.931,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    }
  },
  {
    id: "rock-1-mqyf84q1-1",
    asset: "rock-1",
    position: {
      x: -14.982,
      y: 0.072,
      z: -2.694
    },
    rotation: {
      x: 0,
      y: 6.164,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    }
  },
  {
    id: "rock-7-mqyf8s46-1",
    asset: "rock-7",
    position: {
      x: -3.592,
      y: 0.252,
      z: 12.698
    },
    rotation: {
      x: 0,
      y: 4.443,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    }
  },
  {
    id: "rock-13-mqyf92kz-1",
    asset: "rock-13",
    position: {
      x: -1.902,
      y: 0.549,
      z: 17.64
    },
    rotation: {
      x: 0,
      y: 1.056,
      z: 0
    },
    scale: {
      x: 1.03,
      y: 1.03,
      z: 1.03
    }
  },
  {
    id: "rock-13-mqyf9eih-2",
    asset: "rock-13",
    position: {
      x: 14.545,
      y: 1.018,
      z: -12.183
    },
    rotation: {
      x: 0,
      y: 3.168,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    }
  },
  {
    id: "rock-13-mqyf9ko6-3",
    asset: "rock-13",
    position: {
      x: 8.422,
      y: -0.157,
      z: 16.043
    },
    rotation: {
      x: 0,
      y: 0.639,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    }
  },
  {
    id: "rock-13-mqyf9lk0-4",
    asset: "rock-13",
    position: {
      x: 3.928,
      y: 1.018,
      z: 15.538
    },
    rotation: {
      x: 0,
      y: 3.626,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    }
  },
  {
    id: "rock-13-mqyf9pi0-5",
    asset: "rock-13",
    position: {
      x: 3.186,
      y: 0.118,
      z: 16.611
    },
    rotation: {
      x: 0,
      y: 4.821,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    }
  },
  {
    id: "rock-13-mqyf9tuv-6",
    asset: "rock-13",
    position: {
      x: 5.255,
      y: 0.107,
      z: 17.03
    },
    rotation: {
      x: 0,
      y: 2.401,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    }
  },
  {
    id: "rock-4-mqyfaxxi-1",
    asset: "rock-4",
    position: {
      x: 14.774,
      y: 0.444,
      z: -11.267
    },
    rotation: {
      x: 0,
      y: 4.339,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    }
  },
  {
    id: "rock-10-mqyfb7p8-2",
    asset: "rock-10",
    position: {
      x: 8.618,
      y: 0.234,
      z: -13.214
    },
    rotation: {
      x: 0,
      y: 0.863,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    }
  },
  {
    id: "rock-11-mqyfbcni-4",
    asset: "rock-11",
    position: {
      x: 12.951,
      y: -0.077,
      z: 0.429
    },
    rotation: {
      x: 0,
      y: 3.808,
      z: 0
    },
    scale: {
      x: 1,
      y: 1,
      z: 1
    }
  },
  {
    id: "bush-mqyfg15y-61",
    asset: "bush",
    position: {
      x: 2.255,
      y: 4.527,
      z: 5.722
    },
    rotation: {
      x: 0,
      y: 3.766,
      z: 0
    },
    scale: {
      x: 0.548,
      y: 0.548,
      z: 0.548
    },
    bushOptions: {
      bushType: "default",
      leafCount: 45,
      baseScale: 0.85,
      distributionScale: 1,
      randomSeed: 596777833
    }
  }
];
