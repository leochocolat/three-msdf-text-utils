// Varyings
varying vec2 vUv;

// Uniforms: Common
uniform float uOpacity;
uniform float uThreshold;
uniform float uAlphaTest;
uniform vec3 uColor;
uniform sampler2D uMap;

// Uniforms: Strokes
uniform vec3 uStrokeColor;
uniform float uStrokeOutsetWidth;
uniform float uStrokeInsetWidth;

// Utils: Median
float median(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
}

void main() {
    // Common
    // Texture sample
    vec3 s = texture2D(uMap, vUv).rgb;

    // Signed distance
    float sigDist = median(s.r, s.g, s.b) - 0.5;

    float afwidth = 1.4142135623730951 / 2.0;

    #ifdef IS_SMALL
        float alpha = smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDist);
    #else
        float alpha = clamp(sigDist / fwidth(sigDist) + 0.5, 0.0, 1.0);
    #endif

    // Strokes
    // Outset
    float sigDistOutset = sigDist + uStrokeOutsetWidth * 0.5;

    // Inset
    float sigDistInset = sigDist - uStrokeInsetWidth * 0.5;

    #ifdef IS_SMALL
        float outset = smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDistOutset);
        float inset = 1.0 - smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDistInset);
    #else
        float outset = clamp(sigDistOutset / fwidth(sigDistOutset) + 0.5, 0.0, 1.0);
        float inset = 1.0 - clamp(sigDistInset / fwidth(sigDistInset) + 0.5, 0.0, 1.0);
    #endif

    // Border
    float border = outset * inset;

    // Alpha Test
    if (alpha < uAlphaTest) discard;

    // Output: Common
    vec4 filledFragColor = vec4(uColor, uOpacity * alpha);

    gl_FragColor = filledFragColor;

    // Output: Strokes
    // vec4 strokedFragColor = vec4(uStrokeColor, uOpacity * border);

    // gl_FragColor = strokedFragColor;
}
