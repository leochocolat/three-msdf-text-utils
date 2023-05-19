// Vendor
import { ShaderMaterial, FrontSide } from 'three';

// Uniforms
import uniforms from './uniforms';

// Shaders
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

const defaultOptions = {
    side: FrontSide,
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
    vertexShader,
    fragmentShader,
};

export {
    uniforms,
    defaultOptions,
};

export default class MSDFTextMaterial extends ShaderMaterial {
    constructor(options = {}) {
        options = Object.assign(JSON.parse(JSON.stringify(defaultOptions)), options);
        super(options);
    }
}
