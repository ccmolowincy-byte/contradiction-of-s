# Garden Art Vision Contract

Status: locked direction
Date: 2026-06-27

This document is the working contract for the garden feature of Contradiction of S.
The garden is not a random particle field and it is not a decorative summary of a
recording. It is the post-capture translation of a visitor's real exercise motion
into a living communal body-garden.

## Core Rule

The camera runtime captures faithful body motion. The garden transforms that
motion, but must not discard the anatomical structure that makes the motion
recognizable.

Use the full MediaPipe Pose Landmarker stream when available:

- 33 named landmarks per frame
- landmark confidence, visibility, and presence
- frame time `t`
- partial-body validity: upper-body-only recordings are legitimate
- legacy 17-point `kp` only as compatibility data for older rows

## Existing Data Contract

Rows in `pain_traces` may include:

```js
{
  id,
  strokes,        // legacy/downsampled movement trace
  prompt,
  visual_params,  // older generated parameters
  skeletons: [
    {
      t,
      model: 'mediapipe_pose_landmarker',
      kp: [{ x, y, s }], // 17-point compatibility shape
      landmarks: [
        { name, x, y, z, s, visibility, presence }
      ]
    }
  ]
}
```

Garden code must prefer `skeletons[].landmarks` over `skeletons[].kp`.

## Translation Vocabulary

The garden should derive visual behavior from measurable motion features:

- reach: body bounding box, arm span, leg extension
- rhythm: reversal count, repeated loops, tempo changes
- intensity: joint velocity and acceleration
- stillness: pauses, held stretches, weighted moments
- asymmetry: left/right differences in range and speed
- body coverage: which named joints are visible across the recording
- posture: torso line, shoulder/hip relation, crouch/stretch/compression
- travel: root motion of pelvis or shoulder midpoint

These features may become stems, vines, flowers, rings, tendrils, pulses, or
constellation trails, but they must remain traceable back to the recorded body.

## First Production Garden Direction

Each contribution becomes a movement plant:

- visible joints become red-star nodes
- bones become stems or vine segments
- repeated motion grows rings or branching around the involved joints
- slow held positions create larger blooms
- fast motion creates thinner, brighter, more nervous tendrils
- upper-body-only captures grow as partial plants instead of broken bodies
- full-body captures can root from hips/feet and branch through limbs

The initial garden can remain a Three.js scene, but the per-entry material should
be generated from the landmark time series, not only from `strokes`.

## Implementation Boundary

`gesture.js` owns capture:

- model loading
- camera permission handling
- landmark normalization
- recording snapshots
- save payload

`archive-cloud.js` owns garden realization:

- loading public traces
- choosing landmark or legacy rendering path
- deriving movement features
- rendering the communal garden
- keeping older rows readable

`custom-skel-draw.js` owns anatomical drawing:

- star-jointed skeleton
- landmark-to-body mapping
- partial body rendering

UI may change layout, navigation, and states, but should not rename the gesture
DOM IDs without coordinating with `gesture.js`.

## Immediate Technical Decisions

- Keep one flagship browser app.
- No local fallback tracker.
- No sculpture/image-target feature until the sculptures exist.
- No installed native app for the exhibition path.
- Keep camera failure graceful by routing visitors back to non-camera content.
- Vendor runtime dependencies where possible for gallery Wi-Fi reliability.
- Prefer low-overhead derived features over extra neural networks in the garden.

## Next Build Step

Build `movement-features.js`:

1. Input: `skeletons[]`.
2. Prefer `landmarks`; fall back to `kp`.
3. Output: a compact feature object for renderer use.
4. Keep it deterministic so the same trace always grows the same garden form.

The garden renderer should then consume that feature object instead of inventing
visual parameters independently.
