// THREE WEBGPU
import { WebGPURenderer } from 'three/webgpu';

// THREE
import { Scene, PerspectiveCamera, TextureLoader, Mesh, DoubleSide, Color } from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Vendor
import { Pane } from 'tweakpane';

// Lib
import { MSDFTextGeometry, MSDFTextNodeMaterial } from '../../../src/index';

// Config
import config from './config';

export default class WebGPU {
    constructor() {
        this.canvas = document.querySelector('.js-canvas');
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.controls = null;
        this.debugger = new Pane({ title: `${config.name} Example` });
    }

    start() {
        this.setupEventListeners();
        this.setup();
        this.setupText();
        this.update();
    }

    setup() {
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.z = 1000;

        this.scene = new Scene();
        this.scene.background = new Color('black');

        this.renderer = new WebGPURenderer({ antialias: true, canvas: this.canvas });
        this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    setupText() {
        const promises = [
            this.loadFontAtlas('./fonts/roboto/roboto-regular.png'),
            this.loadFont('./fonts/roboto/roboto-regular.fnt'),
        ];

        Promise.all(promises).then(([atlas, font]) => {
            const geometry = new MSDFTextGeometry({
                text: config.text,
                font: font.data,
                width: 1000,
                align: 'center',
            });

            const material = new MSDFTextNodeMaterial({ map: atlas });
            material.side = DoubleSide;

            const mesh = new Mesh(geometry, material);
            mesh.rotation.x = Math.PI;
            const scale = 3;
            mesh.position.x = -geometry.layout.width / 2 * scale;
            mesh.scale.set(scale, scale, scale);
            this.scene.add(mesh);

            // Debug
            const debugFolderCommon = this.debugger.addFolder({ title: 'Common' });
            debugFolderCommon.addInput(material.opacity, 'value', { label: 'Opacity', min: 0, max: 1 });
            debugFolderCommon.addInput(config.settings, 'color', { label: 'Color' }).on('change', () => { material.color.value.set(config.settings.color); });

            const debugFolderRendering = this.debugger.addFolder({ title: 'Rendering' });
            debugFolderRendering.addInput(material.isSmooth, 'value', { label: 'Is Smooth', options: [{ text: 'False', value: 0 }, { text: 'True', value: 1 }] });
            debugFolderRendering.addInput(material, 'alphaTest', { label: 'Alpha test', min: 0, max: 1 });
            debugFolderRendering.addInput(material.threshold, 'value', { label: 'Threshold (isSmooth)', min: 0, max: 1 });
        });
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
        this.renderer.renderAsync(this.scene, this.camera);
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
        this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
