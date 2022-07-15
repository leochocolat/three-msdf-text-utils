import scenes from './scenes';

const { demoName } = document.querySelector('.js-canvas').dataset;

const scene = new scenes[demoName]();
scene.start();
