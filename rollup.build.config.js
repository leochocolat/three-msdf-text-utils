import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import glslify from 'rollup-plugin-glslify';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

const sharedPlugins = [
    peerDepsExternal(),
    resolve(),
    babel(),
    commonjs(),
    terser(),
    glslify(),
];

export default [
    // Main bundle (WebGL only)
    {
        input: './src/index.js',
        output: {
            file: './build/bundle.js',
            format: 'esm',
            name: 'bundle',
        },
        external: ['three'],
        plugins: sharedPlugins,
    },
    // WebGPU bundle
    {
        input: './src/webgpu.js',
        output: {
            file: './build/webgpu.js',
            format: 'esm',
            name: 'webgpu',
        },
        external: ['three', 'three/webgpu', 'three/tsl'],
        plugins: sharedPlugins,
    },
];
