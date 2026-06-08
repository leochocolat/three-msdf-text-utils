// THREE
import { Scene, WebGLRenderer, PerspectiveCamera, TextureLoader, Mesh, DoubleSide, ShaderMaterial } from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Vendor
import { Pane } from 'tweakpane';

// Lib
import { MSDFTextGeometry, uniforms } from '../../../src/index';

// Shaders
import vertex from './shaders/vertex.glsl';
import fragment from './shaders/fragment.glsl';

// Config
import config from './config';

const map = (value, inMin, inMax, outMin, outMax) => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// Weight instances, thinnest → boldest. Order matters: adjacent entries are
// the pairs the GPU interpolates between. `weight` is the CSS-like numeric
// weight used by the UI and the text-length mapping.
const FONT_DIR = './fonts/oswald';
const FONT_WEIGHTS = [
    { name: 'extra-light', weight: 200 },
    { name: 'light', weight: 300 },
    { name: 'regular', weight: 400 },
    { name: 'medium', weight: 500 },
    { name: 'semi-bold', weight: 600 },
    { name: 'bold', weight: 700 },
];

const MIN_WEIGHT = FONT_WEIGHTS[0].weight; // thinnest
const MAX_WEIGHT = FONT_WEIGHTS[FONT_WEIGHTS.length - 1].weight; // boldest

export default class Variable {
    constructor() {
        this.canvas = document.querySelector('.js-canvas');
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.controls = null;
        this.debugger = new Pane({ title: `${config.name} Example` });
    }

    start() {
        this._fonts = [];

        this.setupEventListeners();
        this.setup();
        this.setupText();
        this.update();
    }

    setup() {
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.z = 1000;

        this.scene = new Scene();

        this.renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    setupText() {
        this.loadFonts().then((responses) => {
            this.parseFonts(responses);
            this.createMesh();
            this.setupDebug();

            // Weight is derived from the text length, sync it on first load
            this.updateText();
        });
    }

    /**
     * Loading
     */
    loadFonts() {
        const promises = [];

        FONT_WEIGHTS.forEach(({ name }) => {
            promises.push(this.loadFontAtlas(`${FONT_DIR}/${name}/atlas.png`));
            promises.push(this.loadFont(`${FONT_DIR}/${name}/font.json`));
        });

        return Promise.all(promises);
    }

    parseFonts(responses) {
        // Responses are interleaved [atlas, font, atlas, font, ...]
        this.atlases = [];

        for (let i = 0; i < responses.length; i += 2) {
            this.atlases.push(responses[i]);
            this._fonts.push(responses[i + 1]);
        }
    }

    /**
     * Mesh
     */
    createMesh() {
        this.geometry = this.createGeometry();
        this.material = this.createMaterial();

        this._segment = -1;
        this.updateWeight(config.settings.weight);

        const mesh = new Mesh(this.geometry, this.material);
        mesh.rotation.x = Math.PI;

        const scale = config.settings.scale || 3;
        mesh.position.x = -this.geometry.layout.width / 2 * scale;
        mesh.position.y = -this.geometry.layout.height / 2 * scale;
        mesh.scale.set(scale, scale, scale);

        this.scene.add(mesh);
        this.mesh = mesh;
    }

    createGeometry() {
        const geometry = new MSDFTextGeometry({
            font: this._fonts[0].data,
            ...config.textObject,
        });

        this.setupVariableAttributes(geometry);

        return geometry;
    }

    createMaterial() {
        return new ShaderMaterial({
            side: DoubleSide,
            transparent: true,
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

                // Variable weight: two adjacent weights, GPU mixes between them
                uMap1: { value: this.atlases[0] },
                uMap2: { value: this.atlases[1] },
                uWeight: { value: 0 },
            },
            vertexShader: vertex,
            fragmentShader: fragment,
        });
    }

    /**
     * Debug
     */
    setupDebug() {
        const textBinding = this.debugger.addBinding(config.textObject, 'text', { title: 'Text' }).on('change', () => { this.updateText(); });

        textBinding.element.querySelector('input').addEventListener('input', (e) => {
            config.textObject.text = e.target.value;
            this.updateText();
        });

        this.debugger.addBinding(config.textObject, 'letterSpacing', { title: 'Letter Spacing' }).on('change', () => { this.updateText(); });

        const debugFolderCommon = this.debugger.addFolder({ title: 'Common' });
        debugFolderCommon.addBinding(this.material.uniforms.uOpacity, 'value', { label: 'Opacity', min: 0, max: 1 });
        debugFolderCommon.addBinding(config.settings, 'color', { label: 'Color' }).on('change', () => { this.material.uniforms.uColor.value.set(config.settings.color); });

        const debugFolderRendering = this.debugger.addFolder({ title: 'Rendering' });
        debugFolderRendering.addBinding(this.material.uniforms.uAlphaTest, 'value', { label: 'Alpha test', min: 0, max: 1 });

        const debugFolderVariable = this.debugger.addFolder({ title: 'Variable' });
        this._weightBinding = debugFolderVariable.addBinding(config.settings, 'weight', { label: 'Weight', min: MIN_WEIGHT, max: MAX_WEIGHT, step: 1, readonly: true });
    }

    setupVariableAttributes(geometry) {
        // Precompute position/uv attributes for each weight.
        // Glyph packing and metrics differ per weight, so each weight
        // needs its own positions (quads) and uvs (atlas rects).
        this.positionAttributes = [];
        this.uvAttributes = [];

        this._fonts.forEach((font, index) => {
            const weightGeometry = index === 0 ? geometry : new MSDFTextGeometry({
                font: font.data,
                ...config.textObject
            });

            this.positionAttributes.push(weightGeometry.getAttribute('position'));
            this.uvAttributes.push(weightGeometry.getAttribute('uv'));

            // All weights must produce the same glyphs in the same order
            if (weightGeometry.getAttribute('position').count !== geometry.getAttribute('position').count) {
                console.warn(`Variable: vertex count mismatch for weight ${index}, layouts must line-break identically across weights`);
            }
        });
    }

    updateText() {
        this.geometry.update({
            ...config.textObject
        });

        this.setupVariableAttributes(this.geometry);

        // The text rebuild invalidates every bound buffer (position/uv/
        // position2/uv2) and the geometry now holds weight[0] positions.
        // Force updateWeight to rebind from the fresh attributes even when
        // the weight (and therefore the segment) hasn't changed.
        this._segment = -1;

        // Map text length to weight: the more characters, the thinner the text
        config.settings.weight = this.weightFromTextLength(config.textObject.text.length);
        this._weightBinding.refresh();

        this.updateWeight(config.settings.weight);
    }

    /**
     * Map a character count to a weight, longer strings → thinner.
     * SHORT_LENGTH and below render at the boldest weight, LONG_LENGTH and
     * above at the thinnest, linearly interpolated in between.
     */
    weightFromTextLength(length) {
        const SHORT_LENGTH = 1;
        const LONG_LENGTH = 10;

        const mappedWeight = map(length, SHORT_LENGTH, LONG_LENGTH, MAX_WEIGHT, MIN_WEIGHT);

        return Math.min(Math.max(mappedWeight, MIN_WEIGHT), MAX_WEIGHT);
    }

    /**
     * weight: CSS-like font weight, 200 (extra-light) → 700 (bold).
     * The CPU picks the two adjacent weight atlases and binds their
     * attributes; the GPU interpolates between them with uWeight.
     */
    updateWeight(weight) {
        const clamped = Math.min(Math.max(weight, MIN_WEIGHT), MAX_WEIGHT);

        // Find the segment [i, i + 1] whose weight range contains `weight`
        let segment = 0;
        while (segment < FONT_WEIGHTS.length - 2 && clamped > FONT_WEIGHTS[segment + 1].weight) {
            segment++;
        }

        // Local blend factor within the segment (handles non-uniform spacing)
        const lower = FONT_WEIGHTS[segment].weight;
        const upper = FONT_WEIGHTS[segment + 1].weight;
        this.material.uniforms.uWeight.value = map(clamped, lower, upper, 0, 1);

        // Swap buffers only when crossing into another weight segment
        if (segment !== this._segment) {
            this._segment = segment;

            this.material.uniforms.uMap1.value = this.atlases[segment];
            this.material.uniforms.uMap2.value = this.atlases[segment + 1];

            this.geometry.setAttribute('position', this.positionAttributes[segment]);
            this.geometry.setAttribute('uv', this.uvAttributes[segment]);
            this.geometry.setAttribute('position2', this.positionAttributes[segment + 1]);
            this.geometry.setAttribute('uv2', this.uvAttributes[segment + 1]);
        }
    }

    loadFontAtlas(path) {
        const promise = new Promise((resolve, reject) => {
            const loader = new TextureLoader();
            loader.load(path, resolve);
        });

        return promise;
    }

    loadFont(path) {
        const promise = new Promise((resolve, reject) => {
            const loader = new FontLoader();
            loader.load(path, resolve);
        });

        return promise;
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    update() {
        this.render();

        requestAnimationFrame(this.update.bind(this));
    }

    setupEventListeners() {
        window.addEventListener('resize', this.resizeHandler.bind(this));
    }

    resizeHandler() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
