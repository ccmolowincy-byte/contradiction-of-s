import * as THREE from 'three';
import Game from '../Game.class';
import { ENVIRONMENT_DECOR_ASSETS } from '../../config/environmentSceneLayout';
import GrassPatch from './GrassPatch.class';
import BushPatch from './BushPatch.class';

function round(value, digits = 3) {
  return Number(value.toFixed(digits));
}

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * EnvironmentDecor exposes environment scene elements as editable composer
 * items, including dynamic grass and bush patches backed by vendored managers.
 */
export default class EnvironmentDecor {
  constructor(world) {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.world = world;
    this.resources = this.game.resources;

    this.items = [];
    this.group = new THREE.Group();
    this.group.name = 'Editable environment decor';
    this.scene.add(this.group);

    this.treeTemplates = this.buildTreeTemplates();
    this.rockTemplates = this.buildRockTemplates();
    this.buildAssetMaps();

    this.harvest();
    this.defaultLayout = this.serializeLayout();
  }

  buildTreeTemplates() {
    const sourceModel = this.resources.items.TreeTrunksModel?.scene;
    if (!sourceModel) return [];

    const templates = [];
    const sourceClone = sourceModel.clone(true);
    const meshes = [];

    sourceClone.traverse((child) => {
      if (child.isMesh) meshes.push(child);
    });

    meshes.forEach((child) => {
      // Match the original harvest behaviour: centre the wrapper on the mesh's
      // bounding box so transform handles sit on the trunk cluster.
      const wrapper = this.wrapMeshCluster([child]);
      wrapper.userData.treeTemplateIndex = templates.length;
      templates.push(wrapper);
    });

    return templates;
  }

  buildRockTemplates() {
    const sourceModel = this.world.rocks?.rocksModel;
    if (!sourceModel) return [];

    const templates = this.splitModelIntoClusters(sourceModel.clone(true), 'rock');
    templates.forEach((template, index) => {
      template.userData.rockTemplateIndex = index;
    });

    return templates;
  }

  buildAssetMaps() {
    const baseAssets = ENVIRONMENT_DECOR_ASSETS.map((asset) => {
      if (asset.id === 'tree') {
        return { ...asset, label: 'Tree trunk', treeIndex: 0 };
      }
      if (asset.id === 'rock') {
        return {
          ...asset,
          label: this.rockTemplates.length > 1 ? 'Rock 1' : asset.label,
          rockIndex: 0,
          seedable: true,
          placementYOffset: this.getPlacementYOffset(this.rockTemplates[0]),
        };
      }
      return asset;
    });

    this.treeAssets = this.treeTemplates.map((_, index) => ({
      id: `tree-${index}`,
      label: `Tree trunk ${index + 1}`,
      singleton: false,
      treeIndex: index,
    }));

    this.rockAssets = this.rockTemplates.slice(1).map((template, index) => ({
      id: `rock-${index + 1}`,
      label: `Rock ${index + 2}`,
      singleton: false,
      rockIndex: index + 1,
      seedable: true,
      placementYOffset: this.getPlacementYOffset(template),
    }));

    this.assetLibrary = [
      ...this.treeAssets,
      ...baseAssets.filter((asset) => asset.id !== 'tree' && !asset.hidden),
      ...this.rockAssets,
    ];

    this.assetById = new Map(
      [...baseAssets, ...this.treeAssets, ...this.rockAssets].map((asset) => [
        asset.id,
        asset,
      ])
    );
  }

  getPlacementYOffset(template) {
    if (!template) return 0;

    const clone = template.clone(true);
    clone.position.set(0, 0, 0);
    clone.rotation.set(0, 0, 0);
    clone.scale.set(1, 1, 1);
    clone.updateWorldMatrix(true, true);

    const box = new THREE.Box3().setFromObject(clone);
    return box.isEmpty() ? 0 : Math.max(0, -box.min.y);
  }

  getAssetById(id) {
    return this.assetById.get(id) || this.assetById.get('tree');
  }

  getAssetLibrary() {
    return this.assetLibrary;
  }

  createEntry(assetId, overrides = {}) {
    const asset = this.getAssetById(assetId);
    const count =
      this.items.filter((item) => item.asset.id === asset.id).length + 1;

    return {
      id: `${asset.id}-${Date.now().toString(36)}-${count}`,
      asset: asset.id,
      position: asset.singleton
        ? { x: 0, y: 0, z: 0 }
        : { x: 0, y: asset.placementYOffset || 0, z: 8 + count * 0.3 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      ...asset.defaults,
      ...overrides,
    };
  }

  applyLayout(layout = this.defaultLayout, options = {}) {
    this.clear();
    const safeLayout = Array.isArray(layout) ? layout : this.defaultLayout;
    if (options.exact) {
      this.setBaseWorldVisibility(false);
    }
    safeLayout.forEach((entry) => this.addEntry(entry));
    this.setLegacyLakeVisible(
      safeLayout.some((entry) => entry?.asset === 'lake')
    );
  }

  resetDefaultLayout() {
    this.applyLayout(this.defaultLayout);
  }

  addEntry(entry) {
    const asset = this.getAssetById(entry.asset);
    if (!asset) {
      console.warn('EnvironmentDecor: unknown asset', entry.asset);
      return null;
    }

    if (asset.singleton) {
      const existing = this.items.find((item) => item.asset.id === asset.id);
      if (existing) {
        this.applyEntryTransform(existing.obj, entry);
        existing.obj.visible = true;
        existing.entry = { ...existing.entry, ...entry };
        this.applyGroundTexture(entry);
        return existing;
      }
    }

    const obj = this.createObjectForAsset(asset, entry);
    if (!obj) return null;

    obj.name = entry.id;
    obj.userData.environmentDecor = true;
    obj.userData.environmentDecorId = entry.id;
    obj.userData.environmentDecorAsset = asset.id;

    this.applyEntryTransform(obj, entry);
    obj.visible = true;
    this.group.add(obj);
    this.applyGroundTexture(entry);

    const item = {
      id: entry.id,
      asset,
      entry: clonePlain(entry),
      obj,
      singleton: !!asset.singleton,
      originalPosition: obj.position.clone(),
      originalRotationY: obj.rotation.y,
      originalScale: obj.scale.clone(),
    };

    if (obj.userData.grassPatch) {
      item.grassPatch = obj.userData.grassPatch;
      item.grassPatch.update(item.obj);
    }

    if (obj.userData.bushPatch) {
      item.bushPatch = obj.userData.bushPatch;
      item.bushPatch.setEnvironmentDecorMetadata?.(entry.id, asset.id);
      item.bushPatch.update(item.obj);
    }

    this.items.push(item);

    return item;
  }

  createObjectForAsset(asset, entry) {
    if (asset.treeIndex !== undefined) {
      return this.createTreeObject(asset.treeIndex);
    }

    if (asset.rockIndex !== undefined) {
      return this.createRockObject(asset.rockIndex);
    }

    if (asset.defaults?.patchOptions || asset.id.startsWith('grassPatch')) {
      return this.createGrassPatchObject(entry, asset);
    }

    if (asset.defaults?.bushOptions || asset.id.startsWith('bush')) {
      return this.createBushPatchObject(entry);
    }

    if (asset.resourceId) {
      return this.createResourceObject(asset.resourceId);
    }

    switch (asset.id) {
      case 'tree':
        return this.createTreeObject(0);
      case 'rock':
        return this.createRockObject(0);
      case 'lake':
        return this.createLakeObject();
      case 'pool':
        return this.createPoolObject();
      case 'ground':
        return this.createGroundObject();
      default:
        return null;
    }
  }

  applyEntryTransform(obj, entry) {
    const position = entry.position || {};
    const rotation = entry.rotation || {};
    const scale = entry.scale ?? { x: 1, y: 1, z: 1 };

    obj.position.set(position.x || 0, position.y || 0, position.z || 0);
    obj.rotation.set(rotation.x || 0, rotation.y || 0, rotation.z || 0);

    if (typeof scale === 'number') {
      obj.scale.setScalar(scale);
    } else {
      obj.scale.set(scale.x ?? 1, scale.y ?? 1, scale.z ?? 1);
    }
  }

  applyGroundTexture(entry) {
    if (entry.asset !== 'ground') return;
    if (!this.world.ground || !this.world.ground.setGroundTexture) return;

    const textureId = entry.groundTexture || 'default';
    this.world.ground.setGroundTexture(textureId);
  }

  applyBushColors(colors) {
    this.world.bush?.setComposerColors?.(colors);
    this.items.forEach((item) => {
      item.bushPatch?.manager?.setAllColors?.(this.world.bush.composerColorOverride);
    });
  }

  duplicateItem(id) {
    const item = this.getItemById(id);
    if (!item || item.singleton) return null;

    const entry = this.serializeItem(item);
    entry.id = `${entry.asset}-${Date.now().toString(36)}`;
    entry.position.x += 0.6;
    entry.position.z += 0.6;

    return this.addEntry(entry);
  }

  removeItem(id) {
    const item = this.getItemById(id);
    if (!item || item.singleton) return false;

    if (item.grassPatch) {
      item.grassPatch.dispose();
    }
    if (item.bushPatch) {
      item.bushPatch.dispose();
    }

    this.group.remove(item.obj);
    this.items = this.items.filter((candidate) => candidate !== item);

    return true;
  }

  getItemById(id) {
    return this.items.find((item) => item.id === id) || null;
  }

  getItemFromObject(object) {
    let current = object;
    while (current) {
      if (current.userData?.environmentDecorId) {
        return this.getItemById(current.userData.environmentDecorId);
      }
      current = current.parent;
    }
    return null;
  }


  clear() {
    this.items.slice().forEach((item) => {
      if (!item.singleton) this.removeItem(item.id);
    });

    // Singletons are left in place; re-attach them to the scene so they survive a reset.
    this.items.forEach((item) => {
      if (item.singleton) {
        this.scene.attach(item.obj);
        item.obj.visible = false;
      }
    });

    this.items = [];
  }

  blankCanvas() {
    this.items.forEach((item) => {
      if (item.grassPatch) {
        item.grassPatch.dispose();
        return;
      }
      if (item.bushPatch) {
        item.bushPatch.dispose();
        return;
      }
      // Preserve world transform before detaching from the composer group.
      this.scene.attach(item.obj);
    });

    this.group.clear();
    this.items = [];
  }

  setBaseWorldVisibility(visible) {
    if (this.world.pool?.group) {
      this.world.pool.group.visible = visible;
    }
    this.setLegacyLakeVisible(visible);
    const grassManager = this.world.ground?.grassManager;
    if (grassManager?.setBaseLayerVisible) {
      grassManager.setBaseLayerVisible(visible);
    } else {
      if (grassManager?.grassInstancedMesh) {
        grassManager.grassInstancedMesh.visible = visible;
      }
      if (grassManager?.flowerInstancedMesh) {
        grassManager.flowerInstancedMesh.visible = visible;
      }
    }
    if (this.world.bush?.bushManager?.instancedMesh) {
      this.world.bush.bushManager.instancedMesh.visible = visible;
    }
  }

  setLegacyLakeVisible(visible) {
    if (this.world.ground?.setLegacyLakeVisible) {
      this.world.ground.setLegacyLakeVisible(visible);
      return;
    }
    if (this.world.ground?.ripples) {
      this.world.ground.ripples.visible = visible;
    }
  }

  /**
   * Blank slate: keep only the editable ground item. Hide the pool, lake,
   * default grass lawn, and vendored bushes so the user can build from scratch.
   */
  newScene() {
    this.items.forEach((item) => {
      if (item.asset.id === 'ground') return;

      if (item.grassPatch) {
        item.grassPatch.dispose();
        return;
      }
      if (item.bushPatch) {
        item.bushPatch.dispose();
        return;
      }

      // Detach from composer group and hide singletons (pool, lake).
      this.scene.attach(item.obj);
      item.obj.visible = false;
    });

    // Keep only the ground item in the composer list.
    this.items = this.items.filter((item) => item.asset.id === 'ground');

    // Remove any orphaned children left in the composer group.
    this.group.children.slice().forEach((child) => {
      const stillManaged = this.items.some((item) => item.obj === child);
      if (!stillManaged) {
        this.group.remove(child);
      }
    });

    this.setBaseWorldVisibility(false);
  }

  resetDefaultLayout() {
    this.applyLayout(this.defaultLayout);
    this.setBaseWorldVisibility(true);
  }

  // --------------------------------------------------------------------------
  // Harvesting existing world objects
  // --------------------------------------------------------------------------

  harvest() {
    this.harvestTrees();
    this.harvestRocks();
    this.harvestLake();
    this.harvestPool();
    this.harvestGround();
  }

  harvestTrees() {
    const model = this.world.trees?.treeModel;
    if (!model) return;

    this.scene.remove(model);

    this.treeTemplates.forEach((template, index) => {
      const asset = this.treeAssets[index];
      const clone = template.clone(true);
      this.registerWrapperItem(`${asset.id}-default`, asset.id, clone, false);
    });
  }

  harvestRocks() {
    const model = this.world.rocks?.rocksModel;
    if (!model) return;

    const clusters = this.splitModelIntoClusters(model.clone(true), 'rock');
    this.scene.remove(model);
    clusters.forEach((wrapper, index) => {
      const assetId = index === 0 ? 'rock' : this.rockAssets[index - 1]?.id || 'rock';
      this.registerWrapperItem(`rock-${index}`, assetId, wrapper, false);
    });
  }

  harvestLake() {
    const ripples = this.world.ground?.ripples;
    if (!ripples) return;

    this.scene.remove(ripples);
    this.registerWrapperItem('lake', 'lake', ripples, true);
  }

  harvestGround() {
    const groundMesh = this.world.ground?.groundMesh;
    if (!groundMesh) return;

    this.world.ground.group.remove(groundMesh);
    this.registerWrapperItem('ground', 'ground', groundMesh, true);
  }

  harvestPool() {
    const poolGroup = this.world.pool?.group;
    if (!poolGroup) return;

    this.scene.remove(poolGroup);
    this.registerWrapperItem('pool', 'pool', poolGroup, true);
  }

  registerWrapperItem(id, assetId, obj, singleton) {
    const asset = this.getAssetById(assetId);
    if (!asset) return;

    obj.name = id;
    obj.userData.environmentDecor = true;
    obj.userData.environmentDecorId = id;
    obj.userData.environmentDecorAsset = assetId;

    this.group.add(obj);

    this.items.push({
      id,
      asset,
      entry: {
        id,
        asset: assetId,
        position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
        rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z },
        scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z },
      },
      obj,
      singleton: !!singleton,
      originalPosition: obj.position.clone(),
      originalRotationY: obj.rotation.y,
      originalScale: obj.scale.clone(),
    });
  }

  // --------------------------------------------------------------------------
  // Model splitting
  // --------------------------------------------------------------------------

  splitModelIntoClusters(model, assetType) {
    const children = model.children.slice();
    model.clear();
    this.scene.remove(model);

    const objectGroups = [];
    const meshes = [];

    children.forEach((child) => {
      child.updateWorldMatrix(true, false);
      if (child.isGroup || (child.isObject3D && child.children.length > 0)) {
        objectGroups.push(child);
      } else if (child.isMesh) {
        meshes.push(child);
      }
    });

    const wrappers = [];

    objectGroups.forEach((group) => {
      const wrapper = this.wrapObjectAtWorldOrigin(group);
      wrappers.push(wrapper);
    });

    if (meshes.length > 0) {
      const clusters = this.clusterMeshesByProximity(meshes, assetType);
      clusters.forEach((cluster) => {
        const wrapper = this.wrapMeshCluster(cluster);
        wrappers.push(wrapper);
      });
    }

    return wrappers;
  }

  wrapObjectAtWorldOrigin(obj) {
    obj.updateWorldMatrix(true, false);
    const worldPos = new THREE.Vector3();
    const worldQuat = new THREE.Quaternion();
    const worldScale = new THREE.Vector3();
    obj.matrixWorld.decompose(worldPos, worldQuat, worldScale);

    const wrapper = new THREE.Group();
    wrapper.position.copy(worldPos);
    wrapper.rotation.setFromQuaternion(worldQuat);
    wrapper.scale.copy(worldScale);

    const children = obj.children.slice();
    children.forEach((child) => {
      obj.remove(child);
      wrapper.add(child);
    });

    return wrapper;
  }

  clusterMeshesByProximity(meshes, assetType) {
    const useXZ = assetType === 'tree';
    const threshold = useXZ ? 1.2 : 1.0;

    const distanceTo = (a, b) => {
      const dx = a.x - b.x;
      const dz = a.z - b.z;
      return useXZ ? Math.sqrt(dx * dx + dz * dz) : a.distanceTo(b);
    };

    const entries = meshes.map((mesh) => {
      const box = new THREE.Box3().setFromObject(mesh);
      return { mesh, center: box.getCenter(new THREE.Vector3()) };
    });

    const clusters = [];

    entries.forEach((entry) => {
      let nearest = null;
      let nearestDist = Infinity;

      clusters.forEach((cluster) => {
        const dist = distanceTo(cluster.center, entry.center);
        if (dist < threshold && dist < nearestDist) {
          nearest = cluster;
          nearestDist = dist;
        }
      });

      if (nearest) {
        nearest.meshes.push(entry.mesh);
        nearest.center.lerp(entry.center, 1 / nearest.meshes.length);
      } else {
        clusters.push({
          meshes: [entry.mesh],
          center: entry.center.clone(),
        });
      }
    });

    clusters.forEach((cluster) => {
      cluster.center.set(0, 0, 0);
      cluster.meshes.forEach((mesh) => {
        const box = new THREE.Box3().setFromObject(mesh);
        cluster.center.add(box.getCenter(new THREE.Vector3()));
      });
      cluster.center.divideScalar(cluster.meshes.length);
    });

    return clusters.map((c) => c.meshes);
  }

  wrapMeshCluster(cluster) {
    const center = new THREE.Vector3();
    cluster.forEach((mesh) => {
      const box = new THREE.Box3().setFromObject(mesh);
      center.add(box.getCenter(new THREE.Vector3()));
    });
    center.divideScalar(cluster.length);

    const wrapper = new THREE.Group();
    wrapper.position.copy(center);
    wrapper.updateMatrix();
    wrapper.updateWorldMatrix(true, false);

    cluster.forEach((mesh) => {
      mesh.updateWorldMatrix(true, false);
      const worldMatrix = mesh.matrixWorld.clone();
      const parent = mesh.parent;
      if (parent) parent.remove(mesh);
      wrapper.add(mesh);

      const localMatrix = new THREE.Matrix4()
        .copy(wrapper.matrixWorld)
        .invert()
        .multiply(worldMatrix);
      localMatrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
    });

    return wrapper;
  }

  // --------------------------------------------------------------------------
  // Object creation for newly added assets
  // --------------------------------------------------------------------------

  createTreeObject(treeIndex) {
    const template = this.treeTemplates[treeIndex];
    if (!template) return new THREE.Group();

    const clone = template.clone(true);
    clone.position.set(0, 0, 0);
    clone.rotation.set(0, 0, 0);
    clone.scale.set(1, 1, 1);
    return clone;
  }

  createRockObject(rockIndex = 0) {
    const template = this.rockTemplates[rockIndex] || this.rockTemplates[0];
    if (!template) return new THREE.Group();

    const clone = template.clone(true);
    clone.position.set(0, 0, 0);
    clone.rotation.set(0, 0, 0);
    clone.scale.set(1, 1, 1);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }

  createResourceObject(resourceId) {
    const source = this.resources.items[resourceId];
    if (!source?.scene) {
      console.warn('EnvironmentDecor: missing resource', resourceId);
      return new THREE.Group();
    }

    const clone = source.scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }

  createGrassPatchObject(entry, asset) {
    const options = { ...(entry?.patchOptions || {}) };
    if (asset?.id === 'flowerSprinkle') {
      const defaults = asset.defaults?.patchOptions || {};
      options.flowerSize = Math.max(
        options.flowerSize || 0,
        defaults.flowerSize || 0.36
      );
      options.flowerScale = Math.max(
        options.flowerScale || 0,
        defaults.flowerScale || 0.68
      );
    }
    if (!Number.isFinite(options.randomSeed)) {
      options.randomSeed = Math.floor(Math.random() * 1000000000);
    }
    entry.patchOptions = options;

    const patch = new GrassPatch(this.world, options);
    patch.mesh.userData.grassPatch = patch;
    return patch.mesh;
  }

  createBushPatchObject(entry) {
    const options = { ...(entry?.bushOptions || {}) };
    if (!Number.isFinite(options.randomSeed)) {
      options.randomSeed = Math.floor(Math.random() * 1000000000);
    }
    entry.bushOptions = options;

    const patch = new BushPatch(this.world, options);
    patch.mesh.userData.bushPatch = patch;
    return patch.mesh;
  }

  createPoolObject() {
    const poolGroup = this.world.pool?.group;
    if (!poolGroup) return new THREE.Group();
    this.scene.remove(poolGroup);
    poolGroup.visible = true;
    return poolGroup;
  }

  createLakeObject() {
    const ripples = this.world.ground?.ripples;
    if (!ripples) return new THREE.Group();
    this.scene.remove(ripples);
    this.setLegacyLakeVisible(true);
    return ripples;
  }

  createGroundObject() {
    const groundMesh = this.world.ground?.groundMesh;
    if (!groundMesh) return new THREE.Group();
    this.world.ground.group.remove(groundMesh);
    groundMesh.visible = true;
    return groundMesh;
  }

  // --------------------------------------------------------------------------
  // Serialization
  // --------------------------------------------------------------------------

  serializeLayout() {
    return this.items
      .filter((item) => item.obj.visible !== false)
      .map((item) => this.serializeItem(item));
  }

  serializeItem(item) {
    const obj = item.obj;
    const serialized = {
      id: item.id,
      asset: item.asset.id,
      position: {
        x: round(obj.position.x),
        y: round(obj.position.y),
        z: round(obj.position.z),
      },
      rotation: {
        x: round(obj.rotation.x),
        y: round(obj.rotation.y),
        z: round(obj.rotation.z),
      },
      scale: {
        x: round(obj.scale.x),
        y: round(obj.scale.y),
        z: round(obj.scale.z),
      },
    };

    if (item.asset.id === 'ground' && item.entry.groundTexture) {
      serialized.groundTexture = item.entry.groundTexture;
    }

    if (item.asset.defaults?.patchOptions || item.asset.id.startsWith('grassPatch')) {
      serialized.patchOptions = { ...item.entry.patchOptions };
    }

    if (item.asset.defaults?.bushOptions || item.asset.id.startsWith('bush')) {
      serialized.bushOptions = { ...item.entry.bushOptions };
    }

    return serialized;
  }

  getExportPayload() {
    return {
      version: 2,
      generatedAt: new Date().toISOString(),
      note:
        'Paste "props" into swim-app/src/config/poolSceneLayout.js as DEFAULT_POOL_SCENE_LAYOUT and "environment" into DEFAULT_ENVIRONMENT_SCENE_LAYOUT.',
      props: [],
      environment: this.serializeLayout(),
    };
  }

  selectItem(item) {
    return item;
  }

  update(delta, elapsedTime) {
    this.items.forEach((item) => {
      if (item.grassPatch) {
        item.grassPatch.update(item.obj);
      }
      if (item.bushPatch) {
        item.bushPatch.update(item.obj);
      }
    });
  }

  dispose() {
    this.items.forEach((item) => {
      if (item.grassPatch) {
        item.grassPatch.dispose();
      }
      if (item.bushPatch) {
        item.bushPatch.dispose();
      }
      if (item.singleton) {
        this.scene.attach(item.obj);
      }
    });

    this.group.clear();
    this.scene.remove(this.group);
    this.items = [];
  }
}
