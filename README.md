# Three MSDF Text

Utility classes for Text rendering in Three.js using Bitmap fonts and MSDF (multi-channel signed distance fields).

Forked from [three-bmfont-text](https://github.com/Jam3/three-bmfont-text).

**It includes :**

-   Refacto to ES6
-   Remove some small old dependencies
-   Replace some deprecated three.js code
-   Add more geometry attributes : letter center positions, letters index, line index, letters index by line, word index, Text block UV.
-   Check compatibility with [Three.js FontLoader](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/FontLoader.js)
-   More to come...

## Demo

-   [Basic](https://leochocolat.github.io/three-msdf-text/demo/?demo=basic)
-   [Stroke](https://leochocolat.github.io/three-msdf-text/demo/?demo=stroke)
-   [Editor](https://leochocolat.github.io/three-msdf-text/demo/?demo=editor)
-   More to come...

## Bitmap Font and Font Atlas

To get this working you will need some specific files, you can generate them with (msdf-bmfont-xml)[https://github.com/soimy/msdf-bmfont-xml] or with the (online tool)[https://msdf-bmfont.donmccurdy.com/].
You can also check my (msdf-font-factory)[https://github.com/leochocolat/msdf-font-factory] it already includes some files that you can use and a script to generate your files easily.

## Installation

```bash
npm install github:leochocolat/three-msdf-text
```

## Usage

```js
import { MSDFTextGeometry, MSDFTextMaterial } from "three-msdf-text";

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

    const mesh = new Mesh(geometry, material);
});

function loadFontAtlas(path) {
    const promise = new Promise((resolve, reject) => {
        const loader = new TextureLoader();
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
    side: FrontSide,
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

You can create your own custom material with your shaders by using shader chunks and some uniforms :

```js
import { uniforms } from "three-msdf-text";

const material = new ShaderMaterial({
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
        #include <three_msdf_attributes>

        // Varyings
        #include <three_msdf_varyings>

        void main() {
            #include <three_msdf_vertex>
        }
    `,
    fragmentShader: `
        // Varyings
        #include <three_msdf_varyings>

        // Uniforms
        #include <three_msdf_common_uniforms>
        #include <three_msdf_strokes_uniforms>

        // Utils
        #include <three_msdf_median>

        void main() {
            // Common
            #include <three_msdf_common>

            // Strokes
            #include <three_msdf_strokes>

            // Alpha Test
            #include <three_msdf_alpha_test>

            // Outputs
            #include <three_msdf_strokes_output>
        }
    `,
});
material.uniforms.uMap.value = atlas;
```

## Dependencies

-   [quad-indices](https://www.npmjs.com/package/quad-indices)
-   [word-wrapper](https://www.npmjs.com/package/word-wrapper)

### Peer Dependencies

-   [three.js](https://www.npmjs.com/package/three)

## Development

```bash
npm install
```

```bash
npm run dev
```

## Roadmap

-   More examples
-   Manage versions
