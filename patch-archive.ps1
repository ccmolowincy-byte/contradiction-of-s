param()
$path = 'C:\Users\user\OneDrive\Desktop\Contradiction of S AR project\web\js\archive-cloud.js'
$L = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)
Write-Host ("Lines before: " + [string]$L.Length)

# ══════════════════════════════════════════════════════════════
# Change 8 (highest index first): replace skelCanvas block
# Original: indices 744-793 (line 745-794 one-indexed)
# ══════════════════════════════════════════════════════════════
$c8 = [string[]]@(
  '      } else if (r.skelCanvas) {',
  '        r.materials[0].mat.opacity = r.opacity * r.materials[0].targetAlpha;',
  '',
  '        const shouldAnimate  = i < ANIM_SLOTS || r.isHighlighted;',
  '        const shouldBreathe  = !shouldAnimate && i < BREATHE_SLOTS;',
  '        const shouldStarAnim = !r.starAnimDone && r.starAnimStart >= 0;',
  '',
  '        if (shouldAnimate && r.skelFrames) {',
  '          const N = r.skelFrames.length;',
  '          r.playhead = (r.playhead + dt * r.playRate) % N;',
  '          const ph = Math.floor(r.playhead);',
  '',
  '          if (ph !== r.lastDrawnFrame || shouldStarAnim) {',
  '            if (ph !== r.lastDrawnFrame) r.lastDrawnFrame = ph;',
  '            const CW = r.skelCanvas.width, CH = r.skelCanvas.height;',
  '            r.skelCtx.clearRect(0, 0, CW, CH);',
  '            if (r.bloomStart > 0) _drawBloom(r.skelCtx, CW, CH, clock - r.bloomStart);',
  '            for (let t = 3; t >= 1; t--) {',
  '              const idx = ((ph - t) + N * 3) % N;',
  '              const a = 0.06 * Math.pow(0.52, t - 1);',
  '              customSkel.draw(r.skelCtx, r.skelFrames[idx].kp, CW, CH, a, r.skelSeed, 0, r.palette);',
  '            }',
  '            customSkel.draw(r.skelCtx, r.skelFrames[ph].kp, CW, CH, 0.86, r.skelSeed, clock, r.palette);',
  '            _drawLabel(r.skelCtx, CW, CH, r.labelText, r.palette && r.palette.bone);',
  '            if (shouldStarAnim) _drawStarAnim(r.skelCtx, CW, CH, r, clock - r.starAnimStart);',
  '            r.boneTex.needsUpdate = true;',
  '          }',
  '        } else if (shouldBreathe && r.skelFrames && (breatheFrame === 0 || shouldStarAnim)) {',
  '          const midIdx = Math.floor(r.skelFrames.length / 2);',
  '          const CW = r.skelCanvas.width, CH = r.skelCanvas.height;',
  '          r.skelCtx.clearRect(0, 0, CW, CH);',
  '          if (r.bloomStart > 0) _drawBloom(r.skelCtx, CW, CH, clock - r.bloomStart);',
  '          customSkel.draw(r.skelCtx, r.skelFrames[midIdx].kp, CW, CH, 0.65, r.skelSeed, clock, r.palette);',
  '          _drawLabel(r.skelCtx, CW, CH, r.labelText, r.palette && r.palette.bone);',
  '          if (shouldStarAnim) _drawStarAnim(r.skelCtx, CW, CH, r, clock - r.starAnimStart);',
  '          r.boneTex.needsUpdate = true;',
  '        } else if (!r.skelSettled && !shouldBreathe && r.skelFrames) {',
  '          r.skelSettled = true;',
  '          const midIdx = Math.floor(r.skelFrames.length / 2);',
  '          const CW = r.skelCanvas.width, CH = r.skelCanvas.height;',
  '          r.skelCtx.clearRect(0, 0, CW, CH);',
  '          customSkel.draw(r.skelCtx, r.skelFrames[midIdx].kp, CW, CH, 0.65, r.skelSeed, 0, r.palette);',
  '          _drawLabel(r.skelCtx, CW, CH, r.labelText, r.palette && r.palette.bone);',
  '          if (shouldStarAnim) _drawStarAnim(r.skelCtx, CW, CH, r, clock - r.starAnimStart);',
  '          r.boneTex.needsUpdate = true;',
  '        } else if (r.skelSettled && shouldStarAnim && r.skelFrames) {',
  '          const midIdx = Math.floor(r.skelFrames.length / 2);',
  '          const CW = r.skelCanvas.width, CH = r.skelCanvas.height;',
  '          r.skelCtx.clearRect(0, 0, CW, CH);',
  '          customSkel.draw(r.skelCtx, r.skelFrames[midIdx].kp, CW, CH, 0.65, r.skelSeed, 0, r.palette);',
  '          _drawLabel(r.skelCtx, CW, CH, r.labelText, r.palette && r.palette.bone);',
  '          _drawStarAnim(r.skelCtx, CW, CH, r, clock - r.starAnimStart);',
  '          r.boneTex.needsUpdate = true;',
  '        }'
)
$L = $L[0..743] + $c8 + $L[794..($L.Length-1)]
Write-Host ("After c8: " + [string]$L.Length)

# ══════════════════════════════════════════════════════════════
# Change 7: addTrace call — add isNew=true (index 674)
# ══════════════════════════════════════════════════════════════
$L[674] = '    _addToGarden(trace, !!(highlightId && trace.id === highlightId), true);'
Write-Host ("c7 done: " + $L[674])

# ══════════════════════════════════════════════════════════════
# Change 6: Insert strokeArc + star fields after bloomStart (index 645)
# ══════════════════════════════════════════════════════════════
$c6 = [string[]]@(
  '      strokeArc:      result.strokeArc != null ? result.strokeArc : null,',
  '      starAnimStart:  (isNew || isHighlighted) ? clock : -1,',
  '      starAnimDone:   !(isNew || isHighlighted),'
)
$L = $L[0..645] + $c6 + $L[646..($L.Length-1)]
Write-Host ("After c6: " + [string]$L.Length)

# ══════════════════════════════════════════════════════════════
# Change 5: Add strokeArc to destructuring (index 616)
# ══════════════════════════════════════════════════════════════
$L[616] = '            labelText, strokeArc } = result;'
Write-Host ("c5 done: " + $L[616])

# ══════════════════════════════════════════════════════════════
# Change 4: Add isNew=false param to _addToGarden (index 608)
# ══════════════════════════════════════════════════════════════
$L[608] = '  function _addToGarden(trace, isHighlighted, isNew = false) {'
Write-Host ("c4 done: " + $L[608])

# ══════════════════════════════════════════════════════════════
# Change 3: Add strokeArc to return statement (insert after index 413)
# index 413 = '        labelText,'   index 414 = '      };'
# ══════════════════════════════════════════════════════════════
$L = $L[0..413] + '        strokeArc,' + $L[414..($L.Length-1)]
Write-Host ("After c3: " + [string]$L.Length)

# ══════════════════════════════════════════════════════════════
# Change 2: Insert strokeArc computation before let seed (index 364)
# ══════════════════════════════════════════════════════════════
$c2 = [string[]]@(
  '    let strokeArc = null;',
  '    {',
  '      const allPts = trace.strokes ? [].concat(...trace.strokes) : [];',
  '      const step   = Math.max(1, Math.floor(allPts.length / 40));',
  '      const sPts   = allPts',
  '        .filter(function(_, i) { return i % step === 0; })',
  '        .map(function(p) { return { x: ((p.x || 0) + anchorDX) * _CW, y: ((p.y || 0) + anchorDY) * _CH }; })',
  '        .filter(function(p) { return Number.isFinite(p.x) && Number.isFinite(p.y); });',
  '      if (sPts.length >= 2) {',
  '        const sArc = [0];',
  '        for (let i = 1; i < sPts.length; i++) {',
  '          const dx = sPts[i].x - sPts[i-1].x, dy = sPts[i].y - sPts[i-1].y;',
  '          sArc.push(sArc[i-1] + Math.sqrt(dx*dx + dy*dy));',
  '        }',
  '        strokeArc = { pts: sPts, arc: sArc, tl: sArc[sArc.length-1] || 1 };',
  '      }',
  '    }',
  ''
)
$L = $L[0..363] + $c2 + $L[364..($L.Length-1)]
Write-Host ("After c2: " + [string]$L.Length)

# ══════════════════════════════════════════════════════════════
# Change 1: Insert helper functions before _buildSkeletonTrace (index 251)
# ══════════════════════════════════════════════════════════════
$c1 = [string[]]@(
  '',
  '  function _drawStarOutline(ctx, cx, cy, sc, rot, progress, lw, col, glowW) {',
  '    const OR = [7.0,5.5,7.6,5.1,6.7], IR = [2.8,2.3,3.0,2.2,2.6];',
  '    const v = [];',
  '    for (let k = 0; k < 10; k++) {',
  '      const o = k%2===0, pi=Math.floor(k/2), r=(o?OR[pi]:IR[pi])*sc;',
  '      const a = k*Math.PI/5 + rot - Math.PI/2;',
  '      v.push({x: cx + r*Math.cos(a), y: cy + r*Math.sin(a)});',
  '    }',
  '    v.push({x: v[0].x, y: v[0].y});',
  '    const fs = Math.floor(progress * 10);',
  '    const fr = (progress * 10) - fs;',
  '    function buildPath() {',
  '      ctx.beginPath(); ctx.moveTo(v[0].x, v[0].y);',
  '      for (let s = 0; s < fs; s++) ctx.lineTo(v[s+1].x, v[s+1].y);',
  '      if (fs < 10 && fr > 0) {',
  '        const va = v[fs], vb = v[Math.min(fs+1,10)];',
  '        ctx.lineTo(va.x + fr*(vb.x-va.x), va.y + fr*(vb.y-va.y));',
  '      }',
  '    }',
  '    ctx.save(); ctx.lineCap = ''round''; ctx.lineJoin = ''round'';',
  '    if (glowW) { buildPath(); ctx.strokeStyle = ''rgba(196,148,72,0.18)''; ctx.lineWidth = glowW; ctx.stroke(); }',
  '    buildPath(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke();',
  '    if (progress > 0 && progress < 1) {',
  '      const va = v[Math.min(fs,9)], vb = v[Math.min(fs+1,10)];',
  '      const tx = va.x + fr*(vb.x-va.x), ty = va.y + fr*(vb.y-va.y);',
  '      const g = ctx.createRadialGradient(tx,ty,0,tx,ty,lw*3.5);',
  '      g.addColorStop(0,''rgba(248,220,165,0.95)''); g.addColorStop(1,''rgba(196,162,96,0)'');',
  '      ctx.beginPath(); ctx.arc(tx,ty,lw*3.5,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();',
  '    }',
  '    ctx.restore();',
  '  }',
  '',
  '  function _posAtArc(pts, arc, tl, s) {',
  '    s = Math.max(0, Math.min(tl, s));',
  '    for (let i = 1; i < arc.length; i++) {',
  '      if (arc[i] >= s) {',
  '        const f = (s - arc[i-1]) / (arc[i] - arc[i-1]);',
  '        return { x: pts[i-1].x + f*(pts[i].x-pts[i-1].x), y: pts[i-1].y + f*(pts[i].y-pts[i-1].y) };',
  '      }',
  '    }',
  '    return { x: pts[pts.length-1].x, y: pts[pts.length-1].y };',
  '  }',
  '',
  '  const STAR_CHAIN_END = 1.55, LARGE_START = 1.40, LARGE_DRAW_END = 3.60;',
  '  const HOLD_END = 4.60, ANIM_TOTAL = 5.40;',
  '',
  '  function _drawStarAnim(ctx, CW, CH, entry, age) {',
  '    if (age >= ANIM_TOTAL) { entry.starAnimDone = true; return; }',
  '    const fade = age > HOLD_END ? Math.max(0, 1 - (age - HOLD_END) / (ANIM_TOTAL - HOLD_END)) : 1;',
  '    ctx.save();',
  '    ctx.globalAlpha = fade;',
  '    if (entry.strokeArc && age < STAR_CHAIN_END + 0.5) {',
  '      const pts = entry.strokeArc.pts, arc = entry.strokeArc.arc, tl = entry.strokeArc.tl;',
  '      const SC=7, EACH=0.30, STAG=0.18;',
  '      for (let i = 0; i < SC; i++) {',
  '        const t2 = age - STAG*i;',
  '        const prog = Math.max(0, Math.min(1, t2/EACH));',
  '        if (prog <= 0) continue;',
  '        const pos = _posAtArc(pts, arc, tl, tl * i/(SC-1));',
  '        _drawStarOutline(ctx, pos.x, pos.y, 3.2, 0.14 + i*0.38, prog, 4, ''rgba(220,185,120,0.90)'', 0);',
  '      }',
  '    }',
  '    if (age >= LARGE_START) {',
  '      const lp = Math.max(0, Math.min(1, (age - LARGE_START) / (LARGE_DRAW_END - LARGE_START)));',
  '      if (lp > 0) _drawStarOutline(ctx, CW*0.5, CH*0.50, 26, 0.14, lp, 6, ''rgba(220,185,120,0.82)'', 24);',
  '    }',
  '    ctx.restore();',
  '  }',
  ''
)
$L = $L[0..250] + $c1 + $L[251..($L.Length-1)]
Write-Host ("After c1: " + [string]$L.Length)

# ══════════════════════════════════════════════════════════════
# Write back as UTF-8 with LF line endings
# ══════════════════════════════════════════════════════════════
$out = $L -join "`n"
$utf8NoBOM = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $out + "`n", $utf8NoBOM)
Write-Host "Done. File written."
