// Varyings
varying vec2 vUv;

// Uniforms
uniform float uOpacity;
uniform float uThreshold;
uniform float uAlphaTest;
uniform vec3 uColor;
uniform sampler2D uMap;

// Outline
uniform vec3 uOutlineColor;
uniform float uOutlineOutsetWidth;
uniform float uOutlineInsetWidth;

float median(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
}

void main() {
    // Texture sample
    vec3 s = texture2D(uMap, vUv).rgb;

    // Signed distance
    float sigDist = median(s.r, s.g, s.b) - 0.5;

    // Outset
    float sigDistOutset = sigDist + uOutlineOutsetWidth * 0.5;
    float sigDistOutset2 = sigDist + (0.5) * 0.5;

    // Inset
    float sigDistInset = sigDist - uOutlineInsetWidth * 0.5;

    #ifdef IS_SMALL
        float afwidth = 1.4142135623730951 / 2.0;
        float alpha = smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDist);
        float outset = smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDistOutset);
        float outset2 = smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDistOutset2);
        float inset = 1.0 - smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDistInset);
    #else
        float alpha = clamp(sigDist / fwidth(sigDist) + 0.5, 0.0, 1.0);
        float outset = clamp(sigDistOutset / fwidth(sigDistOutset) + 0.5, 0.0, 1.0);
        float outset2 = clamp(sigDistOutset2 / fwidth(sigDistOutset2) + 0.5, 0.0, 1.0);
        float inset = 1.0 - clamp(sigDistInset / fwidth(sigDistInset) + 0.5, 0.0, 1.0);
    #endif

    // Border
    float border = outset * inset;

    // Alpha test
    if (alpha < uAlphaTest) discard;

    // Outputs
    vec4 filledFragColor = vec4(uColor, uOpacity * alpha);
    vec4 strokedFragColor = vec4(uOutlineColor, uOpacity * border);

    gl_FragColor = filledFragColor;
}
