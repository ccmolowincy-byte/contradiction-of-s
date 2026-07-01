import * as THREE from 'three';
import { BushManager } from '../World/Managers/BushManager/BushManager.class';

function averageScale(scale) {
  return Math.max(
    0.05,
    (Math.abs(scale.x) + Math.abs(scale.y) + Math.abs(scale.z)) / 3
  );
}

function makeSeed() {
  return Math.floor(Math.random() * 1000000000);
}

export default class BushPatch {
  constructor(world, options = {}) {
    this.world = world;
    this.bushSystem = world.bush;
    this.options = {
      bushType: 'default',
      leafCount: 45,
      baseScale: 1.0,
      distributionScale: 1.0,
      randomSeed: makeSeed(),
      ...options,
    };

    if (!Number.isFinite(this.options.randomSeed)) {
      this.options.randomSeed = makeSeed();
    }

    this.mesh = new THREE.Group();
    this.mesh.name = 'Bush patch';
    this.mesh.userData.bushPatch = this;

    this.proxyGeometry = new THREE.SphereGeometry(1.1, 16, 8);
    this.proxyMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
      colorWrite: false,
    });
    this.proxy = new THREE.Mesh(this.proxyGeometry, this.proxyMaterial);
    this.proxy.name = 'Bush patch selection volume';
    this.mesh.add(this.proxy);

    this.manager = null;
    this.decorId = null;
    this.decorAssetId = null;
    this.lastPosition = new THREE.Vector3(NaN, NaN, NaN);
    this.lastQuaternion = new THREE.Quaternion();
    this.lastScale = NaN;
    this.lastEnvTime = null;
    this.lastSeason = null;

    this.rebuild(this.mesh);
  }

  setEnvironmentDecorMetadata(id, assetId) {
    this.decorId = id;
    this.decorAssetId = assetId;
    this.mesh.userData.environmentDecorId = id;
    this.mesh.userData.environmentDecorAsset = assetId;
    this.proxy.userData.environmentDecorId = id;
    this.proxy.userData.environmentDecorAsset = assetId;

    if (this.manager?.instancedMesh) {
      this.manager.instancedMesh.userData.environmentDecorId = id;
      this.manager.instancedMesh.userData.environmentDecorAsset = assetId;
    }
  }

  getTransform(obj = this.mesh) {
    obj.updateMatrixWorld(true);

    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    obj.matrixWorld.decompose(position, quaternion, scale);

    return {
      position,
      quaternion,
      scale: averageScale(scale),
    };
  }

  getBushConfig(transform) {
    const bush = this.bushSystem;
    const bushType = this.options.bushType || 'default';
    const envTime = bush?.currentEnvTime || 'day';
    const defaults = bush?.getDefaults?.() || {};
    const colors = bush?.getColorsForBushType?.(bushType, envTime) || {};
    const colorMultiplier = bush?.getColorMultiplierForType?.(bushType, envTime);
    const toColor = (value, fallback) => {
      if (value?.isColor) return value.clone();
      if (Array.isArray(value)) return new THREE.Color(value[0], value[1], value[2]);
      if (Array.isArray(fallback)) return new THREE.Color(fallback[0], fallback[1], fallback[2]);
      if (fallback?.isColor) return fallback.clone();
      return new THREE.Color(0.25, 0.5, 0.12);
    };

    return {
      position: transform.position,
      rotation: transform.quaternion,
      distributionScale: (this.options.distributionScale || 1) * transform.scale,
      leafCount: Math.max(1, Math.floor(this.options.leafCount || defaults.leafCount || 45)),
      scale: (this.options.baseScale || defaults.scale || 1) * transform.scale,
      randomSeed: this.options.randomSeed,
      colorMultiplier: toColor(colorMultiplier, defaults.colorMultiplier),
      shadowColor: toColor(colors.shadowColor, defaults.shadowColor),
      midColor: toColor(colors.midColor, defaults.midColor),
      highlightColor: toColor(colors.highlightColor, defaults.highlightColor),
    };
  }

  needsRebuild(transform) {
    if (!this.manager) return true;
    if (Math.abs(transform.scale - this.lastScale) > 0.001) return true;
    if (transform.quaternion.angleTo(this.lastQuaternion) > 0.001) return true;
    if (this.bushSystem?.currentEnvTime !== this.lastEnvTime) return true;
    if (this.bushSystem?.currentSeason !== this.lastSeason) return true;
    return false;
  }

  rebuild(obj = this.mesh) {
    this.disposeManager();

    if (!this.bushSystem?.material || !this.bushSystem?.samplerMesh) {
      console.warn('BushPatch: Bush system not ready, cannot create patch');
      return;
    }

    const transform = this.getTransform(obj);
    const leafCount = Math.max(1, Math.floor(this.options.leafCount || 45));

    this.manager = new BushManager({
      material: this.bushSystem.material,
      samplerMesh: this.bushSystem.samplerMesh,
      maxLeaves: leafCount,
    });
    this.manager.instancedMesh.name = 'Composer bush leaves';
    this.manager.instancedMesh.frustumCulled = false;

    if (this.decorId) {
      this.setEnvironmentDecorMetadata(this.decorId, this.decorAssetId);
    }

    this.manager.addBush(this.getBushConfig(transform));
    this.lastPosition.copy(transform.position);
    this.lastQuaternion.copy(transform.quaternion);
    this.lastScale = transform.scale;
    this.lastEnvTime = this.bushSystem.currentEnvTime;
    this.lastSeason = this.bushSystem.currentSeason;
  }

  update(obj = this.mesh) {
    const transform = this.getTransform(obj);

    if (this.needsRebuild(transform)) {
      this.rebuild(obj);
    } else if (this.manager && !transform.position.equals(this.lastPosition)) {
      this.manager.updateBushPosition(0, transform.position);
      this.lastPosition.copy(transform.position);
    }

    if (this.manager && typeof this.manager.update === 'function') {
      this.manager.update();
    }
  }

  disposeManager() {
    if (this.manager && typeof this.manager.dispose === 'function') {
      this.manager.dispose();
    }
    this.manager = null;
  }

  dispose() {
    this.disposeManager();
    this.mesh.parent?.remove(this.mesh);
    this.proxyGeometry?.dispose();
    this.proxyMaterial?.dispose();
  }
}