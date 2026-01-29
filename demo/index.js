import scenes from './scenes';

const GITHUB_BASE_URL = 'https://github.com/leochocolat/three-msdf-text-utils/blob/main/demo/scenes';

const sceneNameMap = {
    basic: 'Basic',
    stroke: 'Stroke',
    editor: 'Editor',
    reveal: 'Reveal',
    webgpu: 'WebGPU',
};

const urlParams = new URLSearchParams(location.search);
const demoName = urlParams.get('demo') || '';
const sceneKey = scenes[demoName.toLowerCase()] ? demoName.toLowerCase() : 'basic';
const scene = new scenes[sceneKey]();
scene.start();

// Set source link
const sourceLink = document.getElementById('source-link');
const folderName = sceneNameMap[sceneKey];
sourceLink.href = `${GITHUB_BASE_URL}/${folderName}/index.js`;
