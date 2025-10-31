import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import glslify from 'rollup-plugin-glslify';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

export default {
    input: './src/index.js',
    output: {
        file: './build/bundle.js',
        format: 'esm',
        name: 'bundle',
    },
    external: ['three'],
    plugins: [
        peerDepsExternal(),
        resolve(),
        babel(),
        commonjs(),
        terser(),
        glslify(),
    ],
};
