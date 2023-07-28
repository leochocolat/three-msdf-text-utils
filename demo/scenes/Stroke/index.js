// THREE
import { Scene, WebGLRenderer, PerspectiveCamera, TextureLoader, Mesh, DoubleSide, ShaderMaterial, Color } from 'three';
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

export default class Stroke {
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

        this.renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true });
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
                vertexShader: vertex,
                fragmentShader: fragment,
            });

            material.uniforms.uMap.value = atlas;
            material.side = DoubleSide;
            material.uniforms.uColor.value = new Color(config.settings.color);
            material.uniforms.uStrokeColor.value = new Color(config.settings.strokeColor);

            const mesh = new Mesh(geometry, material);
            mesh.rotation.x = Math.PI;
            const scale = 3;
            mesh.position.x = -geometry.layout.width / 2 * scale;
            mesh.scale.set(scale, scale, scale);
            this.scene.add(mesh);

            // Debug
            const debugFolderCommon = this.debugger.addFolder({ title: 'Common' });
            debugFolderCommon.addInput(material.uniforms.uOpacity, 'value', { label: 'Opacity', min: 0, max: 1 });
            debugFolderCommon.addInput(config.settings, 'color', { label: 'Color' }).on('change', () => { material.uniforms.uColor.value.set(config.settings.color); });

            const debugFolderStrokes = this.debugger.addFolder({ title: 'Strokes' });
            debugFolderStrokes.addInput(config.settings, 'strokeColor', { label: 'Color' }).on('change', () => { material.uniforms.uStrokeColor.value.set(config.settings.strokeColor); });
            debugFolderStrokes.addInput(material.uniforms.uStrokeInsetWidth, 'value', { label: 'Inset width', min: 0, max: 1 });
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
