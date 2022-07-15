// Vendor
import { ShaderMaterial, FrontSide, Color } from 'three';

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
        uOpacity: { value: 1 },
        uColor: { value: new Color('#ffffff') },
        uMap: { value: null },
        uThreshold: { value: 0 },
        uAlphaTest: { value: 0 },
        uOutlineColor: { value: new Color('#ffffff') },
        uOutlineOutsetWidth: { value: 0 },
        uOutlineInsetWidth: { value: 0 },
    },
    vertexShader,
    fragmentShader,
};

export default class MSDFTextMaterial extends ShaderMaterial {
    constructor(options = {}) {
        options = Object.assign(defaultOptions, options);
        super(options);
    }
}
