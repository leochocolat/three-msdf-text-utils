import scenes from './scenes';

const urlParams = new URLSearchParams(location.search);
const demoName = urlParams.get('demo') || '';
const scene = scenes[demoName.toLowerCase()] ? new scenes[demoName.toLowerCase()]() : new scenes.basic();
scene.start();
