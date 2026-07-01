import * as THREE from 'three';
import Game from '../../../Game.class';

/**
 * PaperSwimmer — a user-generated character rendered as a flat paper sheet
 * floating face-up on the pool. The character art (composited avatar layers:
 * body / head / top / bottom) is mapped onto a subdivided plane that:
 *   • lies flat on the water surface,
 *   • undulates (vertex wave) as if it were paper warping with the ripples,
 *   • bobs and lazily drifts + rotates around the pool.
 *
 * Textures here are test stand-ins; live characters come from the character
 * creator and can be swapped in by passing their texture/URL to add().
 */
export default class PaperSwimmer {
  constructor(pool) {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.resources = this.game.resources;
    this.pool = pool;

    this.WATER_Y = pool ? pool.WATER_Y : 1.0;
    this.halfX = (pool ? pool.INNER_X : 12) / 2;
    this.halfZ = (pool ? pool.INNER_Z : 7) / 2;

    this.swimmers = [];
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Prefer the visitor's own character (built in the Character Builder and
    // handed off via localStorage as a 300×440 transparent paper figure). Fall
    // back to the bundled test stand-in when nobody has built one yet.
    const userArt = this.loadUserCharacterTexture();
    if (userArt) {
      this.add(userArt, { x: -1.6, z: 0.6, drift: 0.9, phase: 0.0 });
    } else {
      this.add(this.resources.items.poolSwimmer1Texture, { x: -1.6, z: 0.6, drift: 0.9, phase: 0.0 });
    }
  }

  /**
   * Reads the character saved by the Character Builder (same origin, served at
   * /, while this app lives at /swim/). Returns a THREE.Texture that fills in
   * once the data-URL image decodes, or null if no character has been built.
   */
  loadUserCharacterTexture() {
    let dataURL = null;
    try {
      dataURL = localStorage.getItem('avatarPortraitTransparent')
             || localStorage.getItem('avatarPortrait');
    } catch (e) {
      return null; // storage blocked (private mode) — use the stand-in
    }
    if (!dataURL) return null;
    const tex = new THREE.TextureLoader().load(dataURL);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /** Add a paper swimmer from a THREE.Texture (a composited avatar portrait). */
  add(texture, { x = 0, z = 0, drift = 1.0, phase = 0.0, scale = 1.0 } = {}) {
    if (!texture) return null;
    texture.colorSpace = THREE.SRGBColorSpace;

    // Paper proportions follow the 300x440 avatar stage.
    const w = 1.5 * scale;
    const h = 2.2 * scale;
    const geo = new THREE.PlaneGeometry(w, h, 24, 36);

    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.4,
      side: THREE.DoubleSide,
      roughness: 0.9,
      metalness: 0.0,
    });
    const uniforms = { uTime: { value: 0 }, uAmp: { value: 0.09 }, uPhase: { value: phase } };
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.uniforms.uAmp = uniforms.uAmp;
      shader.uniforms.uPhase = uniforms.uPhase;
      shader.vertexShader =
        'uniform float uTime;\nuniform float uAmp;\nuniform float uPhase;\n' +
        shader.vertexShader.replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
           // paper warp: local +z becomes world up once the mesh is laid flat
           float pw = sin(position.x * 2.3 + uTime * 1.6 + uPhase) * 0.5
                    + sin(position.y * 2.9 - uTime * 1.2 + uPhase) * 0.5;
           transformed.z += pw * uAmp;`
        );
    };

    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;        // lay flat, face up
    mesh.position.set(x, this.WATER_Y + 0.02, z);
    mesh.renderOrder = 3;                    // draw over the water
    this.group.add(mesh);

    const swimmer = {
      mesh, uniforms,
      home: new THREE.Vector2(x, z),
      drift,
      phase,
      yaw: phase,
    };
    this.swimmers.push(swimmer);
    return swimmer;
  }

  update(delta, elapsedTime) {
    const maxX = this.halfX - 1.1;
    const maxZ = this.halfZ - 1.1;
    for (const s of this.swimmers) {
      s.uniforms.uTime.value = elapsedTime;
      // lazy Lissajous drift kept inside the pool
      const t = elapsedTime * 0.12 * s.drift + s.phase;
      const px = s.home.x + Math.sin(t) * 1.1;
      const pz = s.home.y + Math.cos(t * 0.8) * 0.8;
      s.mesh.position.x = THREE.MathUtils.clamp(px, -maxX, maxX);
      s.mesh.position.z = THREE.MathUtils.clamp(pz, -maxZ, maxZ);
      s.mesh.position.y = this.WATER_Y + 0.02 + Math.sin(elapsedTime * 1.0 + s.phase) * 0.025;
      // slow spin on the water + a touch of tilt sway
      s.mesh.rotation.z = Math.sin(elapsedTime * 0.25 + s.phase) * 0.5;
      s.mesh.rotation.x = -Math.PI / 2 + Math.sin(elapsedTime * 0.6 + s.phase) * 0.03;
    }
  }

  dispose() {
    this.group.traverse((o) => {
      if (o.isMesh) {
        o.geometry?.dispose?.();
        o.material?.dispose?.();
      }
    });
    this.scene.remove(this.group);
  }
}
