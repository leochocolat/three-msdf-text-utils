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

-   [Basic](https://leochocolat.github.io/three-msdf-text/demo/)
-   More to come...

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

-   Better dependencies management
-   More documentation
-   More examples
-   Manage versions
