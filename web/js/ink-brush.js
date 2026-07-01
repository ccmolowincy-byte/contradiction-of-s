/* Single-ink brush engine for the character tools.
 * Inspired by inkField's documented pressure/speed feel, implemented locally
 * without copying unavailable source from that project.
 */
(function () {
  'use strict';

  const RED = '#B31A1A';
  let sharedP5Renderer = null;

  class P5BrushRenderer {
    constructor() {
      this.ready = false;
      this.failed = false;
      this.w = 0;
      this.h = 0;
      this.p = null;
      this.drawCount = 0;
      this.host = document.createElement('div');
      this.host.style.cssText = 'position:fixed;left:-10000px;top:-10000px;width:1px;height:1px;overflow:hidden;pointer-events:none;';
      document.body.appendChild(this.host);

      try {
        if (!window.p5 || !window.brush) {
          this.failed = true;
          return;
        }
        new window.p5((p) => {
          this.p = p;
          p.setup = () => {
            try {
              p.pixelDensity(1);
              p.createCanvas(16, 16, p.WEBGL);
              p.noLoop();
              p.clear();
              if (window.brush.instance) window.brush.instance(p);
              if (window.brush.load) window.brush.load();
              if (window.brush.scaleBrushes) window.brush.scaleBrushes(2.25);
              this.ready = true;
            } catch (err) {
              this.failed = true;
            }
          };
        }, this.host);
      } catch (err) {
        this.failed = true;
      }
    }

    canDraw() {
      return this.ready && !this.failed && this.p && window.brush;
    }

    drawLine(targetCtx, width, height, a, b, size, color) {
      if (!this.canDraw()) return false;
      try {
        const p = this.p;
        if (this.w !== width || this.h !== height) {
          p.resizeCanvas(Math.max(1, Math.round(width)), Math.max(1, Math.round(height)));
          this.w = width;
          this.h = height;
        }
        p.clear();
        if (window.brush.instance) window.brush.instance(p);
        if (window.brush.load) window.brush.load();
        if (window.brush.noField) window.brush.noField();
        if (window.brush.wiggle) window.brush.wiggle(0.35);

        const brushName = size >= 7 ? 'marker2' : 'marker';
        const weight = Math.max(1.2, size * 0.95);
        window.brush.set(brushName, color, weight);
        window.brush.line(a.x, a.y, b.x, b.y);

        targetCtx.save();
        targetCtx.globalCompositeOperation = 'source-over';
        targetCtx.drawImage(p.canvas, 0, 0, width, height);
        targetCtx.restore();
        this.drawCount += 1;
        return true;
      } catch (err) {
        this.failed = true;
        return false;
      }
    }

    drawSpline(targetCtx, width, height, points, size, color) {
      if (!this.canDraw() || !points || points.length < 2 || !window.brush.spline) return false;
      try {
        const p = this.p;
        if (this.w !== width || this.h !== height) {
          p.resizeCanvas(Math.max(1, Math.round(width)), Math.max(1, Math.round(height)));
          this.w = width;
          this.h = height;
        }
        p.clear();
        if (window.brush.instance) window.brush.instance(p);
        if (window.brush.load) window.brush.load();
        if (window.brush.noField) window.brush.noField();
        if (window.brush.wiggle) window.brush.wiggle(0.35);

        const brushName = size >= 7 ? 'marker2' : 'marker';
        const weight = Math.max(1.2, size * 0.95);
        const splinePoints = points.map((pt) => [pt.x, pt.y, Math.max(0.45, Math.min(1.15, pt.p || 0.75))]);
        window.brush.set(brushName, color, weight);
        window.brush.spline(splinePoints, 0.45);

        targetCtx.save();
        targetCtx.globalCompositeOperation = 'source-over';
        targetCtx.drawImage(p.canvas, 0, 0, width, height);
        targetCtx.restore();
        this.drawCount += 1;
        return true;
      } catch (err) {
        this.failed = true;
        return false;
      }
    }
  }

  function getP5Renderer() {
    if (!sharedP5Renderer && document.body) sharedP5Renderer = new P5BrushRenderer();
    return sharedP5Renderer;
  }

  function getBackendState() {
    const renderer = sharedP5Renderer;
    return {
      p5: !!window.p5,
      brush: !!window.brush,
      ready: !!renderer?.ready,
      failed: !!renderer?.failed,
      drawCount: renderer?.drawCount || 0,
    };
  }

  class InkBrush {
    constructor(ctx, opts) {
      this.ctx = ctx;
      this.getPoint = opts.getPoint;
      this.size = opts.size || 5;
      this.opacity = opts.opacity == null ? 0.72 : opts.opacity;
      this.color = opts.color || RED;
      this.mode = opts.mode || 'draw';
      this.points = [];
      this.strokePoints = [];
      this.last = null;
      this.brushLast = null;
      this.strokeIndex = 0;
    }

    setSize(size) { this.size = size; }
    setOpacity(opacity) { this.opacity = Math.max(0.08, Math.min(1, opacity)); }
    setMode(mode) { this.mode = mode === 'erase' ? 'erase' : 'draw'; }

    begin(e) {
      const p = this._sample(e);
      this.points = [p];
      this.strokePoints = [p];
      this.last = p;
      this.brushLast = p;
      this.strokeIndex = 0;
      this._stamp(p, this._radius(p, 0));
    }

    move(e) {
      const p = this._sample(e);
      if (!this.last) return this.begin(e);
      const prev = this.last;
      const dist = Math.hypot(p.x - prev.x, p.y - prev.y);
      if (dist < 0.01) return;
      const speed = dist / Math.max(1, p.t - prev.t);
      p.speed = speed;
      this.points.push(p);
      if (this.points.length > 5) this.points.shift();

      const steps = Math.max(1, Math.ceil(dist / Math.max(1.2, this.size * 0.32)));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const q = this._smooth(prev, p, t);
        this._stamp(q, this._radius(q, speed));
        if (this.mode === 'draw') this.strokePoints.push(q);
      }
      this.last = p;
    }

    end() {
      if (this.mode === 'draw' && this.strokePoints.length > 2) {
        getP5Renderer()?.drawSpline(
          this.ctx,
          this.ctx.canvas.width,
          this.ctx.canvas.height,
          this.strokePoints,
          this.size,
          this.color
        );
      }
      this.points = [];
      this.strokePoints = [];
      this.last = null;
      this.brushLast = null;
      this.strokeIndex = 0;
    }

    _sample(e) {
      const raw = this.getPoint(e);
      const pressure = e.pointerType === 'mouse'
        ? 0.62
        : Math.max(0.18, Math.min(1, e.pressure || 0.55));
      return { x: raw.x, y: raw.y, p: pressure, t: performance.now(), speed: 0 };
    }

    _smooth(a, b, t) {
      const ease = t * t * (3 - 2 * t);
      return {
        x: a.x + (b.x - a.x) * ease,
        y: a.y + (b.y - a.y) * ease,
        p: a.p + (b.p - a.p) * ease,
        t: a.t + (b.t - a.t) * ease,
        speed: a.speed + (b.speed - a.speed) * ease,
      };
    }

    _radius(p, speed) {
      const speedT = Math.max(0, Math.min(1, speed / 1.2));
      const pressureT = Math.max(0.25, Math.min(1, p.p || 0.55));
      const wobble = 1;
      const startBloom = this.strokeIndex < 7 ? 0.55 + this.strokeIndex * 0.065 : 1;
      return this.size * (0.38 + pressureT * 0.95 - speedT * 0.28) * wobble * startBloom;
    }

    _stamp(p, r) {
      const ctx = this.ctx;
      if (this.mode === 'draw' && this.brushLast) {
        const from = this.brushLast;
        if (Math.hypot(p.x - from.x, p.y - from.y) > 0.01) {
          getP5Renderer()?.drawLine(ctx, ctx.canvas.width, ctx.canvas.height, from, p, r, this.color);
          this._inkSegment(from, p, r);
          this.brushLast = p;
          this.strokeIndex += 1;
          return;
        }
      }
      ctx.save();
      ctx.globalCompositeOperation = this.mode === 'erase' ? 'destination-out' : 'source-over';
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.mode === 'erase' ? 0.95 : this.opacity * 0.5;
      ctx.shadowColor = this.mode === 'erase' ? 'transparent' : 'rgba(179,26,26,0.08)';
      ctx.shadowBlur = this.mode === 'erase' ? 0 : Math.max(0.6, r * 0.18);
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.8, r), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    _inkSegment(a, b, r) {
      const ctx = this.ctx;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.max(0.001, Math.hypot(dx, dy));
      const nx = -dy / len;
      const ny = dx / len;
      const speedT = Math.max(0, Math.min(1, (b.speed || 0) / 1.3));
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const bloom = 1.08 + (1 - speedT) * 0.18;
      const coreAlpha = this.opacity * (0.34 + (b.p || 0.55) * 0.28);
      ctx.strokeStyle = this.color;
      ctx.globalAlpha = this.opacity * 0.045;
      ctx.lineWidth = Math.max(1.2, r * 1.55 * bloom);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      ctx.globalAlpha = this.opacity * 0.08;
      ctx.lineWidth = Math.max(0.9, r * 1.18 * bloom);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      ctx.globalAlpha = coreAlpha;
      ctx.lineWidth = Math.max(0.55, r * (0.68 - speedT * 0.18));
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      const tipR = Math.max(0.7, r * 0.52);
      const grd = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, tipR * 2.8);
      grd.addColorStop(0, 'rgba(179,26,26,0.08)');
      grd.addColorStop(0.42, 'rgba(179,26,26,0.035)');
      grd.addColorStop(1, 'rgba(179,26,26,0)');
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(b.x, b.y, tipR * 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  window.COS_INK = { InkBrush, RED, getBackendState };
  setTimeout(() => getP5Renderer(), 0);
})();
