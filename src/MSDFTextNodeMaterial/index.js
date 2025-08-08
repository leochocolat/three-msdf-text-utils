// THREE WEBGPU
import { NodeMaterial } from 'three/webgpu';
import { uv, mix, uniform, texture, fwidth, clamp, smoothstep, max, min, div, sub, add, mul, oneMinus } from 'three/tsl';

// THREE
import { Color } from 'three';

const defaultOptions = {
    transparent: true,
    opacity: 1,
    alphaTest: 0.01,
    threshold: 0.2,
    color: '#ffffff',
    strokeColor: '#000000',
    strokeOutsetWidth: 0,
    strokeInsetWidth: 0.3,
    isSmooth: 0,
};

export default class MSDFTextNodeMaterial extends NodeMaterial {
    constructor(options = {}) {
        options = Object.assign(JSON.parse(JSON.stringify(defaultOptions)), options);

        super();

        /**
         * Build in properties
         */
        this.transparent = options.transparent;
        this.alphaTest = options.alphaTest;

        /**
         * Uniforms: basic
         */
        this.opacity = uniform(options.opacity);
        this.color = uniform(new Color(options.color));
        this.map = options.map;

        /**
         * Uniforms small font sizes
         */
        this.isSmooth = uniform(options.isSmooth);
        this.threshold = uniform(options.threshold);

        /**
         * Uniforms: stroke
         */
        this.strokeColor = uniform(new Color(options.strokeColor));
        this.strokeOutsetWidth = uniform(options.strokeOutsetWidth);
        this.strokeInsetWidth = uniform(options.strokeInsetWidth);

        const afwidth = 1.4142135623730951 / 2.0;
        const median = (r, g, b) => max(min(r, g), min(max(r, g), b));

        /**
         * Texture Sampling
         */
        const s = texture(this.map, uv());

        /**
         * Fill
         */
        const sigDist = sub(median(s.r, s.g, s.b), 0.5);
        let alpha = clamp(add(div(sigDist, fwidth(sigDist)), 0.5), 0.0, 1.0);

        /**
         * Fill Smooth
         */
        const smoothAlpha = smoothstep(sub(this.threshold, afwidth), add(this.threshold, afwidth), sigDist);
        alpha = mix(alpha, smoothAlpha, this.isSmooth);

        /**
         * Strokes
         */
        const sigDistOutset = add(sigDist, mul(this.strokeOutsetWidth, 0.5));
        const sigDistInset = sub(sigDist, mul(this.strokeOutsetWidth, 0.5));

        let outset = clamp(add(div(sigDistOutset, fwidth(sigDistOutset)), 0.5), 0.0, 1.0);
        let inset = oneMinus(clamp(add(div(sigDistInset, fwidth(sigDistInset)), 0.5), 0.0, 1.0));

        /**
         * Strokes Smooth
         */
        const smoothOutset = smoothstep(sub(this.threshold, afwidth), add(this.threshold, afwidth), sigDistOutset);
        const smoothInset = oneMinus(smoothstep(sub(this.threshold, afwidth), add(this.threshold, afwidth), sigDistInset));

        outset = mix(outset, smoothOutset, this.isSmooth);
        inset = mix(inset, smoothInset, this.isSmooth);

        const border = mul(outset, inset);

        /**
         * Outputs: filled
         */
        // this.colorNode = this.color;
        // this.opacityNode = mul(this.opacity, alpha);

        /**
         * Outputs: stroked
         */
        // this.colorNode = this.strokeColor;
        // this.opacityNode = mul(this.opacity, border);

        /**
         * Outputs: Filled + stroked
         */
        this.colorNode = mix(this.color, this.strokeColor, border);
        this.opacityNode = mul(this.opacity, add(alpha, border));
    }
}
