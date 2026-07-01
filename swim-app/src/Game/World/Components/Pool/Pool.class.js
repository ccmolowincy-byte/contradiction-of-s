import * as THREE from 'three';
import Game from '../../../Game.class';

/**
 * Pool — the centrepiece of the "Go for a Swim" diorama.
 *
 * An in-ground pool set into a raised tiled patio: a cream deck frame with a
 * rectangular cavity, mosaic-tiled interior walls + floor, a stylised toon-water
 * surface (animated ripples + caustics + edge foam), coping rim, and a diving
 * board. Self-contained so it doesn't fight the season-coupled ground/lake system.
 *
 * Coordinate notes (scene is ~33u across, ground at y=0):
 *   patio top  = PATIO_Y (1.2)      water surface = WATER_Y (1.0)
 *   pool floor = FLOOR_Y (0.2)      inner opening = INNER_X x INNER_Z (12 x 7)
 */
export default class Pool {
  constructor() {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.resources = this.game.resources;

    // Layout
    this.INNER_X = 12;
    this.INNER_Z = 7;
    this.PATIO_W = 3.6;          // patio border width on each side
    this.PATIO_Y = 1.2;
    this.WATER_Y = 1.0;
    this.FLOOR_Y = 0.2;

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.waterMaterial = null;

    this.buildMaterials();
    this.buildPatio();
    this.buildBasin();
    this.buildCoping();
    this.buildWater();
    this.buildDivingBoard();

    this.scene.add(this.group);
  }

  buildMaterials() {
    const mosaic = this.resources.items.poolMosaicTexture;
    mosaic.colorSpace = THREE.SRGBColorSpace;
    mosaic.wrapS = mosaic.wrapT = THREE.RepeatWrapping;
    mosaic.anisotropy = 4;

    // Tiled interior — mosaic, repeated so tiles stay small.
    this.tileMat = new THREE.MeshStandardMaterial({
      map: mosaic,
      roughness: 0.45,
      metalness: 0.0,
    });
    this.floorMat = this.tileMat.clone();

    // Cream stone patio deck.
    this.deckMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.93, 0.89, 0.82),
      roughness: 0.9,
      metalness: 0.0,
    });
    // Lighter coping rim.
    this.copingMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.97, 0.95, 0.9),
      roughness: 0.8,
    });
    // Warm wood for the diving board.
    this.woodMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.82, 0.62, 0.4),
      roughness: 0.85,
    });
  }

  buildPatio() {
    const halfIX = this.INNER_X / 2;
    const halfIZ = this.INNER_Z / 2;
    const w = this.PATIO_W;
    const H = this.PATIO_Y;          // box runs y: 0 → PATIO_Y
    const yC = H / 2;
    const outerX = this.INNER_X + 2 * w;

    const strips = [
      // left / right full-depth strips
      { sx: w, sz: this.INNER_Z + 2 * w, x: -(halfIX + w / 2), z: 0 },
      { sx: w, sz: this.INNER_Z + 2 * w, x: halfIX + w / 2, z: 0 },
      // front / back strips spanning only the inner width
      { sx: this.INNER_X, sz: w, x: 0, z: -(halfIZ + w / 2) },
      { sx: this.INNER_X, sz: w, x: 0, z: halfIZ + w / 2 },
    ];
    strips.forEach((s) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(s.sx, H, s.sz), this.deckMat);
      m.position.set(s.x, yC, s.z);
      m.receiveShadow = true;
      m.castShadow = true;
      this.group.add(m);
    });
    this.outerX = outerX;
  }

  buildBasin() {
    const halfIX = this.INNER_X / 2;
    const halfIZ = this.INNER_Z / 2;
    const wallH = this.PATIO_Y - this.FLOOR_Y;
    const wallY = this.FLOOR_Y + wallH / 2;
    const tileRepeat = 2.2;

    // Floor (tiles face up)
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(this.INNER_X, this.INNER_Z),
      this.floorMat
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, this.FLOOR_Y, 0);
    floor.receiveShadow = true;
    this.floorMat.map = this.floorMat.map.clone();
    this.floorMat.map.repeat.set(this.INNER_X / tileRepeat, this.INNER_Z / tileRepeat);
    this.floorMat.map.wrapS = this.floorMat.map.wrapT = THREE.RepeatWrapping;
    this.group.add(floor);

    // Four interior walls (mosaic), facing inward. Each gets its own map clone
    // with a per-wall repeat so the tiles stay square (a shared 1:1 map stretched
    // across a wide/short wall is what looked glitched).
    const TILE = 2.2;   // world units per texture repeat (matches the floor)
    const mk = (w, h, rotY) => {
      const map = this.tileMat.map.clone();
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.repeat.set(w / TILE, h / TILE);
      map.needsUpdate = true;
      const mat = new THREE.MeshStandardMaterial({
        map,
        roughness: 0.45,
        metalness: 0.0,
        side: THREE.DoubleSide,
      });
      const geo = new THREE.PlaneGeometry(w, h);
      const m = new THREE.Mesh(geo, mat);
      m.rotation.y = rotY;
      m.receiveShadow = true;
      return m;
    };
    // long walls (front/back), width = INNER_X
    const back = mk(this.INNER_X, wallH, 0);
    back.position.set(0, wallY, -halfIZ);            // normal +z (inward)
    const front = mk(this.INNER_X, wallH, Math.PI);
    front.position.set(0, wallY, halfIZ);            // normal -z
    // short walls (left/right), width = INNER_Z
    const left = mk(this.INNER_Z, wallH, Math.PI / 2);
    left.position.set(-halfIX, wallY, 0);            // normal +x
    const right = mk(this.INNER_Z, wallH, -Math.PI / 2);
    right.position.set(halfIX, wallY, 0);            // normal -x
    [back, front, left, right].forEach((m) => this.group.add(m));
  }

  buildCoping() {
    // A thin raised rim around the pool opening edge.
    const halfIX = this.INNER_X / 2;
    const halfIZ = this.INNER_Z / 2;
    const t = 0.35;            // coping width
    const h = 0.12;            // coping height above patio
    const y = this.PATIO_Y + h / 2;
    const segs = [
      { sx: this.INNER_X + 2 * t, sz: t, x: 0, z: -(halfIZ + t / 2) },
      { sx: this.INNER_X + 2 * t, sz: t, x: 0, z: halfIZ + t / 2 },
      { sx: t, sz: this.INNER_Z, x: -(halfIX + t / 2), z: 0 },
      { sx: t, sz: this.INNER_Z, x: halfIX + t / 2, z: 0 },
    ];
    segs.forEach((s) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(s.sx, h, s.sz), this.copingMat);
      m.position.set(s.x, y, s.z);
      m.castShadow = true;
      m.receiveShadow = true;
      this.group.add(m);
    });
  }

  buildWater() {
    const geo = new THREE.PlaneGeometry(this.INNER_X - 0.06, this.INNER_Z - 0.06, 80, 48);
    this.waterMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uShallow: { value: new THREE.Color(0.45, 0.85, 0.92) },
        uDeep: { value: new THREE.Color(0.06, 0.42, 0.66) },
        uFoam: { value: new THREE.Color(0.96, 0.99, 1.0) },
        uSize: { value: new THREE.Vector2(this.INNER_X, this.INNER_Z) },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        varying vec2 vUv;
        varying float vWave;
        void main() {
          vUv = uv;
          vec3 p = position;
          // gentle surface undulation (also the function paper floats will sample)
          float w = sin(p.x * 1.6 + uTime * 1.1) * 0.5 + sin(p.y * 2.1 - uTime * 0.9) * 0.5;
          vWave = w;
          p.z += w * 0.045;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        uniform float uTime;
        uniform vec3 uShallow;
        uniform vec3 uDeep;
        uniform vec3 uFoam;
        uniform vec2 uSize;
        varying vec2 vUv;
        varying float vWave;

        // cheap value noise
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5); }
        float noise(vec2 p){
          vec2 i = floor(p), f = fract(p);
          float a = hash(i), b = hash(i+vec2(1.,0.));
          float c = hash(i+vec2(0.,1.)), d = hash(i+vec2(1.,1.));
          vec2 u = f*f*(3.-2.*f);
          return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
        }

        void main() {
          vec2 uv = vUv;
          // base depth gradient (deeper toward the middle)
          float edge = min(min(uv.x, 1.0-uv.x), min(uv.y, 1.0-uv.y));
          float depth = smoothstep(0.0, 0.35, edge);
          vec3 col = mix(uShallow, uDeep, depth);

          // drifting caustic ripple bands
          vec2 sc = uv * vec2(uSize.x, uSize.y) * 0.5;
          float t = uTime * 0.35;
          float n = noise(sc + vec2(t, -t*0.6));
          n += 0.5 * noise(sc * 2.3 - vec2(t*0.8, t));
          float caustic = smoothstep(0.55, 0.95, n);
          col = mix(col, uFoam, caustic * 0.35);

          // thin animated sparkle lines
          float lines = sin((uv.x + uv.y) * 60.0 + uTime * 1.5 + n * 4.0);
          lines = smoothstep(0.92, 1.0, lines);
          col = mix(col, uFoam, lines * 0.25);

          // foam ring at the pool edge
          float foam = 1.0 - smoothstep(0.0, 0.045, edge);
          foam *= 0.6 + 0.4 * sin(uv.x * 90.0 + uTime * 2.0) * sin(uv.y * 70.0 - uTime);
          col = mix(col, uFoam, clamp(foam, 0.0, 1.0) * 0.8);

          // slight wave shimmer
          col += vWave * 0.04;

          float alpha = mix(0.78, 0.93, depth);
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });

    const water = new THREE.Mesh(geo, this.waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, this.WATER_Y, 0);
    water.renderOrder = 2;
    this.water = water;
    this.group.add(water);
  }

  buildDivingBoard() {
    const board = new THREE.Group();
    // plank overhanging the water at the -x short end
    const plank = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.14, 1.1), this.woodMat);
    plank.position.set(0, 0, 0);
    plank.castShadow = true;
    board.add(plank);
    // two support posts at the rooted end
    const postMat = this.copingMat;
    [-0.45, 0.45].forEach((z) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.7, 0.22), postMat);
      post.position.set(-1.1, -0.42, z);
      post.castShadow = true;
      board.add(post);
    });
    // base block on the patio
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.3, 1.4), this.copingMat);
    base.position.set(-1.25, -0.62, 0);
    base.castShadow = true;
    board.add(base);

    // place at -x end, plank reaching out over the water
    board.position.set(-this.INNER_X / 2 - 0.4, this.PATIO_Y + 0.55, 0);
    board.rotation.y = 0;
    // nudge plank so its free end hangs over the water
    board.children[0].position.x = 0.9;
    this.divingBoard = board;
    this.group.add(board);
  }

  update(delta, elapsedTime) {
    if (this.waterMaterial) {
      this.waterMaterial.uniforms.uTime.value = elapsedTime;
    }
  }

  dispose() {
    this.group.traverse((o) => {
      if (o.isMesh) {
        o.geometry?.dispose?.();
        if (o.material?.map && o.material.map !== this.tileMat.map) o.material.map.dispose?.();
        o.material?.dispose?.();
      }
    });
    this.scene.remove(this.group);
  }
}
