// Vendor
import { ShaderMaterial, FrontSide, UniformsUtils } from 'three';

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
        ...UniformsUtils.clone(uniforms.common),
        // Rendering
        ...UniformsUtils.clone(uniforms.rendering),
        // Strokes
        ...UniformsUtils.clone(uniforms.strokes),
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
        options = Object.assign(defaultOptions, options);
        super(options);
    }
}
