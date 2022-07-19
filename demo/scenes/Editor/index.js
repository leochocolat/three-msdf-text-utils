// THREE
import { Scene, WebGLRenderer, PerspectiveCamera, TextureLoader, Mesh, DoubleSide } from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Vendor
import { Pane } from 'tweakpane';

// Lib
import { MSDFTextGeometry, MSDFTextMaterial } from '../../../src/index';

// Config
import config from './config';

export default class Editor {
    constructor() {
        this.canvas = document.querySelector('.js-canvas');
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.controls = null;
        this.debugger = new Pane({ title: `${config.name} Example` });
    }

    start() {
        this.loadResources().then(([atlas, font]) => {
            this.font = font;
            this.atlas = atlas;
            this.setupEventListeners();
            this.setup();
            this.setupText();
            this.setupDebugger();
            this.update();
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
        this.debugger.addInput(config, 'text', { title: 'Text' }).on('change', () => { this.updateText(); });
        this.debugger.addInput(config.settings, 'scale', { title: 'Scale' }).on('change', () => { this.updateText(); });

        // Properties
        const debugFolderProperties = this.debugger.addFolder({ title: 'Properties' });
        debugFolderProperties.addInput(config.properties, 'width').on('change', () => { this.updateText(); });
        debugFolderProperties.addInput(config.properties, 'align', { options: { left: 'left', center: 'center', right: 'right' } }).on('change', () => { this.updateText(); });
        debugFolderProperties.addInput(config.properties, 'letterSpacing', { label: 'letter spacing' }).on('change', () => { this.updateText(); });
        debugFolderProperties.addInput(config.properties, 'lineHeight', { label: 'line height' }).on('change', () => { this.updateText(); });

        // Material
        const debugFolderMaterial = this.debugger.addFolder({ title: 'Material' });

        const debugFolderCommon = debugFolderMaterial.addFolder({ title: 'Common' });
        debugFolderCommon.addInput(this.material.uniforms.uOpacity, 'value', { label: 'Opacity', min: 0, max: 1 });
        debugFolderCommon.addInput(config.settings, 'color', { label: 'Color' }).on('change', () => { this.material.uniforms.uColor.value.set(config.settings.color); });

        const debugFolderRendering = debugFolderMaterial.addFolder({ title: 'Rendering' });
        debugFolderRendering.addInput(this.material.defines, 'IS_SMALL', { label: 'Is small' }).on('change', () => { this.material.needsUpdate = true; });
        debugFolderRendering.addInput(this.material.uniforms.uAlphaTest, 'value', { label: 'Alpha test', min: 0, max: 1 });
        debugFolderRendering.addInput(this.material.uniforms.uThreshold, 'value', { label: 'Threshold (IS_SMALL)', min: 0, max: 1 });
    }

    updateText() {
        this.geometry.update({
            text: config.text,
            ...config.properties,
        });

        this.mesh.position.x = -this.geometry.layout.width / 2 * config.settings.scale;
        this.mesh.scale.set(config.settings.scale, config.settings.scale, config.settings.scale);
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
