import * as THREE from 'three';
import Game from '../../../Game.class';
import {
  DEFAULT_POOL_SCENE_LAYOUT,
  POOL_DECOR_ASSETS,
} from '../../../../config/poolSceneLayout';

const ASSET_BY_ID = new Map(POOL_DECOR_ASSETS.map((asset) => [asset.id, asset]));

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * PoolDecor places editable pool props around and inside the swim scene.
 *
 * Default entries use surface-aware placement so props sit on the deck/water.
 * Composer exports use exact transforms, which this class can also replay.
 */
export default class PoolDecor {
  constructor(pool) {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.resources = this.game.resources;
    this.pool = pool;

    this.PATIO_Y = pool ? pool.PATIO_Y : 1.2;
    this.WATER_Y = pool ? pool.WATER_Y : 1.0;
    this.halfX = (pool ? pool.INNER_X : 12) / 2;
    this.halfZ = (pool ? pool.INNER_Z : 7) / 2;
    this.patioW = pool ? pool.PATIO_W : 3.6;

    this.items = [];
    this.floaters = [];
    this.pauseFloating = false;
    this.group = new THREE.Group();
    this.group.name = 'Editable pool decor';
    this.scene.add(this.group);

    this.applyLayout(DEFAULT_POOL_SCENE_LAYOUT);
  }

  getAssetLibrary() {
    return POOL_DECOR_ASSETS;
  }

  createEntry(assetId, overrides = {}) {
    const asset = ASSET_BY_ID.get(assetId) || POOL_DECOR_ASSETS[0];
    const count = this.items.filter((item) => item.entry.asset === asset.id).length + 1;
    return {
      id: `${asset.id}-${Date.now().toString(36)}-${count}`,
      asset: asset.id,
      x: 0,
      z: 0,
      scale: asset.defaultScale || 1,
      rotY: 0,
      surface: asset.surface || 'deck',
      floating: !!asset.floating,
      sink: asset.surface === 'water' ? 0.18 : 0,
      ...overrides,
    };
  }

  applyLayout(layout = DEFAULT_POOL_SCENE_LAYOUT) {
    this.clear();
    const safeLayout = Array.isArray(layout) ? layout : DEFAULT_POOL_SCENE_LAYOUT;
    safeLayout.forEach((entry) => this.addEntry(entry));
  }

  resetDefaultLayout() {
    this.applyLayout(DEFAULT_POOL_SCENE_LAYOUT);
  }

  addEntry(entry) {
    const asset = ASSET_BY_ID.get(entry.asset);
    if (!asset) {
      console.warn('PoolDecor: unknown decor asset', entry.asset);
      return null;
    }

    const normalizedEntry = {
      id: entry.id || `${asset.id}-${Date.now().toString(36)}`,
      asset: asset.id,
      surface: entry.surface || asset.surface || 'deck',
      floating: !!(entry.floating ?? asset.floating),
      ...entry,
    };

    const obj = normalizedEntry.position
      ? this.addExactTransform(asset.resourceId, normalizedEntry)
      : this.place(asset.resourceId, normalizedEntry);

    if (!obj) return null;
    obj.name = normalizedEntry.id;
    obj.userData.poolDecor = true;
    obj.userData.poolDecorId = normalizedEntry.id;
    obj.userData.poolDecorAsset = asset.id;

    const item = { id: normalizedEntry.id, asset, entry: normalizedEntry, obj };
    this.items.push(item);

    if (normalizedEntry.floating) {
      this.floaters.push({
        obj,
        id: normalizedEntry.id,
        baseY: obj.position.y,
        baseRotZ: obj.rotation.z,
        phase: normalizedEntry.phase || 0,
        amp: normalizedEntry.amp ?? 0.05,
      });
    }

    return item;
  }

  duplicateItem(id) {
    const item = this.getItemById(id);
    if (!item) return null;
    const entry = this.serializeItem(item);
    entry.id = `${entry.asset}-${Date.now().toString(36)}`;
    entry.position.x += 0.6;
    entry.position.z += 0.6;
    return this.addEntry(entry);
  }

  removeItem(id) {
    const item = this.getItemById(id);
    if (!item) return false;
    this.group.remove(item.obj);
    this.items = this.items.filter((candidate) => candidate !== item);
    this.floaters = this.floaters.filter((floater) => floater.id !== id);
    return true;
  }

  getItemById(id) {
    return this.items.find((item) => item.id === id) || null;
  }

  getItemFromObject(object) {
    let current = object;
    while (current) {
      if (current.userData?.poolDecorId) return this.getItemById(current.userData.poolDecorId);
      current = current.parent;
    }
    return null;
  }

  clear() {
    this.group.children.slice().forEach((child) => {
      this.group.remove(child);
    });
    this.items = [];
    this.floaters = [];
  }

  addExactTransform(resourceId, entry) {
    const obj = this.cloneResource(resourceId);
    if (!obj) return null;

    const position = entry.position || {};
    const rotation = entry.rotation || {};
    const scale = entry.scale ?? 1;

    obj.position.set(position.x || 0, position.y || 0, position.z || 0);
    obj.rotation.set(rotation.x || 0, rotation.y || 0, rotation.z || 0);

    if (typeof scale === 'number') {
      obj.scale.setScalar(scale);
    } else {
      obj.scale.set(scale.x ?? 1, scale.y ?? 1, scale.z ?? 1);
    }

    this.group.add(obj);
    return obj;
  }

  /** Clone, scale, orient, and seat a prop so its base rests on a surface. */
  place(resourceId, entry) {
    const obj = this.cloneResource(resourceId);
    if (!obj) return null;

    const scale = entry.scale ?? 1;
    obj.scale.setScalar(scale);
    obj.rotation.y = entry.rotY || 0;
    obj.rotation.x = entry.tiltX || 0;
    obj.rotation.z = entry.rotZ || 0;
    obj.updateWorldMatrix(true, true);

    const baseY = this.resolveBaseY(entry);
    const sink = entry.sink || 0;
    const box = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());
    obj.position.x += (entry.x || 0) - center.x;
    obj.position.z += (entry.z || 0) - center.z;
    obj.position.y += baseY - sink - box.min.y;

    this.group.add(obj);
    return obj;
  }

  cloneResource(resourceId) {
    const src = this.resources.items[resourceId];
    if (!src || !src.scene) {
      console.warn('PoolDecor: missing resource', resourceId);
      return null;
    }

    const obj = src.scene.clone(true);
    obj.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return obj;
  }

  resolveBaseY(entry) {
    if (Number.isFinite(entry.baseY)) return entry.baseY;
    const offset = entry.yOffset || 0;
    return (entry.surface === 'water' ? this.WATER_Y : this.PATIO_Y) + offset;
  }

  serializeLayout() {
    return this.items
      .filter((item) => item.obj.visible !== false)
      .map((item) => this.serializeItem(item));
  }

  serializeItem(item) {
    return {
      id: item.id,
      asset: item.asset.id,
      position: {
        x: Number(item.obj.position.x.toFixed(3)),
        y: Number(item.obj.position.y.toFixed(3)),
        z: Number(item.obj.position.z.toFixed(3)),
      },
      rotation: {
        x: Number(item.obj.rotation.x.toFixed(3)),
        y: Number(item.obj.rotation.y.toFixed(3)),
        z: Number(item.obj.rotation.z.toFixed(3)),
      },
      scale: {
        x: Number(item.obj.scale.x.toFixed(3)),
        y: Number(item.obj.scale.y.toFixed(3)),
        z: Number(item.obj.scale.z.toFixed(3)),
      },
      surface: item.entry.surface || item.asset.surface || 'deck',
      floating: !!item.entry.floating,
      phase: item.entry.phase || 0,
      amp: item.entry.amp ?? (item.entry.floating ? 0.05 : 0),
    };
  }

  getExportPayload() {
    return {
      version: 1,
      generatedAt: new Date().toISOString(),
      note: 'Paste the layout array into swim-app/src/config/poolSceneLayout.js as DEFAULT_POOL_SCENE_LAYOUT.',
      layout: this.serializeLayout(),
    };
  }

  getDefaultLayoutCopy() {
    return clonePlain(DEFAULT_POOL_SCENE_LAYOUT);
  }

  update(delta, elapsedTime) {
    if (this.pauseFloating) return;
    for (const floater of this.floaters) {
      floater.obj.position.y = floater.baseY + Math.sin(elapsedTime * 1.1 + floater.phase) * floater.amp;
      floater.obj.rotation.z = floater.baseRotZ + Math.sin(elapsedTime * 0.8 + floater.phase) * 0.04;
    }
  }

  dispose() {
    this.clear();
    this.scene.remove(this.group);
  }
}
