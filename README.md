# Three MSDF Text

Utility classes for Text rendering in Three.js using Bitmap fonts and MSDF (multi-channel signed distance fields).

Forked from [three-bmfont-text](https://github.com/Jam3/three-bmfont-text).

**It includes :**

-   Refacto to ES6
-   Remove some small old dependencies
-   Replace some deprecated three.js code
-   Add more geometry attributes : layout uv, letter center positions, letter index, line index, letter index by line, word index, word index by line...
-   Compatibility check with [Three.js FontLoader](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/FontLoader.js)
-   More to come...

## Demo

-   [Basic](https://leochocolat.github.io/three-msdf-text-utils/demo/?demo=basic)
-   [Stroke](https://leochocolat.github.io/three-msdf-text-utils/demo/?demo=stroke)
-   [Editor](https://leochocolat.github.io/three-msdf-text-utils/demo/?demo=editor)
-   [Reveal](https://leochocolat.github.io/three-msdf-text-utils/demo/?demo=reveal)
-   More to come...

## Bitmap Font and Font Atlas

To get this working you will need some specific files, you can generate them with [msdf-bmfont-xml](https://github.com/soimy/msdf-bmfont-xml) or with the [online tool](https://msdf-bmfont.donmccurdy.com/).
You can also check my [msdf-font-factory](https://github.com/leochocolat/msdf-font-factory) it already includes some files that you can use and a script to generate your files easily.

## Installation

```bash
npm install three-msdf-text-utils
```

## Usage

```js
import { MSDFTextGeometry, MSDFTextMaterial } from "three-msdf-text-utils";
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import * as THREE from 'three';

Promise.all([
    loadFontAtlas("./fonts/roboto/roboto-regular.png"),
    loadFont("./fonts/roboto/roboto-regular.fnt"),
]).then(([atlas, font]) => {
    const geometry = new MSDFTextGeometry({
        text: "Hello World",
        font: font.data,
    });

    const material = new MSDFTextMaterial();
    material.uniforms.uMap.value = atlas;

    const mesh = new THREE.Mesh(geometry, material);
});

function loadFontAtlas(path) {
    const promise = new Promise((resolve, reject) => {
        const loader = new THREE.TextureLoader();
        loader.load(path, resolve);
    });

    return promise;
}

function loadFont(path) {
    const promise = new Promise((resolve, reject) => {
        const loader = new FontLoader();
        loader.load(path, resolve);
    });

    return promise;
}
```

## References

### MSDFTextGeometry

```js
const geometry = new MSDFTextGeometry(options);
```

**Options can be an object, or a String – equivalent to { text: str }.**

#### Options specific to ThreeJS:

-   `flipY` (boolean): whether the texture will be Y-flipped (default true)
-   `multipage` (boolean): whether to construct this geometry with an extra buffer containing page IDs. This is necessary for multi-texture fonts (default false)

#### Other options

-   `font` (required) the BMFont definition which holds chars, kernings, etc
-   `text` (string) the text to layout. Newline characters (\n) will cause line breaks
-   `width` (number, optional) the desired width of the text box, causes word-wrapping and clipping in "pre" mode. Leave as undefined to remove
-   `word-wrapping` (default behaviour)
-   `mode` (string) a mode for word-wrapper; can be 'pre' (maintain spacing), or 'nowrap' (collapse whitespace but only break on newline characters), otherwise assumes normal word-wrap behaviour (collapse whitespace, break at width or newlines)
-   `align` (string) can be "left", "center" or "right" (default: left)
-   `letterSpacing` (number) the letter spacing in pixels (default: 0)
-   `lineHeight` (number) the line height in pixels (default to font.common.lineHeight)
-   `tabSize` (number) the number of spaces to use in a single tab (default 4)
-   `start` (number) the starting index into the text to layout (default 0)
-   `end` (number) the ending index (exclusive) into the text to layout (default text.length)

#### Methods

-   `update(options)`

Re-builds the geometry using the given options. Any options not specified here will default to those set in the constructor.
This method will recompute the text layout and rebuild the WebGL buffers.
Options can be an object, or a String – equivalent to { text: str }.

#### Properties

-   `layout`

Text Layout instance, you can use it to access layout attributes such as :
> width, height, descender, ascender, xHeight, baseline, capHeight, lineHeight, linesTotal, lettersTotal

-   `visibleGlyphs`

A filtered set from `geometry.layout.glyphs` intended to align with the vertex data being used by the underlying BufferAttributes.

This is an array of `{ line, position, index, data }` objects, [see here](https://github.com/Jam3/layout-bmfont-text#layoutglyphs). For example, this could be used to add a new BufferAttribute for `line` offset.

### MSDFTextMaterial

It extends from [Three.js ShaderMaterial](https://threejs.org/docs/#api/en/materials/ShaderMaterial)

You can use it just by setting the atlas texture from your font :

```js
const material = new MSDFTextMaterial(options);
material.uniforms.uMap.value = atlas;
```

#### Initial Properties

```js
const defaultOptions = {
    side: THREE.FrontSide,
    transparent: true,
    defines: {
        IS_SMALL: false,
    },
    extensions: {
        derivatives: true,
    },
    uniforms: {
        // Common
        uOpacity: { value: 1 },
        uColor: { value: new Color("#ffffff") },
        uMap: { value: null },
        // Rendering
        uThreshold: { value: 0.05 },
        uAlphaTest: { value: 0.01 },
        // Strokes
        uStrokeColor: { value: new Color("#ff0000") },
        uStrokeOutsetWidth: { value: 0.0 },
        uStrokeInsetWidth: { value: 0.3 },
    },
    vertexShader,
    fragmentShader,
};
```

**Note: `IS_SMALL` boolean is useful to render small fonts, it will switch the alpha rendering calculation to make them visually much smoother**

#### Custom material

If you want to make some specific text effects you can create your own glsl code in your shader material based on the MSDFTextMaterial shader.

```js
import { uniforms } from "three-msdf-text-utils";
import * as THREE from 'three';

const material = new THREE.ShaderMaterial({
    side: DoubleSide,
    transparent: true,
    defines: {
        IS_SMALL: false,
    },
    extensions: {
        derivatives: true,
    },
    uniforms: {
        // Common
        ...uniforms.common,
        
        // Rendering
        ...uniforms.rendering,
        
        // Strokes
        ...uniforms.strokes,
    },
    vertexShader: `
        // Attribute
        attribute vec2 layoutUv;

        attribute float lineIndex;

        attribute float lineLettersTotal;
        attribute float lineLetterIndex;

        attribute float lineWordsTotal;
        attribute float lineWordIndex;

        attribute float wordIndex;

        attribute float letterIndex;

        // Varyings
        varying vec2 vUv;
        varying vec2 vLayoutUv;
        varying vec3 vViewPosition;
        varying vec3 vNormal;

        varying float vLineIndex;

        varying float vLineLettersTotal;
        varying float vLineLetterIndex;

        varying float vLineWordsTotal;
        varying float vLineWordIndex;

        varying float vWordIndex;

        varying float vLetterIndex;

        void main() {
            // Output
            vec4 mvPosition = vec4(position, 1.0);
            mvPosition = modelViewMatrix * mvPosition;
            gl_Position = projectionMatrix * mvPosition;

            // Varyings
            vUv = uv;
            vLayoutUv = layoutUv;
            vViewPosition = -mvPosition.xyz;
            vNormal = normal;

            vLineIndex = lineIndex;

            vLineLettersTotal = lineLettersTotal;
            vLineLetterIndex = lineLetterIndex;

            vLineWordsTotal = lineWordsTotal;
            vLineWordIndex = lineWordIndex;

            vWordIndex = wordIndex;

            vLetterIndex = letterIndex;
        }
    `,
    fragmentShader: `
        // Varyings
        varying vec2 vUv;

        // Uniforms: Common
        uniform float uOpacity;
        uniform float uThreshold;
        uniform float uAlphaTest;
        uniform vec3 uColor;
        uniform sampler2D uMap;

        // Uniforms: Strokes
        uniform vec3 uStrokeColor;
        uniform float uStrokeOutsetWidth;
        uniform float uStrokeInsetWidth;

        // Utils: Median
        float median(float r, float g, float b) {
            return max(min(r, g), min(max(r, g), b));
        }

        void main() {
            // Common
            // Texture sample
            vec3 s = texture2D(uMap, vUv).rgb;

            // Signed distance
            float sigDist = median(s.r, s.g, s.b) - 0.5;

            float afwidth = 1.4142135623730951 / 2.0;

            #ifdef IS_SMALL
                float alpha = smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDist);
            #else
                float alpha = clamp(sigDist / fwidth(sigDist) + 0.5, 0.0, 1.0);
            #endif

            // Strokes
            // Outset
            float sigDistOutset = sigDist + uStrokeOutsetWidth * 0.5;

            // Inset
            float sigDistInset = sigDist - uStrokeInsetWidth * 0.5;

            #ifdef IS_SMALL
                float outset = smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDistOutset);
                float inset = 1.0 - smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDistInset);
            #else
                float outset = clamp(sigDistOutset / fwidth(sigDistOutset) + 0.5, 0.0, 1.0);
                float inset = 1.0 - clamp(sigDistInset / fwidth(sigDistInset) + 0.5, 0.0, 1.0);
            #endif

            // Border
            float border = outset * inset;

            // Alpha Test
            if (alpha < uAlphaTest) discard;

            // Output: Common
            vec4 filledFragColor = vec4(uColor, uOpacity * alpha);

            // Output: Strokes
            vec4 strokedFragColor = vec4(uStrokeColor, uOpacity * border);

            gl_FragColor = filledFragColor;
        }
    `,
});
material.uniforms.uMap.value = atlas;
```

## Dependencies

-   [quad-indices](https://www.npmjs.com/package/quad-indices)
-   [word-wrapper](https://www.npmjs.com/package/word-wrapper)
-   [three.js](https://www.npmjs.com/package/three) (peer dependency)

## Development

```bash
npm install
```

```bash
npm run dev
```

## Roadmap

-   More examples
-   More docs for custom shader material
-   Manage versions
-   NPM Publish workflow
