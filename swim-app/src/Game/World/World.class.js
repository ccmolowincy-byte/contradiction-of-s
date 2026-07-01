import * as THREE from 'three';
import Game from '../Game.class';
import Lighting from './Components/Lighting/Lighting.class';
import Skydome from './Components/Skydome/Skydome.class';
import Ground from './Components/Ground/Ground.class';
import Pool from './Components/Pool/Pool.class';
import PoolDecor from './Components/Pool/PoolDecor.class';
import PaperSwimmer from './Components/Pool/PaperSwimmer.class';
import Rocks from './Components/Rocks/Rocks.class';
import Bush from './Components/Bush/Bush.class';
import Trees from './Components/TreeTrunks/TreeTrunks.class';
import FireFlies from './Components/FireFlies/FireFlies.class';
import FallingLeaves from './Components/FallingLeaves/FallingLeaves.class';
import Rain from './Components/Rain/Rain.class';
import SnowFall from './Components/SnowFall/SnowFall.class';
import { ParticleSystem } from './Systems/ParticleSystem.class';
import Lightning from './Systems/Lightning.class';
import Fog from './Components/Fog/Fog.class';
import EnvironmentDecor from '../Composer/EnvironmentDecor.class';
import { DEFAULT_ENVIRONMENT_SCENE_LAYOUT } from '../../config/environmentSceneLayout';
import { DEFAULT_FOLIAGE_COLORS } from '../../config/foliageColors';

export default class World {
  constructor() {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.lighting = new Lighting({
      helperEnabled: false,
    });
    this.skydome = new Skydome();
    this.debugGUI = this.game.debug;
    this.ground = new Ground();
    this.pool = new Pool();
    this.poolDecor = new PoolDecor(this.pool);
    this.paperSwimmers = new PaperSwimmer(this.pool);
    this.rocks = new Rocks();
    this.bush = new Bush();
    this.trees = new Trees();
    this.fallingLeaves = new FallingLeaves();
    this.fireFlies = new FireFlies();
    this.rain = new Rain();
    this.snowFall = new SnowFall();

    this.particleSystem = new ParticleSystem();

    const worldSize = this.ground.WORLD_SIZE;
    const halfSize = worldSize / 2 - 3;

    const groundBounds = {
      minX: -halfSize,
      maxX: halfSize,
      minZ: -halfSize,
      maxZ: halfSize,
    };

    this.lightning = new Lightning(this.particleSystem, groundBounds);

    this.fog = new Fog(worldSize);

    this.environmentDecor = new EnvironmentDecor(this);

    this.applyFoliageColors(DEFAULT_FOLIAGE_COLORS);

    if (DEFAULT_ENVIRONMENT_SCENE_LAYOUT.length > 0) {
      this.environmentDecor.applyLayout(DEFAULT_ENVIRONMENT_SCENE_LAYOUT, { exact: true });
    }

    if (this.debugGUI) {
      this.setupDebugUI();
    }
  }

  setupDebugUI() {
    const lightningControls = {
      strikeNow: () => this.lightning.manualStrike(),
    };

    this.debugGUI.add(
      lightningControls,
      'strikeNow',
      { label: 'Strike Lightning' },
      'Lightning'
    );
  }

  applyFoliageColors(colors = {}) {
    if (colors.grass) {
      const grassUniforms = this.ground?.grassManager?.sharedUniforms;
      if (grassUniforms) {
        if (colors.grass.dark) grassUniforms.uGrassColorDark.value.set(colors.grass.dark);
        if (colors.grass.light) grassUniforms.uGrassColorLight.value.set(colors.grass.light);
        if (colors.grass.shadow) grassUniforms.uShadowColor.value.set(colors.grass.shadow);
      }
    }

    let bushColors = colors.bush;
    if (!bushColors && colors.grass) {
      // No bush palette exported: derive from grass with a cyan shift.
      const mixCyan = (hex, amount = 0.25) => {
        const c = new THREE.Color(hex);
        const cyan = new THREE.Color(0x00ffff);
        c.lerp(cyan, amount);
        return `#${c.getHexString()}`;
      };
      bushColors = {
        shadow: mixCyan(colors.grass.dark, 0.2),
        mid: mixCyan(colors.grass.light, 0.3),
        highlight: mixCyan(colors.grass.shadow, 0.25),
      };
    }

    if (bushColors) {
      this.bush?.setComposerColors?.({
        shadowColor: bushColors.shadow,
        midColor: bushColors.mid,
        highlightColor: bushColors.highlight,
      });
    }
  }

  update(delta, elapsedTime) {
    this.ground.update();
    this.bush.update();
    this.skydome.update(delta, elapsedTime);
    this.pool.update(delta, elapsedTime);
    this.poolDecor.update(delta, elapsedTime);
    this.environmentDecor.update(delta, elapsedTime);
    this.paperSwimmers.update(delta, elapsedTime);
    this.fallingLeaves.update(delta);
    this.fireFlies.update(elapsedTime);
    this.rain.update(delta, elapsedTime);
    this.snowFall.update(delta, elapsedTime);

    this.particleSystem.update(delta, elapsedTime);
    this.lightning.update(delta);
  }

  dispose() {
    this.lighting.dispose();
    this.skydome.dispose();
    this.ground.dispose();
    this.pool.dispose();
    this.poolDecor.dispose();
    this.environmentDecor.dispose();
    this.paperSwimmers.dispose();
    this.fallingLeaves.dispose();
    this.fireFlies.dispose();
    this.rain.dispose();
    this.snowFall.dispose();
    this.fog.dispose();
    this.lightning.dispose();
    this.particleSystem.dispose();
  }
}
