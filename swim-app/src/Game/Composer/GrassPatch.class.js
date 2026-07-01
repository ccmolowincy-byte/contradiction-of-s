import * as THREE from 'three';
import grassVertexCommonChunk from '../../Shaders/Chunks/grass/grass.vertex_common_chunk.glsl';
import grassVertexBeginNormalChunk from '../../Shaders/Chunks/grass/grass.vertex_begin_normal_chunk.glsl';
import grassVertexBeginChunk from '../../Shaders/Chunks/grass/grass.vertex_begin_chunk.glsl';
import grassFragmentCommonChunk from '../../Shaders/Chunks/grass/grass.fragment_common_chunk.glsl';
import grassFragmentColorChunk from '../../Shaders/Chunks/grass/grass.fragment_color_chunk.glsl';
import flowersVertexShader from '../../Shaders/Materials/flowers/vertex.glsl';
import flowersFragmentShader from '../../Shaders/Materials/flowers/fragment.glsl';

let sharedFlowerMaterial = null;

function createRandom(seed) {
  if (!Number.isFinite(seed)) return Math.random;

  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createPatchUniforms(grassManager) {
  const sourceUniforms = grassManager.sharedUniforms;
  const patchUniforms = {};

  for (const key in sourceUniforms) {
    patchUniforms[key] = sourceUniforms[key];
  }

  // Disable density culling so patches show exactly where the user places them.
  patchUniforms.uDensityThreshold = { value: 0.0 };

  return patchUniforms;
}

function createPatchMaterial(grassManager) {
  const patchUniforms = createPatchUniforms(grassManager);
  const material = new THREE.MeshStandardMaterial();

  material.onBeforeCompile = (shader) => {
    shader.uniforms = { ...shader.uniforms, ...patchUniforms };

    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      grassVertexCommonChunk
    );

    shader.vertexShader = shader.vertexShader.replace(
      '#include <beginnormal_vertex>',
      grassVertexBeginNormalChunk
    );

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      grassVertexBeginChunk
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      grassFragmentCommonChunk
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      grassFragmentColorChunk
    );
  };

  return material;
}

function createFlowerAtlas(game) {
  const textures = [
    game.resources.items.flowerTexture1,
    game.resources.items.flowerTexture2,
  ].filter(Boolean);

  if (textures.length === 0) return null;

  const canvas = document.createElement('canvas');
  const size = 256;
  canvas.width = size * textures.length;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  textures.forEach((texture, i) => {
    const img = texture.image;
    if (img && img.complete) {
      ctx.drawImage(img, i * size, 0, size, size);
    }
  });

  const atlas = new THREE.CanvasTexture(canvas);
  atlas.needsUpdate = true;
  return atlas;
}

function getFlowerMaterial(game) {
  if (sharedFlowerMaterial) return sharedFlowerMaterial;

  const atlas = createFlowerAtlas(game);
  if (!atlas) return null;

  const fogUniforms = THREE.UniformsUtils.merge([THREE.UniformsLib['fog']]);
  sharedFlowerMaterial = new THREE.ShaderMaterial({
    fog: true,
    uniforms: {
      ...fogUniforms,
      uTime: { value: 0 },
      uFlowerAtlas: { value: atlas },
      uWindSpeed: { value: 1.5 },
      uWindAmplitude: { value: 0.3 },
      uTimeColorAlpha: { value: 1.0 },
    },
    vertexShader: flowersVertexShader,
    fragmentShader: flowersFragmentShader,
    side: THREE.FrontSide,
    alphaTest: 0.5,
    depthWrite: false,
    depthTest: true,
    transparent: true,
  });

  return sharedFlowerMaterial;
}

function updateFlowerMaterial(grassManager) {
  if (!sharedFlowerMaterial || !grassManager) return;
  sharedFlowerMaterial.uniforms.uTime.value = grassManager.sharedUniforms.uTime.value;

  const colors = grassManager.colorConfig?.[grassManager.envTime];
  if (colors && colors.flowerVisibility !== undefined) {
    sharedFlowerMaterial.uniforms.uTimeColorAlpha.value = colors.flowerVisibility;
  }
}

/**
 * A user-placed patch of grass blades, with optional flowers.
 *
 * Uses the same grass blade geometry and wind shader as the main lawn, but
 * bypasses density culling so it appears exactly where the composer places it.
 */
export default class GrassPatch {
  constructor(world, options = {}) {
    this.world = world;
    this.options = {
      shape: 'circle',
      baseRadius: 0.85,
      bladeCount: 360,
      bladeScaleMin: 0.9,
      bladeScaleMax: 1.15,
      bladeGroundOffset: 0.008,
      hasFlowers: false,
      flowerCount: 40,
      flowerCountMin: null,
      flowerCountMax: null,
      flowerSize: 0.24,
      flowerScale: 0.45,
      flowerYOffsetMin: 0.18,
      flowerYOffsetMax: 0.3,
      randomSeed: null,
      ...options,
    };

    this.count = Math.max(0, Math.floor(Number(this.options.bladeCount) || 0));
    this.random = createRandom(this.options.randomSeed);
    this.grassManager = world.ground?.grassManager;

    this.mesh = new THREE.Group();
    this.mesh.name = this.count > 0 ? 'Grass patch' : 'Flower sprinkle';

    if (this.count > 0 && !this.grassManager?.sharedGeometry) {
      console.warn('GrassPatch: GrassManager not ready, cannot create patch');
      return;
    }

    this.offsets = this.generateOffsets(this.count);

    if (this.count > 0) {
      this.geometry = this.grassManager.sharedGeometry.clone();
      this.geometry.computeBoundingBox();
      const bladeMinY =
        this.geometry.boundingBox?.min.y ??
        this.grassManager.sharedUniforms?.uBladeModelMinY?.value ??
        0;
      this.bladeBaseLift = Math.max(0, -bladeMinY);
      this.material = createPatchMaterial(this.grassManager);

      this.grassMesh = new THREE.InstancedMesh(
        this.geometry,
        this.material,
        this.count
      );
      this.grassMesh.receiveShadow = true;
      this.grassMesh.castShadow = false;
      this.grassMesh.frustumCulled = false;

      this.mesh.add(this.grassMesh);

      this.baseScales = new Float32Array(this.count);
      this.worldPositions = new Float32Array(this.count * 2);

      for (let i = 0; i < this.count; i++) {
        this.baseScales[i] = this.offsets[i].scale;
        this.worldPositions[i * 2] = 0;
        this.worldPositions[i * 2 + 1] = 0;
      }

      this.geometry.setAttribute(
        'aBaseScale',
        new THREE.InstancedBufferAttribute(this.baseScales, 1)
      );
      this.geometry.setAttribute(
        'aWorldPosition',
        new THREE.InstancedBufferAttribute(this.worldPositions, 2)
      );
    }

    if (this.options.hasFlowers) {
      this.createFlowers();
    }

    this.lastMatrix = new THREE.Matrix4();
    this.rebuild(this.mesh);
  }

  generateOffsets(count) {
    const offsets = [];
    const { shape, baseRadius } = this.options;
    const minScale = Number.isFinite(this.options.bladeScaleMin)
      ? this.options.bladeScaleMin
      : 0.9;
    const maxScale = Number.isFinite(this.options.bladeScaleMax)
      ? this.options.bladeScaleMax
      : 1.15;
    const scaleMin = Math.min(minScale, maxScale);
    const scaleMax = Math.max(minScale, maxScale);

    for (let i = 0; i < count; i++) {
      let x = 0;
      let z = 0;

      if (shape === 'square') {
        x = (this.random() - 0.5) * baseRadius * 2;
        z = (this.random() - 0.5) * baseRadius * 2;
      } else if (shape === 'ring') {
        const inner = baseRadius * 0.55;
        const r = inner + this.random() * (baseRadius - inner);
        const theta = this.random() * Math.PI * 2;
        x = r * Math.cos(theta);
        z = r * Math.sin(theta);
      } else if (shape === 'organic') {
        const theta = this.random() * Math.PI * 2;
        const lobe =
          0.78 +
          Math.sin(theta * 3.0) * 0.12 +
          Math.cos(theta * 5.0 + 0.7) * 0.1;
        const r = Math.sqrt(this.random()) * baseRadius * lobe;
        const stretch = 0.82 + this.random() * 0.35;
        x = r * Math.cos(theta);
        z = r * Math.sin(theta) * stretch;
      } else {
        // circle
        const r = Math.sqrt(this.random()) * baseRadius;
        const theta = this.random() * Math.PI * 2;
        x = r * Math.cos(theta);
        z = r * Math.sin(theta);
      }

      offsets.push({
        x,
        z,
        rot: this.random() * Math.PI,
        scale: scaleMin + this.random() * (scaleMax - scaleMin),
      });
    }

    return offsets;
  }

  resolveFlowerCount() {
    const hasMin = Number.isFinite(this.options.flowerCountMin);
    const hasMax = Number.isFinite(this.options.flowerCountMax);

    if (hasMin || hasMax) {
      const min = hasMin ? this.options.flowerCountMin : this.options.flowerCountMax;
      const max = hasMax ? this.options.flowerCountMax : this.options.flowerCountMin;
      const safeMin = Math.max(0, Math.floor(Number.isFinite(min) ? min : max));
      const safeMax = Math.max(safeMin, Math.floor(Number.isFinite(max) ? max : min));
      return safeMin + Math.floor(this.random() * (safeMax - safeMin + 1));
    }

    return Math.max(0, Math.floor(Number(this.options.flowerCount) || 0));
  }

  createFlowers() {
    const flowerMaterial = getFlowerMaterial(this.world.game);
    if (!flowerMaterial) return;

    const count = this.resolveFlowerCount();
    if (count <= 0) return;

    const flowerGeometry = new THREE.PlaneGeometry(
      this.options.flowerSize,
      this.options.flowerSize
    );

    this.flowerMesh = new THREE.InstancedMesh(
      flowerGeometry,
      flowerMaterial,
      count
    );
    this.flowerMesh.castShadow = true;
    this.flowerMesh.receiveShadow = true;
    this.flowerMesh.frustumCulled = false;

    this.flowerOffsets = [];
    const texOffsets = new Float32Array(count * 2);
    const sourceOffsets = this.offsets.length ? this.offsets : this.generateOffsets(count);
    const yMin = Number.isFinite(this.options.flowerYOffsetMin)
      ? this.options.flowerYOffsetMin
      : 0.18;
    const yMax = Number.isFinite(this.options.flowerYOffsetMax)
      ? this.options.flowerYOffsetMax
      : 0.3;
    const yOffsetMin = Math.min(yMin, yMax);
    const yOffsetMax = Math.max(yMin, yMax);

    for (let i = 0; i < count; i++) {
      const off = sourceOffsets[Math.floor(this.random() * sourceOffsets.length)];
      const texIndex = Math.floor(this.random() * 2);

      texOffsets[i * 2] = texIndex * 0.5;
      texOffsets[i * 2 + 1] = 0;

      this.flowerOffsets.push({
        x: off.x,
        z: off.z,
        rot: this.random() * Math.PI,
        scale: this.options.flowerScale * (0.65 + this.random() * 0.35),
        yOffset: yOffsetMin + this.random() * (yOffsetMax - yOffsetMin),
      });
    }

    flowerGeometry.setAttribute(
      'aTexOffset',
      new THREE.InstancedBufferAttribute(texOffsets, 2)
    );

    this.mesh.add(this.flowerMesh);
  }

  rebuild(obj) {
    if (!this.grassMesh && !this.flowerMesh) return;

    obj.updateMatrixWorld(true);
    const matrixWorld = obj.matrixWorld;
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    matrixWorld.decompose(position, quaternion, scale);

    const rotY = new THREE.Euler().setFromQuaternion(quaternion).y;
    const radiusScale = Math.max(0.05, (scale.x + scale.y + scale.z) / 3);

    const cosR = Math.cos(rotY);
    const sinR = Math.sin(rotY);

    const dummy = new THREE.Object3D();
    const worldPositions = this.geometry?.attributes?.aWorldPosition?.array;

    if (this.grassMesh && worldPositions) {
      for (let i = 0; i < this.count; i++) {
        const off = this.offsets[i];

        const lx = off.x * radiusScale;
        const lz = off.z * radiusScale;
        const wx = lx * cosR - lz * sinR + position.x;
        const wz = lx * sinR + lz * cosR + position.z;

        const yLift =
          this.bladeBaseLift * off.scale + (this.options.bladeGroundOffset || 0);

        dummy.position.set(off.x, yLift, off.z);
        dummy.rotation.set(0, off.rot, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();

        this.grassMesh.setMatrixAt(i, dummy.matrix);

        worldPositions[i * 2] = wx;
        worldPositions[i * 2 + 1] = wz;
      }

      this.grassMesh.instanceMatrix.needsUpdate = true;
      this.geometry.attributes.aWorldPosition.needsUpdate = true;
    }

    if (this.flowerMesh) {
      for (let i = 0; i < this.flowerOffsets.length; i++) {
        const off = this.flowerOffsets[i];
        const lx = off.x * radiusScale;
        const lz = off.z * radiusScale;
        const wx = lx * cosR - lz * sinR + position.x;
        const wz = lx * sinR + lz * cosR + position.z;

        dummy.position.set(off.x, off.yOffset, off.z);
        dummy.rotation.set(0, off.rot, 0);
        dummy.scale.setScalar(off.scale);
        dummy.updateMatrix();

        this.flowerMesh.setMatrixAt(i, dummy.matrix);
      }
      this.flowerMesh.instanceMatrix.needsUpdate = true;
    }

    this.lastMatrix.copy(matrixWorld);
  }

  update(obj) {
    if (!this.grassMesh && !this.flowerMesh) return;

    obj.updateMatrixWorld(true);
    if (!this.lastMatrix.equals(obj.matrixWorld)) {
      this.rebuild(obj);
    }

    if (this.grassManager) {
      updateFlowerMaterial(this.grassManager);
    }
  }

  dispose() {
    if (this.mesh) {
      this.mesh.parent?.remove(this.mesh);
      if (typeof this.mesh.dispose === 'function') {
        this.mesh.dispose();
      }
    }
    if (this.geometry) {
      this.geometry.dispose();
    }
    if (this.material) {
      this.material.dispose();
    }
    if (this.flowerMesh?.geometry) {
      this.flowerMesh.geometry.dispose();
    }
  }
}
