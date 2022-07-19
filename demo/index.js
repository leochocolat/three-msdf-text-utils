import scenes from './scenes';

const urlParams = new URLSearchParams(location.search);
const demoName = urlParams.get('demo');
const scene = scenes[demoName] ? new scenes[demoName]() : new scenes.basic();
scene.start();
