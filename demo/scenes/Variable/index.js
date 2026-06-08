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
        const promises = [
            // Extra Light
            this.loadFontAtlas('./fonts/oswald/extra-light/atlas.png'),
            this.loadFont('./fonts/oswald/extra-light/font.json'),
            // Light
            this.loadFontAtlas('./fonts/oswald/light/atlas.png'),
            this.loadFont('./fonts/oswald/light/font.json'),
            // Regular
            this.loadFontAtlas('./fonts/oswald/regular/atlas.png'),
            this.loadFont('./fonts/oswald/regular/font.json'),
            // Medium
            this.loadFontAtlas('./fonts/oswald/medium/atlas.png'),
            this.loadFont('./fonts/oswald/medium/font.json'),
            // Semi-bold
            this.loadFontAtlas('./fonts/oswald/semi-bold/atlas.png'),
            this.loadFont('./fonts/oswald/semi-bold/font.json'),
            // Bold
            this.loadFontAtlas('./fonts/oswald/bold/atlas.png'),
            this.loadFont('./fonts/oswald/bold/font.json'),
        ];

        Promise.all(promises).then((responses) => {
            const atlases = [];

            for (let i = 0; i < responses.length; i+=2) {
                const atlas = responses[i];
                const font = responses[i + 1];
                atlases.push(atlas);
                this._fonts.push(font);
            }

            this.atlases = atlases;

            const geometry = new MSDFTextGeometry({
                font: this._fonts[0].data,
                ...config.textObject,
            });

            this.setupVariableAttributes(geometry);

            const material = new ShaderMaterial({
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
                    uMap1: { value: atlases[0] },
                    uMap2: { value: atlases[1] },
                    uWeight: { value: 0 },
                },
                vertexShader: vertex,
                fragmentShader: fragment,
            });

            this.geometry = geometry;
            this.material = material;
            this._segment = -1;
            this.updateWeight(config.settings.weight);

            const mesh = new Mesh(geometry, material);
            mesh.rotation.x = Math.PI;
            const scale = config.settings.scale || 3;
            mesh.position.x = -geometry.layout.width / 2 * scale;
            mesh.position.y = -geometry.layout.height / 2 * scale;
            mesh.scale.set(scale, scale, scale);
            this.scene.add(mesh);

            // Debug
            const textBinding = this.debugger.addBinding(config.textObject, 'text', { title: 'Text' }).on('change', () => { this.updateText(); });
            
            textBinding.element.querySelector('input').addEventListener('input', (e) => {
                config.textObject.text = e.target.value;
                this.updateText();
            });
            
            this.debugger.addBinding(config.textObject, 'letterSpacing', { title: 'Letter Spacing' }).on('change', () => { this.updateText(); });

            const debugFolderCommon = this.debugger.addFolder({ title: 'Common' });
            debugFolderCommon.addBinding(material.uniforms.uOpacity, 'value', { label: 'Opacity', min: 0, max: 1 });
            debugFolderCommon.addBinding(config.settings, 'color', { label: 'Color' }).on('change', () => { material.uniforms.uColor.value.set(config.settings.color); });

            const debugFolderRendering = this.debugger.addFolder({ title: 'Rendering' });
            debugFolderRendering.addBinding(material.uniforms.uAlphaTest, 'value', { label: 'Alpha test', min: 0, max: 1 });

            const debugFolderVariable = this.debugger.addFolder({ title: 'Variable' });
            this._weightBinding = debugFolderVariable.addBinding(config.settings, 'weight', { label: 'Weight', min: 200, max: 700, step: 1, readonly: true });

            // Weight is derived from the text length, sync it on first load
            this.updateText();
        });
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
        const MIN_WEIGHT = 200; // thinnest (extra-light)
        const MAX_WEIGHT = 700; // boldest (bold)

        let mappedWeight = map(length, SHORT_LENGTH, LONG_LENGTH, MAX_WEIGHT, MIN_WEIGHT);;
        mappedWeight = Math.min(mappedWeight, MAX_WEIGHT);
        mappedWeight = Math.max(mappedWeight, MIN_WEIGHT);

        return mappedWeight;
    }

    /**
     * weight: CSS-like font weight, 200 (extra-light) → 700 (bold).
     * The CPU picks the two adjacent weight atlases and binds their
     * attributes; the GPU interpolates between them with uWeight.
     */
    updateWeight(weight) {
        const t = (weight - 200) / 100;
        const segment = Math.min(Math.floor(t), this.atlases.length - 2);

        this.material.uniforms.uWeight.value = t - segment;

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
