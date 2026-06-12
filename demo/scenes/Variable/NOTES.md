# Variable Font Weight Rendering — Research Notes

Goal: render MSDF text where the font weight can be changed GPU-side via a uniform,
and ultimately **per character** (e.g. first char extra-light, second char bold,
animated independently).

Test font: Oswald, 6 static weight instances (extra-light 200 → bold 700), one
MSDF atlas + `font.json` per weight, all generated with the same charset (91 chars),
texture size (512×512), font size (48) and `distanceRange` (4).

---

## Why this is hard

A single MSDF atlas encodes **one** outline per glyph. There is no way to encode a
whole variable axis into one MSDF, so "GPU variable weight" always means
**interpolating between discrete weight instances** at render time.

### Rule 1: never mix MSDF RGB channels across atlases

```glsl
// WRONG — channel→edge assignment is arbitrary per glyph,
// R of the light atlas has no correspondence with R of the bold atlas
vec3 s = mix(texture2D(uMap1, vUv).rgb, texture2D(uMap2, vUv).rgb, t);
float sigDist = median(s.r, s.g, s.b) - 0.5;

// RIGHT — collapse each MSDF to a scalar signed distance first,
// then interpolate the distances (a well-defined shape morph)
float d1 = median(s1.r, s1.g, s1.b);
float d2 = median(s2.r, s2.g, s2.b);
float sigDist = mix(d1, d2, t) - 0.5;
```

Interpolating scalar SDFs looks very close to true variable-font interpolation for
weight axes (weights are roughly dilations of the same skeleton). Corners round
slightly mid-blend (multi-channel sharpness is lost in the collapse), endpoints are
exact. Requires all atlases to share `fontSize` / `fieldRange` / `textureSize` so
distance units are comparable. ✓ verified for the Oswald set.

### Rule 2: UVs are per-atlas

Each weight atlas is packed independently — glyph "A" is 25px wide in extra-light,
30px in bold, at different rects. A UV computed from one `font.json` reads garbage
in another atlas. Also: *interpolating* UVs is conceptually wrong — the fragment
shader needs each atlas's **exact** UVs simultaneously (one UV set per sampled atlas).

Two ways out:
- **Per-weight UV attributes** (`uv`, `uv2`, …) — works with current atlases.
- **Identical packing across weights** (uniform grid: same cell per glyph in every
  atlas) — one static UV works for *all* weights. This is the key unlock for the
  per-character requirement (see below).

### Rule 3: metrics differ per weight

Quad sizes, glyph offsets and advances all change with weight (bold is wider).
A true morph must also interpolate vertex **positions**, otherwise the bold glyph
gets squeezed into the light glyph's quad and letter-spacing stays fixed.

Constraint that follows: all weights must produce the same glyphs in the same order
(identical line breaks) so vertices correspond 1:1.

---

## Approaches considered

### A. Threshold bias (single atlas, fake weight)

```glsl
float sigDist = median(s.r, s.g, s.b) - 0.5 + uWeightBias; // + bolder, − lighter
```

Dilates/erodes the glyph for free. Distorts letterforms (rounds corners, clogs
counters), doesn't change advances. OK for subtle faux-bold, not real variable
weight. Could still become a cheap `uniforms.rendering` addition to the library.

### B. Morph targets (three.js native)

Store all weights' positions as `geometry.morphAttributes.position`, drive
`mesh.morphTargetInfluences`. With absolute targets three computes
`transformed = base * (1 − Σinf) + Σ target_i * inf_i`, so adjacent-pair influences
give exact pairwise lerp + free `AnimationMixer`/GSAP tooling.

Caveats:
- Morph system only supports `position`/`normal`/`color` — **UVs cannot be morphed**
  (and shouldn't be, see Rule 2). Without identical atlas packing you still need UV
  buffer swapping, so you'd run both mechanisms.
- This lib's `position` attribute is `itemSize: 2`; three's morph-texture packing
  assumes vec3 → needs padding.
- Custom `ShaderMaterial` must include `morphtarget_pars_vertex` /
  `begin_vertex` / `morphtarget_vertex` chunks.

Verdict: cleanest *if* combined with identically-packed atlases + `DataArrayTexture`.
But it morphs the whole mesh with one influence set → **does not solve per-character
weight either**.

### C. Adjacent-pair buffer swapping ← implemented (current state)

GPU blends between exactly 2 adjacent weights; CPU maps a global weight value
(200–700) onto a segment and rebinds resources only when crossing segments:

- Precompute `position` + `uv` BufferAttributes for all 6 weights
  (one throwaway `MSDFTextGeometry` per font, vertex-count checked).
- `updateWeight(weight)`:
  - `t = (weight − 200) / 100`, `segment = min(floor(t), 4)`
  - every change: `uWeight = t − segment` (cheap)
  - on segment change only: rebind `uMap1`/`uMap2` + `position`/`uv`/`position2`/`uv2`
- Vertex shader: `mix(position.xy, position2, uWeight)`, passes `vUv` + `vUv2`.
- Fragment shader: sample each atlas with its own UVs, median each, mix distances.

Works, smooth across segment boundaries, no geometry rebuild.

**Limitation (why this isn't the final design): `uWeight` is a global uniform and,
more fundamentally, only ONE atlas pair is bound at a time.** Every character is
forced into the same weight segment — char A at extra-light (segment 0) and char B
at bold (segment 4) cannot coexist. Per-character weight breaks this architecture,
not just the uniform.

---

## Direction for per-character weight

Requirements it imposes:

1. **Weight as a per-vertex attribute** (or derived from `letterIndex` + a lookup),
   not a uniform. Each glyph's 4 vertices carry its own weight value → varying →
   fragment blend factor.
2. **All weight atlases accessible in one draw call.** A fragment may need any pair
   of the 6 atlases. Options:
   - `DataArrayTexture` (sampler2DArray, WebGL2): 6 layers, fragment samples
     `floor(w)` and `ceil(w)` layers and mixes. Clean, scalable.
   - 6 bound samplers + branching: ugly, burns texture units, doesn't scale.
3. **Identical glyph packing across all weight atlases** (uniform grid generation)
   so a single `uv` attribute is valid for every layer. Without this you'd need 6 UV
   attributes — the geometry already uses ~13 of the 16 attribute slots, so that's
   a dead end. → check / extend the `msdf-generator` vendor for fixed-grid packing.
4. **Per-character layout is the hard part.** Each char's x-position depends on the
   *cumulative advances of all preceding chars at their own current weights* — a
   prefix-sum the vertex shader can't do locally. Options, in increasing fidelity:
   - **Fixed metrics**: lay out once at a reference weight (e.g. regular), size quads
     generously (max-weight bounds + field padding) and let the SDF morph inside the
     fixed quad. Spacing doesn't react to weight. Simplest, often visually fine.
   - **CPU re-layout**: when per-char weights change, CPU recomputes glyph positions
     (cheap: it's just the layout pass, no texture work) and updates the `position`
     buffer; GPU still does all shape blending. Good hybrid.
   - **GPU layout via data texture**: advances per (glyph, weight) in a small data
     texture + per-char cumulative offset computed in a loop or precomputed per
     frame. Only worth it if weights animate per-char every frame.

Sketch of the target shader once 1–3 are in place:

```glsl
// vertex
attribute float weight;          // per-glyph, 0..5 across the axis
varying float vWeight;

// fragment
uniform sampler2DArray uMaps;    // 6 layers, identical packing
float layer = floor(vWeight);
float t = vWeight - layer;
float d1 = median3(texture(uMaps, vec3(vUv, layer)).rgb);
float d2 = median3(texture(uMaps, vec3(vUv, layer + 1.0)).rgb);
float sigDist = mix(d1, d2, t) - 0.5;
```

Note `vWeight` is constant per glyph quad (all 4 vertices share the value), so the
varying interpolation is flat — no cross-glyph bleeding.

---

## Identical packing across weights (how to actually get it)

This is the prerequisite for requirement 3 above (one static `uv` + `DataArrayTexture`).
It's worth being precise about *why* it's not free and which tool delivers it.

### Why no tool gives it by default

All the common generators run a **tight rect-packer** that places each glyph by its
actual bitmap size. A bold "A" (30px) is bigger than an extra-light "A" (25px) at the
same `fontSize`, so when each weight is generated independently **both the position
and the size** of every glyph's cell differ per weight. That is exactly what forces
the per-weight `uv`/`uv2` swap in approach C.

- **Our vendored generator** (`@zappar/msdf-generator`, a WASM port of *msdfgen*) packs
  inside the wasm worker (`generateAtlas`). The only knobs exposed are
  `font / charset / fontSize / textureSize / fieldRange / padding / fixOverlaps`
  — **no layout/placement control**. See `src/generateMSDF.js`.
- **`msdf-bmfont-xml`** uses a shelf/maxrects bin-packer. Also tight, also no
  shared-layout option. Same problem.

### The mechanism that fixes it: a uniform grid

Force a fixed grid where **cell = f(glyph index)** instead of letting the packer place
by size. If every weight uses the same charset order, same column count and same cell
size, glyph *i* lands at the **same rect in every atlas** → UVs become purely
index-based and **identical across all weights**. Consequences:

- drop `uv2` entirely — one static `uv` is valid for every layer,
- stack all weights into a `DataArrayTexture` and sample any two layers,
- which is the precondition for per-character weight.

Cell must be sized for the **worst case** (boldest glyph + field padding) so nothing
clips; narrow glyphs (`i`, `l`, `.`) then carry empty margin — uniform grids trade
atlas space for predictable indexing. Fine for a fixed charset.

### Option A — `msdf-atlas-gen` (recommended, native support)

Chlumsky's [`msdf-atlas-gen`](https://github.com/Chlumsky/msdf-atlas-gen) — the C++
*atlas* companion to msdfgen (note: our zappar generator wraps msdfgen, **not**
atlas-gen) — has a uniform-grid mode:

- `-uniformgrid` — lay glyphs out in a uniform grid
- `-uniformcols <N>` — fixed column count
- `-uniformcell <w> <h>` — fixed cell dimensions
- `-uniformcellconstraint`, `-uniformorigin` — cell sizing / placement tuning

Generate **all 6 weights with identical** `-uniformcols`, `-uniformcell`, `-pxrange`,
`-size` and the **same charset string**. Glyph *i* then occupies the same cell in all
6 atlases. Tradeoff: offline/CLI generation instead of in-browser.

### Option B — repack ourselves (tool-independent)

Keep the existing `src/generateMSDF.js` pipeline and add a post-process repack:

1. Generate each weight's atlas as now.
2. Composite each glyph into a **fixed cell** on a canvas, cell index = charset index,
   centered.
3. Rewrite each `font.json`'s `chars[i].x/y/width/height` to the fixed cell rect
   (identical numbers across all weights).

Byte-identical UV layout because *we* control placement — maximum determinism, no
dependency on packer behaviour. More code, stays in-browser.

### Option C — `msdf-bmfont-xml`

Tight packer, no shared-layout option. Not worth switching to for this.

### Important: packing ≠ layout

Identical packing solves the **texture/UV side only**. Advances and metrics still
differ per weight, so the per-character *spacing* problem (Rule 3 / requirement 4 —
the prefix-sum of advances) is untouched. Uniform packing lets us collapse 6 atlases
→ 1 array texture and delete `uv2`; it does **not** by itself give per-character
spacing.

**Recommendation:** Option A if we move atlas generation offline (cleanest, least
code, battle-tested); Option B if everything must stay in the in-browser pipeline.

Sources: [msdf-atlas-gen README](https://github.com/Chlumsky/msdf-atlas-gen/blob/master/README.md),
[main.cpp flag definitions](https://github.com/Chlumsky/msdf-atlas-gen/blob/master/msdf-atlas-gen/main.cpp).

---

## Status / next steps

- [x] Demo scene loads 6 Oswald weights + atlases (`demo/scenes/Variable/`)
- [x] Distance-mix fragment shader (Rule 1)
- [x] Per-weight UV + position attributes, pair-swap architecture (approach C)
- [x] Global weight slider (200–700) in tweakpane
- [x] Verify `msdf-generator` can emit identically-packed atlases → **no**, no layout
      control; use `msdf-atlas-gen -uniformgrid` (offline) or repack ourselves
      (see "Identical packing across weights")
- [ ] Produce uniform-grid atlases for all 6 weights (Option A or B)
- [ ] Pack the 6 atlases into a `DataArrayTexture`
- [ ] Replace `uWeight` uniform with a per-glyph `weight` attribute
- [ ] Decide layout strategy (fixed metrics vs CPU re-layout vs GPU advances)
- [ ] Per-char weight demo (e.g. wave of weight across letters via `letterIndex`)
