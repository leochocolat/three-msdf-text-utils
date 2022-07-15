// THREE
import { Scene, WebGLRenderer, PerspectiveCamera, TextureLoader, Mesh, DoubleSide } from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Lib
import { MSDFTextGeometry, MSDFTextMaterial } from '../src/index';

let canvas, renderer, scene, camera, controls;

setup();
setupText();
update();

function setup() {
    canvas = document.querySelector('.js-canvas');

    camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.z = 1000;

    scene = new Scene();

    renderer = new WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.update();
}

function setupText() {
    const promises = [
        loadFontAtlas('./fonts/roboto/roboto-regular.png'),
        loadFont('./fonts/roboto/roboto-regular.fnt'),
    ];

    Promise.all(promises).then(([atlas, font]) => {
        const geometry = new MSDFTextGeometry({
            text: 'Hello World',
            font: font.data,
        });

        const material = new MSDFTextMaterial();
        material.uniforms.uMap.value = atlas;
        material.side = DoubleSide;

        const mesh = new Mesh(geometry, material);
        mesh.rotation.x = Math.PI;
        scene.add(mesh);
    });
}

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

function render() {
    renderer.render(scene, camera);
}

function update() {
    render();

    requestAnimationFrame(update);
}
