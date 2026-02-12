// THREE
import { Scene, WebGLRenderer, PerspectiveCamera, Mesh, DoubleSide } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Vendor
import { Pane } from 'tweakpane';

// Lib
import { MSDFTextGeometry, MSDFTextMaterial, generateMSDF } from '../../../src/index';

// Config
import config from './config';

export default class MSDFGenerator {
    constructor() {
        this.canvas = document.querySelector('.js-canvas');
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.controls = null;
        this.debugger = new Pane({ title: `${config.name} Example` });
    }

    start() {
        config.fontState = 'Generating: 0%';

        generateMSDF(config.fontUrl, {
            workerUrl: 'https://leochocolat.github.io/three-msdf-text-utils/demo/msdfgen/worker.bundled.js',
            wasmUrl: 'https://leochocolat.github.io/three-msdf-text-utils/demo/msdfgen/msdfgen_wasm.wasm',
            onProgress: (progress) => { config.fontState = `Generating: ${progress}%`; }
        }).then(({ font, atlas }) => {
            this.font = font;
            this.atlas = atlas;
            this.setupEventListeners();
            this.setup();
            this.setupText();
            this.setupDebugger();
            this.update();

            config.fontState = `Generation completed.`;
        }).catch((error) => {
            config.fontState = error;
        });
    }

    loadResources() {
        const promises = [
            this.loadFontAtlas('./fonts/roboto/roboto-regular.png'),
            this.loadFont('./fonts/roboto/roboto-regular.fnt'),
        ];

        return Promise.all(promises);
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
        this.geometry = new MSDFTextGeometry({
            text: config.text,
            font: this.font.data,
            ...config.properties,
        });

        this.material = new MSDFTextMaterial();
        this.material.uniforms.uMap.value = this.atlas;
        this.material.side = DoubleSide;

        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.rotation.x = Math.PI;
        this.mesh.position.x = -this.geometry.layout.width / 2 * config.settings.scale;
        this.mesh.scale.set(config.settings.scale, config.settings.scale, config.settings.scale);
        this.scene.add(this.mesh);
    }

    setupDebugger() {
        this.debugger.addBinding(config, 'text', { title: 'Text' }).on('change', () => { this.updateText(); });
        this.debugger.addBinding(config.settings, 'scale', { title: 'Scale' }).on('change', () => { this.updateText(); });
        
        
        // Font
        const debugFolderFont = this.debugger.addFolder({ title: 'Font' });
        const fontOptions = config.fontOptions.map((item) => { return { text: `${item.split('/')[2]}-${item.split('/')[3]}`, value: item } });
        const userFont = { url: 'Paste your ttf url' };

        debugFolderFont.addBinding(config, 'fontUrl', { options: fontOptions, label: 'Choose font' }).on('change', () => { this.updateFont(); });

        debugFolderFont.addBinding(userFont, 'url', { label: 'Your font' }).on('change', () => {
            config.fontUrl = userFont.url;
            this.updateFont();
        });

        debugFolderFont.addBinding(config, 'fontState', { label: 'Status', readonly: true, rows: 3 });

        // Properties
        const debugFolderProperties = this.debugger.addFolder({ title: 'Properties' });
        debugFolderProperties.addBinding(config.properties, 'width').on('change', () => { this.updateText(); });
        debugFolderProperties.addBinding(config.properties, 'align', { options: { left: 'left', center: 'center', right: 'right' } }).on('change', () => { this.updateText(); });
        debugFolderProperties.addBinding(config.properties, 'letterSpacing', { label: 'letter spacing' }).on('change', () => { this.updateText(); });
        debugFolderProperties.addBinding(config.properties, 'lineHeight', { label: 'line height' }).on('change', () => { this.updateText(); });

        // Material
        const debugFolderMaterial = this.debugger.addFolder({ title: 'Material' });

        const debugFolderCommon = debugFolderMaterial.addFolder({ title: 'Common' });
        debugFolderCommon.addBinding(this.material.uniforms.uOpacity, 'value', { label: 'Opacity', min: 0, max: 1 });
        debugFolderCommon.addBinding(config.settings, 'color', { label: 'Color' }).on('change', () => { this.material.uniforms.uColor.value.set(config.settings.color); });

        const debugFolderRendering = debugFolderMaterial.addFolder({ title: 'Rendering' });
        debugFolderRendering.addBinding(this.material.defines, 'IS_SMALL', { label: 'Is small' }).on('change', () => { this.material.needsUpdate = true; });
        debugFolderRendering.addBinding(this.material.uniforms.uAlphaTest, 'value', { label: 'Alpha test', min: 0, max: 1 });
        debugFolderRendering.addBinding(this.material.uniforms.uThreshold, 'value', { label: 'Threshold (IS_SMALL)', min: 0, max: 1 });
    }

    updateText() {
        this.geometry.update({
            text: config.text,
            ...config.properties,
        });

        this.mesh.position.x = -this.geometry.layout.width / 2 * config.settings.scale;
        this.mesh.scale.set(config.settings.scale, config.settings.scale, config.settings.scale);
    }

    updateFont() {
        config.fontState = 'Generating: 0%';
        
        generateMSDF(config.fontUrl, {
            workerUrl: 'http://0.0.0.0:3003/msdfgen/worker.bundled.js',
            wasmUrl: 'http://0.0.0.0:3003/msdfgen/msdfgen_wasm.wasm',
            onProgress: (progress) => { config.fontState = `Generating: ${progress}%`; }
        }).then(({ font, atlas }) => {
            this.font = font;
            this.atlas = atlas;
            
            // Update geometry
            this.geometry.update({ font: this.font.data });

            // Update atlas from material
            this.material.uniforms.uMap.value.dispose();
            this.material.uniforms.uMap.value = this.atlas;

            // Correct position based on layout
            this.mesh.position.x = -this.geometry.layout.width / 2 * config.settings.scale;

            config.fontState = `Generation completed.`;
        }).catch((error) => {
            config.fontState = error;
        });
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
