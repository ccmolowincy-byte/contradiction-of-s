import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GROUND_TEXTURES } from '../../config/groundTextures';

const DRAFT_KEY = 'cosSwimSceneComposerDraftV2';

function round(value, digits = 3) {
  return Number(value.toFixed(digits));
}

function deg(rad) {
  return round(THREE.MathUtils.radToDeg(rad), 1);
}

function rad(degrees) {
  return THREE.MathUtils.degToRad(Number(degrees) || 0);
}

export default class SceneComposer {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;
    this.camera = game.camera.cameraInstance;
    this.controls = game.camera.controls;
    this.renderer = game.renderer.rendererInstance;
    this.canvas = game.canvas;
    this.poolDecor = game.world.poolDecor;
    this.poolDecor.pauseFloating = true;
    this.environmentDecor = game.world.environmentDecor;

    this.selected = null;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.savingTimer = null;
    this.isTransformDragging = false;
    this.seedMode = false;
    this.uniformScaleLocked = true;
    this.transformScaleStart = null;
    this.transformUniformScaleStart = 1;

    this.onCanvasPointerDown = this.onCanvasPointerDown.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);

    this.injectStyles();
    this.buildUI();
    this.defaultFoliage = this.getFoliagePayload();
    this.setupTransformControls();
    this.loadDraftIfPresent();
    this.refreshList();
    this.updateReadout();

    this.canvas.addEventListener('pointerdown', this.onCanvasPointerDown);
    window.addEventListener('keydown', this.onKeyDown);

    if (this.controls) {
      this.controls.enablePan = true;
      this.controls.maxPolarAngle = Math.PI / 2.05;
    }

    document.body.classList.add('scene-composer-active');
  }

  getAllItems() {
    return [...this.poolDecor.items, ...this.environmentDecor.items];
  }

  getItemSystem(item) {
    if (!item) return null;
    return this.poolDecor.items.includes(item) ? this.poolDecor : this.environmentDecor;
  }

  getAnyItemById(id) {
    return (
      this.poolDecor.getItemById(id) || this.environmentDecor.getItemById(id) || null
    );
  }

  setupTransformControls() {
    this.transform = new TransformControls(this.camera, this.renderer.domElement);
    this.transform.setMode('translate');
    this.transform.setSize(0.82);
    this.transformHelper = this.transform.getHelper();
    this.scene.add(this.transformHelper);

    this.transform.addEventListener('dragging-changed', (event) => {
      this.isTransformDragging = event.value;
      if (this.controls) this.controls.enabled = !event.value;
      if (!event.value) this.afterTransformChange();
    });

    this.transform.addEventListener('mouseDown', () => {
      this.captureTransformScaleStart();
    });

    this.transform.addEventListener('mouseUp', () => {
      this.transformScaleStart = null;
      this.transformUniformScaleStart = 1;
    });

    this.transform.addEventListener('objectChange', () => {
      this.enforceUniformScaleFromTransform();
      this.afterTransformChange();
    });
  }

  buildUI() {
    this.panel = document.createElement('aside');
    this.panel.id = 'scene-composer';
    this.panel.innerHTML = `
      <div class="sc-head">
        <div>
          <div class="sc-kicker">Local tool</div>
          <h1>Scene Composer</h1>
        </div>
        <button type="button" class="sc-icon" data-action="collapse" title="Collapse">-</button>
      </div>

      <div class="sc-section sc-add">
        <div class="sc-label">Add asset</div>
        <div id="sc-asset-summary" class="sc-asset-summary">None selected</div>
        <div id="sc-asset-palette" class="sc-asset-palette"></div>
        <select id="sc-asset" class="sc-hidden-select" aria-hidden="true" tabindex="-1"></select>
        <div class="sc-inline sc-tight">
          <button type="button" data-action="add">Add</button>
          <button type="button" data-action="seed">Seed</button>
        </div>
      </div>

      <div class="sc-section">
        <div class="sc-label">Transform</div>
        <div class="sc-segment">
          <button type="button" class="active" data-mode="translate">Move</button>
          <button type="button" data-mode="rotate">Rotate</button>
          <button type="button" data-mode="scale">Scale</button>
        </div>
      </div>

      <div class="sc-section">
        <div class="sc-label">Foliage colours</div>
        <div class="sc-color-grid">
          <label>Grass dark <input type="color" data-foliage="grass.dark"></label>
          <label>Grass light <input type="color" data-foliage="grass.light"></label>
          <label>Grass shade <input type="color" data-foliage="grass.shadow"></label>
          <label>Bush dark <input type="color" data-foliage="bush.shadow"></label>
          <label>Bush mid <input type="color" data-foliage="bush.mid"></label>
          <label>Bush light <input type="color" data-foliage="bush.highlight"></label>
        </div>
      </div>

      <div class="sc-section">
        <div class="sc-label">Selected</div>
        <div id="sc-selected" class="sc-selected">None</div>
        <div class="sc-inline sc-tight">
          <button type="button" data-action="duplicate">Duplicate</button>
          <button type="button" class="danger" data-action="remove">Remove</button>
        </div>
      </div>

      <div class="sc-section sc-transform-fields">
        <div class="sc-label">Numbers</div>
        <div class="sc-scale-uniform">
          <label>Uniform <input id="sc-uniform-scale" type="number" step="0.05" min="0.01" data-uniform-scale></label>
          <label class="sc-scale-lock"><input id="sc-uniform-scale-lock" type="checkbox" data-uniform-scale-lock checked> Link axes</label>
        </div>
        <div class="sc-grid" data-fieldset="position">
          <label>X <input type="number" step="0.1" data-vector="position" data-axis="x"></label>
          <label>Y <input type="number" step="0.1" data-vector="position" data-axis="y"></label>
          <label>Z <input type="number" step="0.1" data-vector="position" data-axis="z"></label>
        </div>
        <div class="sc-grid" data-fieldset="rotation">
          <label>RX <input type="number" step="1" data-vector="rotation" data-axis="x"></label>
          <label>RY <input type="number" step="1" data-vector="rotation" data-axis="y"></label>
          <label>RZ <input type="number" step="1" data-vector="rotation" data-axis="z"></label>
        </div>
        <div class="sc-grid" data-fieldset="scale">
          <label>SX <input type="number" step="0.05" data-vector="scale" data-axis="x"></label>
          <label>SY <input type="number" step="0.05" data-vector="scale" data-axis="y"></label>
          <label>SZ <input type="number" step="0.05" data-vector="scale" data-axis="z"></label>
        </div>
      </div>

      <div class="sc-section" id="sc-ground-texture-section" hidden>
        <div class="sc-label">Ground texture</div>
        <div class="sc-inline">
          <select id="sc-ground-texture"></select>
        </div>
      </div>

      <div class="sc-section">
        <div class="sc-label">Objects</div>
        <div id="sc-list" class="sc-list"></div>
      </div>

      <div class="sc-section">
        <div class="sc-label">Layout JSON</div>
        <textarea id="sc-json" spellcheck="false"></textarea>
        <div class="sc-inline">
          <button type="button" data-action="copy">Copy</button>
          <button type="button" data-action="download">Download</button>
          <button type="button" data-action="apply">Apply JSON</button>
        </div>
        <div class="sc-inline sc-tight">
          <button type="button" data-action="save">Save draft</button>
          <button type="button" data-action="reset">Reset default</button>
          <button type="button" data-action="clear">Clear draft</button>
          <button type="button" class="danger" data-action="newScene">New scene</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.panel);

    this.assetSelect = this.panel.querySelector('#sc-asset');
    this.assetPalette = this.panel.querySelector('#sc-asset-palette');
    this.assetSummary = this.panel.querySelector('#sc-asset-summary');
    this.selectedEl = this.panel.querySelector('#sc-selected');
    this.listEl = this.panel.querySelector('#sc-list');
    this.jsonEl = this.panel.querySelector('#sc-json');
    this.groundTextureSection = this.panel.querySelector('#sc-ground-texture-section');
    this.groundTextureSelect = this.panel.querySelector('#sc-ground-texture');
    this.seedButton = this.panel.querySelector('[data-action="seed"]');
    this.foliageInputs = Array.from(this.panel.querySelectorAll('[data-foliage]'));
    this.uniformScaleInput = this.panel.querySelector('[data-uniform-scale]');
    this.uniformScaleLockInput = this.panel.querySelector('[data-uniform-scale-lock]');

    this.populateAssetPicker();

    GROUND_TEXTURES.forEach((texture) => {
      const option = document.createElement('option');
      option.value = texture.id;
      option.textContent = texture.label;
      this.groundTextureSelect.appendChild(option);
    });

    this.groundTextureSelect.addEventListener('change', () => {
      this.applySelectedGroundTexture();
    });
    this.assetSelect.addEventListener('change', () => {
      this.setSelectedAssetRef(this.assetSelect.value);
    });

    this.panel.addEventListener('click', (event) => {
      const assetButton = event.target.closest('[data-asset-ref]');
      if (assetButton) {
        this.setSelectedAssetRef(assetButton.dataset.assetRef);
        return;
      }

      const modeButton = event.target.closest('[data-mode]');
      if (modeButton) {
        this.setMode(modeButton.dataset.mode);
        return;
      }

      const itemButton = event.target.closest('[data-item-id]');
      if (itemButton) {
        this.selectItem(this.getAnyItemById(itemButton.dataset.itemId));
        return;
      }

      const actionButton = event.target.closest('[data-action]');
      if (!actionButton) return;
      this.handleAction(actionButton.dataset.action);
    });

    this.panel.addEventListener('input', (event) => {
      if (event.target.matches('[data-uniform-scale-lock]')) {
        this.setUniformScaleLock(event.target.checked);
        return;
      }
      if (event.target.matches('[data-uniform-scale]')) {
        this.applyUniformScaleInput(event.target);
        return;
      }
      if (event.target.matches('[data-vector]')) this.applyNumericInput(event.target);
      if (event.target.matches('[data-foliage]')) this.applyFoliageInput(event.target);
    });

    this.syncFoliageInputs();
  }

  createAssetRef(system, asset) {
    return {
      system,
      asset,
      value: `${system}:${asset.id}`,
    };
  }

  populateAssetPicker() {
    const poolRefs = this.poolDecor
      .getAssetLibrary()
      .map((asset) => this.createAssetRef('pool', asset));
    const envRefs = this.environmentDecor
      .getAssetLibrary()
      .map((asset) => this.createAssetRef('env', asset));

    this.populateHiddenAssetSelect(poolRefs, envRefs);
    this.populateAssetPalette(poolRefs, envRefs);

    const firstRef = poolRefs[0]?.value || envRefs[0]?.value || '';
    this.setSelectedAssetRef(firstRef);
  }

  populateHiddenAssetSelect(poolRefs, envRefs) {
    this.assetSelect.innerHTML = '';

    [
      ['Pool props', poolRefs],
      ['Environment', envRefs],
    ].forEach(([label, refs]) => {
      if (!refs.length) return;

      const group = document.createElement('optgroup');
      group.label = label;
      refs.forEach((ref) => {
        const option = document.createElement('option');
        option.value = ref.value;
        option.textContent = ref.asset.label;
        group.appendChild(option);
      });
      this.assetSelect.appendChild(group);
    });
  }

  populateAssetPalette(poolRefs, envRefs) {
    this.assetPalette.innerHTML = '';
    const usedRefs = new Set();

    const takeEnvRefs = (predicate) => {
      const refs = envRefs.filter((ref) => predicate(ref.asset));
      refs.forEach((ref) => usedRefs.add(ref.value));
      return refs;
    };

    const groups = [
      { label: 'Pool props', refs: poolRefs },
      {
        label: 'Grass',
        refs: takeEnvRefs(
          (asset) => asset.id === 'proceduralGrass' || asset.id === 'flowerSprinkle'
        ),
      },
      {
        label: 'Bushes',
        refs: takeEnvRefs(
          (asset) => !!asset.defaults?.bushOptions || asset.id.startsWith('bush')
        ),
      },
      {
        label: 'Rocks',
        refs: takeEnvRefs((asset) => asset.rockIndex !== undefined),
      },
      {
        label: 'Tree trunks',
        refs: takeEnvRefs((asset) => asset.treeIndex !== undefined),
      },
      {
        label: 'Scene',
        refs: takeEnvRefs((asset) =>
          ['starLake', 'lake', 'pool', 'ground'].includes(asset.id)
        ),
      },
      {
        label: 'Other',
        refs: envRefs.filter((ref) => !usedRefs.has(ref.value)),
      },
    ].filter((group) => group.refs.length);

    groups.forEach((group) => {
      const section = document.createElement('section');
      section.className = 'sc-asset-group';

      const title = document.createElement('div');
      title.className = 'sc-asset-group-title';
      title.textContent = group.label;
      section.appendChild(title);

      const grid = document.createElement('div');
      grid.className = 'sc-asset-grid';
      if (group.label === 'Tree trunks') grid.classList.add('sc-asset-grid-compact');

      group.refs.forEach((ref) => {
        grid.appendChild(this.createAssetButton(ref));
      });

      section.appendChild(grid);
      this.assetPalette.appendChild(section);
    });
  }

  createAssetButton(ref) {
    const button = document.createElement('button');
    const meta = this.getAssetButtonMeta(ref);
    button.type = 'button';
    button.className = 'sc-asset-tile';
    button.dataset.assetRef = ref.value;
    button.dataset.seedable = String(this.isAssetSeedable(ref));
    button.title = ref.asset.label;
    button.setAttribute('aria-pressed', 'false');

    const code = document.createElement('span');
    code.className = 'sc-asset-code';
    code.textContent = meta.code;

    const label = document.createElement('span');
    label.className = 'sc-asset-name';
    label.textContent = meta.label;

    button.append(code, label);
    return button;
  }

  getAssetButtonMeta(ref) {
    if (ref.system === 'pool') {
      return {
        chair: { code: 'CH', label: 'Chair' },
        parasol: { code: 'PA', label: 'Parasol' },
        palm: { code: 'PL', label: 'Palm' },
        cocktail: { code: 'CO', label: 'Cocktail' },
        flamingo: { code: 'FL', label: 'Flamingo' },
      }[ref.asset.id] || { code: 'PO', label: ref.asset.label };
    }

    if (ref.asset.treeIndex !== undefined) {
      return { code: `T${ref.asset.treeIndex + 1}`, label: `Tree ${ref.asset.treeIndex + 1}` };
    }

    if (ref.asset.rockIndex !== undefined) {
      return { code: `R${ref.asset.rockIndex + 1}`, label: `Rock ${ref.asset.rockIndex + 1}` };
    }

    return {
      proceduralGrass: { code: 'PG', label: 'Procedural' },
      flowerSprinkle: { code: 'FW', label: 'Flowers' },
      grassPatch: { code: 'GR', label: 'Patch' },
      grassPatchSmall: { code: 'GS', label: 'Small' },
      grassPatchLarge: { code: 'GL', label: 'Large' },
      grassPatchSquare: { code: 'SQ', label: 'Square' },
      grassPatchRing: { code: 'RG', label: 'Ring' },
      grassPatchFlowers: { code: 'FW', label: 'Flowers' },
      bush: { code: 'BU', label: 'Bush' },
      bushSmall: { code: 'BS', label: 'Small' },
      bushLarge: { code: 'BL', label: 'Large' },
      bushCanopy: { code: 'BC', label: 'Canopy' },
      rock: { code: 'RK', label: 'Rock' },
      starLake: { code: 'SL', label: 'Star lake' },
      lake: { code: 'WA', label: 'Ripples' },
      pool: { code: 'PL', label: 'Pool' },
      ground: { code: 'GD', label: 'Ground' },
    }[ref.asset.id] || { code: ref.asset.label.slice(0, 2).toUpperCase(), label: ref.asset.label };
  }

  getAssetDefinitionForRef(value) {
    const [system, assetId] = (value || '').split(':');
    if (system === 'pool') {
      return this.poolDecor.getAssetLibrary().find((asset) => asset.id === assetId) || null;
    }
    if (system === 'env') return this.environmentDecor.getAssetById(assetId);
    return null;
  }

  isAssetSeedable(ref) {
    if (ref.system !== 'env' || ref.asset.singleton) return false;
    return (
      !!ref.asset.seedable ||
      !!ref.asset.defaults?.patchOptions ||
      !!ref.asset.defaults?.bushOptions ||
      ref.asset.id.startsWith('bush')
    );
  }

  setSelectedAssetRef(value) {
    if (!value || !this.getAssetDefinitionForRef(value)) return;

    this.selectedAssetRef = value;
    if (this.assetSelect.value !== value) this.assetSelect.value = value;

    this.panel.querySelectorAll('[data-asset-ref]').forEach((button) => {
      const isActive = button.dataset.assetRef === value;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    const asset = this.getAssetDefinitionForRef(value);
    if (this.assetSummary) this.assetSummary.textContent = asset?.label || 'None selected';

    this.updateSeedButton();
  }

  handleAction(action) {
    if (action === 'collapse') {
      this.panel.classList.toggle('collapsed');
      return;
    }
    if (action === 'add') this.addSelectedAsset();
    if (action === 'seed') this.setSeedMode(!this.seedMode);
    if (action === 'duplicate') this.duplicateSelected();
    if (action === 'remove') this.removeSelected();
    if (action === 'copy') this.copyJson();
    if (action === 'download') this.downloadJson();
    if (action === 'apply') this.applyJson();
    if (action === 'save') this.saveDraft(true);
    if (action === 'reset') this.resetDefault();
    if (action === 'clear') this.clearDraft();
    if (action === 'newScene') this.newScene();
  }

  setMode(mode) {
    this.transform.setMode(mode);
    this.panel.querySelectorAll('[data-mode]').forEach((button) => {
      button.classList.toggle('active', button.dataset.mode === mode);
    });
  }

  getSelectedAssetRef() {
    const value = this.selectedAssetRef || this.assetSelect.value;
    const [system, assetId] = value.split(':');
    return { system, assetId };
  }

  getSelectedAssetDefinition() {
    const { system, assetId } = this.getSelectedAssetRef();
    if (system !== 'env') return null;
    return this.environmentDecor.getAssetById(assetId);
  }

  isSelectedAssetSeedable() {
    const asset = this.getSelectedAssetDefinition();
    if (!asset || asset.singleton) return false;
    return (
      !!asset.seedable ||
      !!asset.defaults?.patchOptions ||
      !!asset.defaults?.bushOptions ||
      asset.id.startsWith('bush')
    );
  }

  setSeedMode(enabled) {
    const nextValue = !!enabled && this.isSelectedAssetSeedable();
    this.seedMode = nextValue;
    this.seedButton?.classList.toggle('active', nextValue);
    document.body.classList.toggle('scene-composer-seed', nextValue);

    if (enabled && !nextValue) {
      this.flash('Select a seedable asset', true);
    }
  }

  updateSeedButton() {
    if (!this.seedButton) return;
    const canSeed = this.isSelectedAssetSeedable();
    this.seedButton.disabled = !canSeed;
    if (!canSeed && this.seedMode) this.setSeedMode(false);
  }

  addSelectedAsset() {
    const { system, assetId } = this.getSelectedAssetRef();

    let item = null;
    if (system === 'env') {
      const entry = this.environmentDecor.createEntry(assetId);
      item = this.environmentDecor.addEntry(entry);
    } else {
      const entry = this.poolDecor.createEntry(assetId);
      item = this.poolDecor.addEntry(entry);
    }

    this.selectItem(item);
    this.refreshList();
    this.saveDraftSoon();
  }

  seedSelectedAssetAtPointer() {
    const { system, assetId } = this.getSelectedAssetRef();
    if (system !== 'env' || !this.isSelectedAssetSeedable()) {
      this.setSeedMode(false);
      this.flash('Select a seedable asset', true);
      return false;
    }

    const point = this.getGroundHitPoint();
    if (!point) {
      this.flash('No ground hit', true);
      return false;
    }

    const asset = this.environmentDecor.getAssetById(assetId);
    const yOffset = asset.defaults?.patchOptions?.yOffset
      ?? asset.defaults?.bushOptions?.yOffset
      ?? asset.placementYOffset
      ?? (asset.defaults?.bushOptions ? 0 : 0.05);
    const entry = this.environmentDecor.createEntry(assetId, {
      position: {
        x: point.x,
        y: point.y + yOffset,
        z: point.z,
      },
      rotation: {
        x: 0,
        y: Math.random() * Math.PI * 2,
        z: 0,
      },
      scale: { x: 1, y: 1, z: 1 },
    });

    const item = this.environmentDecor.addEntry(entry);
    this.selectItem(item);
    this.refreshList();
    this.saveDraftSoon();
    return true;
  }

  getGroundHitPoint() {
    const groundItem = this.environmentDecor.items.find(
      (item) => item.asset.id === 'ground'
    );

    if (groundItem?.obj && groundItem.obj.visible !== false) {
      const hits = this.raycaster.intersectObject(groundItem.obj, true);
      if (hits.length) return hits[0].point.clone();
    }

    const fallback = new THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(this.groundPlane, fallback)) {
      return fallback;
    }

    return null;
  }

  duplicateSelected() {
    if (!this.selected || this.selected.singleton) return;
    const system = this.getItemSystem(this.selected);
    const item = system.duplicateItem(this.selected.id);
    this.selectItem(item);
    this.refreshList();
    this.saveDraftSoon();
  }

  removeSelected() {
    if (!this.selected || this.selected.singleton) return;
    const allItems = this.getAllItems();
    const currentIndex = allItems.findIndex((item) => item.id === this.selected.id);
    const nextIndex = Math.max(0, currentIndex - 1);
    const system = this.getItemSystem(this.selected);

    this.transform.detach();
    system.removeItem(this.selected.id);

    const remaining = this.getAllItems();
    this.selected = remaining[nextIndex] || remaining[0] || null;
    if (this.selected) this.transform.attach(this.selected.obj);
    this.refreshList();
    this.updateReadout();
    this.saveDraftSoon();
  }

  selectItem(item) {
    this.selected = item || null;
    if (this.selected) this.transform.attach(this.selected.obj);
    else this.transform.detach();
    this.refreshList();
    this.updateReadout();
  }

  onCanvasPointerDown(event) {
    if (this.isTransformDragging || event.button !== 0) return;
    if (event.target !== this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);

    if (this.seedMode) {
      this.seedSelectedAssetAtPointer();
      return;
    }

    const roots = this.getAllItems().map((item) => item.obj);
    const hits = this.raycaster.intersectObjects(roots, true);
    if (!hits.length) {
      this.selectItem(null);
      return;
    }

    const hitObject = hits[0].object;
    const item =
      this.poolDecor.getItemFromObject(hitObject) ||
      this.environmentDecor.getItemFromObject(hitObject);
    if (item) this.selectItem(item);
  }

  onKeyDown(event) {
    if (event.target && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
    if (event.key === 'w' || event.key === 'W') this.setMode('translate');
    if (event.key === 'e' || event.key === 'E') this.setMode('rotate');
    if (event.key === 'r' || event.key === 'R') this.setMode('scale');
    if (event.key === 'Escape' && this.seedMode) this.setSeedMode(false);
    if (event.key === 'Delete' || event.key === 'Backspace') this.removeSelected();
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd') {
      event.preventDefault();
      this.duplicateSelected();
    }
  }

  applyNumericInput(input) {
    if (!this.selected) return;
    const vector = input.dataset.vector;
    const axis = input.dataset.axis;
    const value = Number(input.value);
    if (!Number.isFinite(value)) return;

    if (vector === 'rotation') {
      this.selected.obj.rotation[axis] = rad(value);
    } else if (vector === 'scale' && this.uniformScaleLocked) {
      this.setSelectedUniformScale(value);
    } else {
      this.selected.obj[vector][axis] = value;
    }

    this.afterTransformChange();
  }

  normalizeUniformScaleValue(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return null;
    return Math.max(0.01, numeric);
  }

  getUniformScaleValue(scale) {
    if (!scale) return 1;
    return (scale.x + scale.y + scale.z) / 3;
  }

  setSelectedUniformScale(value) {
    if (!this.selected) return false;
    const scale = this.normalizeUniformScaleValue(value);
    if (scale === null) return false;
    this.selected.obj.scale.setScalar(scale);
    return true;
  }

  applyUniformScaleInput(input) {
    if (!this.selected) return;
    if (!this.setSelectedUniformScale(input.value)) return;
    this.afterTransformChange();
  }

  setUniformScaleLock(enabled) {
    this.uniformScaleLocked = !!enabled;
    if (this.uniformScaleLockInput) {
      this.uniformScaleLockInput.checked = this.uniformScaleLocked;
    }
    if (this.uniformScaleLocked) {
      this.enforceUniformScaleFromTransform();
    }
    this.updateReadout();
  }

  captureTransformScaleStart() {
    if (!this.selected || this.transform.mode !== 'scale') return;
    this.transformScaleStart = this.selected.obj.scale.clone();
    this.transformUniformScaleStart = this.getUniformScaleValue(this.transformScaleStart);
  }

  enforceUniformScaleFromTransform() {
    if (!this.uniformScaleLocked || !this.selected || this.transform.mode !== 'scale') return;

    const obj = this.selected.obj;
    if (!this.transformScaleStart) this.captureTransformScaleStart();

    const startScale = this.transformScaleStart || obj.scale;
    const axis = this.transform.axis || 'XYZ';
    const axes = ['x', 'y', 'z'].filter((key) => axis.includes(key.toUpperCase()));
    const activeAxes = axes.length ? axes : ['x', 'y', 'z'];
    const ratios = activeAxes
      .map((key) => {
        const start = startScale[key];
        if (Math.abs(start) < 0.0001) return null;
        return obj.scale[key] / start;
      })
      .filter((value) => Number.isFinite(value));

    const ratio = ratios.length
      ? ratios.reduce((chosen, value) =>
        Math.abs(value - 1) > Math.abs(chosen - 1) ? value : chosen
      , ratios[0])
      : 1;

    const nextScale = this.normalizeUniformScaleValue(
      this.transformUniformScaleStart * ratio
    );
    if (nextScale !== null) obj.scale.setScalar(nextScale);
  }

  afterTransformChange() {
    if (!this.selected) return;

    const system = this.getItemSystem(this.selected);
    if (system === this.poolDecor) {
      const floater = this.poolDecor.floaters.find((candidate) => candidate.id === this.selected.id);
      if (floater) {
        floater.baseY = this.selected.obj.position.y;
        floater.baseRotZ = this.selected.obj.rotation.z;
      }
    }

    this.updateReadout();
    this.refreshJson();
    this.saveDraftSoon();
  }

  refreshList() {
    this.listEl.innerHTML = '';
    this.getAllItems().forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.itemId = item.id;
      button.className = item === this.selected ? 'active' : '';
      button.textContent = `${index + 1}. ${item.asset.label} - ${item.id}`;
      this.listEl.appendChild(button);
    });
    this.refreshJson();
  }

  updateReadout() {
    const item = this.selected;
    this.selectedEl.textContent = item ? `${item.asset.label} - ${item.id}` : 'None';

    const duplicateButton = this.panel.querySelector('[data-action="duplicate"]');
    const removeButton = this.panel.querySelector('[data-action="remove"]');
    if (duplicateButton) duplicateButton.disabled = !!item?.singleton;
    if (removeButton) removeButton.disabled = !!item?.singleton;

    this.panel.querySelectorAll('[data-vector]').forEach((input) => {
      input.disabled = !item;
      if (!item) {
        input.value = '';
        return;
      }
      const vector = input.dataset.vector;
      const axis = input.dataset.axis;
      input.value = vector === 'rotation'
        ? deg(item.obj.rotation[axis])
        : round(item.obj[vector][axis], 3);
    });

    if (this.uniformScaleInput) {
      this.uniformScaleInput.disabled = !item;
      this.uniformScaleInput.value = item
        ? round(this.getUniformScaleValue(item.obj.scale), 3)
        : '';
    }
    if (this.uniformScaleLockInput) {
      this.uniformScaleLockInput.checked = this.uniformScaleLocked;
    }

    const isGround = item?.asset?.id === 'ground';
    if (this.groundTextureSection) {
      this.groundTextureSection.hidden = !isGround;
    }
    if (isGround && this.groundTextureSelect) {
      this.groundTextureSelect.value = item.entry.groundTexture || 'default';
    }
  }

  applySelectedGroundTexture() {
    if (!this.selected || this.selected.asset.id !== 'ground') return;

    const textureId = this.groundTextureSelect.value;
    this.selected.entry.groundTexture = textureId;
    this.environmentDecor.applyGroundTexture(this.selected.entry);
    this.refreshJson();
    this.saveDraftSoon();
  }

  colorToHex(color) {
    if (!color) return '#ffffff';
    if (typeof color === 'string') return color;
    return `#${color.getHexString()}`;
  }

  getFoliagePayload() {
    const grassUniforms = this.game.world.ground?.grassManager?.sharedUniforms;
    const bushUniforms = this.game.world.bush?.material?.uniforms;

    return {
      grass: {
        dark: this.colorToHex(grassUniforms?.uGrassColorDark?.value),
        light: this.colorToHex(grassUniforms?.uGrassColorLight?.value),
        shadow: this.colorToHex(grassUniforms?.uShadowColor?.value),
      },
      bush: {
        shadow: this.colorToHex(bushUniforms?.uShadowColor?.value),
        mid: this.colorToHex(bushUniforms?.uMidColor?.value),
        highlight: this.colorToHex(bushUniforms?.uHighlightColor?.value),
      },
    };
  }

  applyGrassColors(colors = {}) {
    const uniforms = this.game.world.ground?.grassManager?.sharedUniforms;
    if (!uniforms) return;

    if (colors.dark) uniforms.uGrassColorDark.value.set(colors.dark);
    if (colors.light) uniforms.uGrassColorLight.value.set(colors.light);
    if (colors.shadow) uniforms.uShadowColor.value.set(colors.shadow);
  }

  applyBushColors(colors = {}) {
    this.environmentDecor.applyBushColors({
      shadowColor: colors.shadow,
      midColor: colors.mid,
      highlightColor: colors.highlight,
    });
  }

  applyFoliagePayload(payload = {}) {
    if (payload.grass) this.applyGrassColors(payload.grass);
    if (payload.bush) this.applyBushColors(payload.bush);
    this.syncFoliageInputs();
  }

  applyFoliageInput(input) {
    const [group, key] = input.dataset.foliage.split('.');
    if (group === 'grass') this.applyGrassColors({ [key]: input.value });
    if (group === 'bush') this.applyBushColors({ [key]: input.value });

    this.refreshJson();
    this.saveDraftSoon();
  }

  syncFoliageInputs() {
    if (!this.foliageInputs) return;
    const payload = this.getFoliagePayload();
    this.foliageInputs.forEach((input) => {
      const [group, key] = input.dataset.foliage.split('.');
      if (payload[group]?.[key]) input.value = payload[group][key];
    });
  }

  refreshJson() {
    if (!this.jsonEl) return;
    const poolPayload = this.poolDecor.getExportPayload();
    const envPayload = this.environmentDecor.getExportPayload();
    this.jsonEl.value = JSON.stringify(
      {
        version: 2,
        exact: true,
        generatedAt: new Date().toISOString(),
        note: envPayload.note,
        props: poolPayload.layout,
        environment: envPayload.environment,
        foliage: this.getFoliagePayload(),
      },
      null,
      2
    );
  }

  saveDraftSoon() {
    clearTimeout(this.savingTimer);
    this.savingTimer = setTimeout(() => this.saveDraft(false), 250);
  }

  saveDraft(showToast) {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        version: 2,
        exact: true,
        savedAt: new Date().toISOString(),
        props: this.poolDecor.serializeLayout(),
        environment: this.environmentDecor.serializeLayout(),
        foliage: this.getFoliagePayload(),
      })
    );
    if (showToast) this.flash('Draft saved');
  }

  loadDraftIfPresent() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);

      // Backward compatibility with V1 drafts.
      if (Array.isArray(parsed?.layout)) {
        this.poolDecor.applyLayout(parsed.layout);
        return;
      }

      const props = Array.isArray(parsed?.props) ? parsed.props : [];
      const environment = Array.isArray(parsed?.environment) ? parsed.environment : [];

      this.poolDecor.applyLayout(props);
      this.environmentDecor.applyLayout(environment, { exact: true });
      if (parsed?.foliage) this.applyFoliagePayload(parsed.foliage);
    } catch (error) {
      console.warn('Scene composer draft could not be loaded', error);
    }
  }

  clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
    this.flash('Draft cleared');
  }

  resetDefault() {
    this.transform.detach();
    this.selected = null;
    this.poolDecor.resetDefaultLayout();
    this.environmentDecor.resetDefaultLayout();
    this.applyFoliagePayload(this.defaultFoliage);
    this.refreshList();
    this.updateReadout();
    this.saveDraftSoon();
  }

  newScene() {
    this.transform.detach();
    this.selected = null;
    this.poolDecor.clear();
    this.environmentDecor.newScene();
    this.refreshList();
    this.updateReadout();
    this.saveDraft(false);
    this.flash('New scene started');
  }

  applyJson() {
    try {
      const parsed = JSON.parse(this.jsonEl.value);
      this.transform.detach();
      this.selected = null;

      if (Array.isArray(parsed)) {
        // Legacy V1 layout: props only.
        this.poolDecor.applyLayout(parsed);
      } else {
        const props = Array.isArray(parsed.props)
          ? parsed.props
          : Array.isArray(parsed.layout)
            ? parsed.layout
            : [];
        const environment = Array.isArray(parsed.environment) ? parsed.environment : [];

        this.poolDecor.applyLayout(props);
        this.environmentDecor.applyLayout(environment, { exact: true });
        if (parsed.foliage) this.applyFoliagePayload(parsed.foliage);
      }

      this.refreshList();
      this.updateReadout();
      this.saveDraftSoon();
      this.flash('Layout applied');
    } catch (error) {
      this.flash(error.message || 'Invalid JSON', true);
    }
  }

  async copyJson() {
    this.refreshJson();
    try {
      await navigator.clipboard.writeText(this.jsonEl.value);
      this.flash('Copied');
    } catch (_) {
      this.jsonEl.focus();
      this.jsonEl.select();
      document.execCommand('copy');
      this.flash('Copied');
    }
  }

  downloadJson() {
    this.refreshJson();
    const blob = new Blob([this.jsonEl.value], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'swim-scene-layout.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(href);
  }

  flash(message, isError = false) {
    let el = this.panel.querySelector('.sc-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'sc-toast';
      this.panel.appendChild(el);
    }
    el.textContent = message;
    el.classList.toggle('error', isError);
    el.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => el.classList.remove('show'), 1700);
  }

  injectStyles() {
    if (document.getElementById('scene-composer-style')) return;
    const style = document.createElement('style');
    style.id = 'scene-composer-style';
    style.textContent = `
      body.scene-composer-active #control-panel,
      body.scene-composer-active #hamburger-menu,
      body.scene-composer-active #cos-back {
        display: none !important;
      }
      body.scene-composer-seed canvas {
        cursor: crosshair;
      }
      #scene-composer {
        position: fixed;
        top: 14px;
        right: 14px;
        bottom: 14px;
        z-index: 5000;
        width: min(390px, calc(100vw - 28px));
        overflow: auto;
        padding: 16px;
        border: 1px solid rgba(255,255,255,0.22);
        border-radius: 8px;
        background: rgba(15, 18, 20, 0.88);
        color: rgba(245,240,232,0.92);
        font-family: "Space Grotesk", system-ui, sans-serif;
        box-shadow: 0 18px 48px rgba(0,0,0,0.36);
        backdrop-filter: blur(18px) saturate(1.2);
      }
      #scene-composer.collapsed {
        bottom: auto;
        height: auto;
        overflow: hidden;
      }
      #scene-composer.collapsed .sc-section { display: none; }
      .sc-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 15px;
      }
      .sc-head h1 {
        margin: 0;
        font: italic 25px "IM Fell English", Georgia, serif;
        letter-spacing: 0;
      }
      .sc-kicker,
      .sc-label {
        margin-bottom: 7px;
        color: rgba(245,240,232,0.48);
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }
      .sc-section {
        padding: 12px 0;
        border-top: 1px solid rgba(255,255,255,0.10);
      }
      .sc-inline {
        display: flex;
        gap: 8px;
      }
      .sc-tight {
        margin-top: 8px;
      }
      .sc-hidden-select {
        display: none !important;
      }
      .sc-asset-summary {
        min-height: 24px;
        margin-bottom: 8px;
        color: rgba(245,240,232,0.78);
        font-size: 12px;
      }
      .sc-asset-palette {
        display: grid;
        gap: 10px;
        max-height: 270px;
        overflow: auto;
        padding-right: 3px;
      }
      .sc-asset-group-title {
        margin-bottom: 5px;
        color: rgba(245,240,232,0.42);
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }
      .sc-asset-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 6px;
      }
      .sc-asset-grid-compact {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
      #scene-composer .sc-asset-tile {
        display: grid;
        grid-template-columns: 30px minmax(0, 1fr);
        align-items: center;
        gap: 7px;
        min-height: 48px;
        padding: 6px !important;
        text-align: left;
      }
      #scene-composer .sc-asset-tile.active {
        background: rgba(245,240,232,0.20);
        border-color: rgba(245,240,232,0.46);
      }
      .sc-asset-code {
        display: grid;
        place-items: center;
        width: 30px;
        height: 30px;
        border: 1px solid rgba(245,240,232,0.16);
        border-radius: 4px;
        background: rgba(0,0,0,0.24);
        color: rgba(245,240,232,0.72);
        font-size: 10px;
        font-weight: 700;
      }
      .sc-asset-tile[data-seedable="true"] .sc-asset-code {
        border-color: rgba(127, 205, 148, 0.44);
        color: rgba(184, 244, 193, 0.88);
      }
      .sc-asset-name {
        min-width: 0;
        overflow-wrap: anywhere;
        color: rgba(245,240,232,0.86);
        font-size: 10.5px;
        line-height: 1.1;
      }
      .sc-asset-grid-compact .sc-asset-tile {
        grid-template-columns: 1fr;
        gap: 4px;
        justify-items: center;
        min-height: 50px;
        text-align: center;
      }
      #scene-composer button,
      #scene-composer select,
      #scene-composer input,
      #scene-composer textarea {
        border: 1px solid rgba(255,255,255,0.16);
        border-radius: 4px;
        background: rgba(255,255,255,0.08);
        color: rgba(245,240,232,0.92);
        font: 12px "Space Grotesk", system-ui, sans-serif;
      }
      #scene-composer button {
        min-height: 34px;
        padding: 0 11px;
        cursor: pointer;
      }
      #scene-composer button:hover,
      #scene-composer button.active {
        background: rgba(245,240,232,0.18);
        border-color: rgba(245,240,232,0.34);
      }
      #scene-composer button.danger {
        color: #ffd5d5;
        border-color: rgba(255,80,80,0.32);
      }
      #scene-composer select {
        flex: 1;
        min-width: 0;
        padding: 0 10px;
      }
      .sc-icon {
        width: 34px;
        min-width: 34px;
        padding: 0 !important;
        font-size: 18px !important;
      }
      .sc-segment {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 5px;
      }
      .sc-selected {
        min-height: 28px;
        color: rgba(245,240,232,0.72);
        font-size: 12px;
      }
      .sc-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 7px;
        margin-bottom: 7px;
      }
      .sc-scale-uniform {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: end;
        gap: 7px;
        margin-bottom: 7px;
      }
      .sc-scale-uniform label {
        display: grid;
        gap: 4px;
        color: rgba(245,240,232,0.50);
        font-size: 9px;
        letter-spacing: 0.09em;
      }
      .sc-scale-uniform input[type="number"] {
        width: 100%;
        height: 30px;
        padding: 0 7px;
      }
      .sc-scale-lock {
        grid-template-columns: auto max-content;
        align-items: center;
        min-height: 30px;
        padding: 0 8px;
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 4px;
        background: rgba(255,255,255,0.06);
        color: rgba(245,240,232,0.72) !important;
        font-size: 10px !important;
        letter-spacing: 0 !important;
      }
      .sc-scale-lock input {
        width: 14px;
        height: 14px;
        margin: 0;
      }
      .sc-grid label {
        display: grid;
        gap: 4px;
        color: rgba(245,240,232,0.50);
        font-size: 9px;
        letter-spacing: 0.09em;
      }
      .sc-grid input {
        width: 100%;
        height: 30px;
        padding: 0 7px;
      }
      .sc-color-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 7px;
      }
      .sc-color-grid label {
        display: grid;
        grid-template-columns: 1fr 34px;
        align-items: center;
        gap: 7px;
        min-width: 0;
        color: rgba(245,240,232,0.68);
        font-size: 11px;
      }
      .sc-color-grid input[type="color"] {
        width: 34px;
        height: 30px;
        padding: 2px;
      }
      .sc-list {
        display: grid;
        gap: 5px;
        max-height: 160px;
        overflow: auto;
      }
      .sc-list button {
        justify-content: flex-start;
        overflow: hidden;
        text-align: left;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      #sc-json {
        display: block;
        width: 100%;
        height: 150px;
        margin-bottom: 8px;
        padding: 10px;
        resize: vertical;
        font-family: Consolas, "Courier New", monospace;
        font-size: 11px;
        line-height: 1.4;
      }
      .sc-toast {
        position: sticky;
        bottom: 0;
        margin-top: 10px;
        padding: 9px 10px;
        border-radius: 4px;
        background: rgba(245,240,232,0.90);
        color: #111;
        opacity: 0;
        transform: translateY(6px);
        transition: opacity 0.18s ease, transform 0.18s ease;
      }
      .sc-toast.show { opacity: 1; transform: translateY(0); }
      .sc-toast.error { background: rgba(255,210,210,0.95); }
      @media (max-width: 720px) {
        #scene-composer {
          left: 10px;
          right: 10px;
          top: auto;
          max-height: 58vh;
          width: auto;
        }
      }
    `;
    document.head.appendChild(style);
  }

  destroy() {
    clearTimeout(this.savingTimer);
    clearTimeout(this.toastTimer);
    this.canvas.removeEventListener('pointerdown', this.onCanvasPointerDown);
    window.removeEventListener('keydown', this.onKeyDown);
    this.transform?.detach();
    if (this.transformHelper) this.scene.remove(this.transformHelper);
    this.transform?.dispose?.();
    this.panel?.remove();
    document.body.classList.remove('scene-composer-active');
    document.body.classList.remove('scene-composer-seed');
    this.poolDecor.pauseFloating = false;
    if (this.controls) this.controls.enablePan = false;
  }
}
