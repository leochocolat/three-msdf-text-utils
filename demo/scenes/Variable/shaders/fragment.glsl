// Varyings
varying vec2 vUv;
varying vec2 vUv2;

varying float vLineIndex;

varying float vLineLettersTotal;
varying float vLineLetterIndex;

varying float vLineWordsTotal;
varying float vLineWordIndex;

varying float vWordIndex;

varying float vLetterIndex;

// Uniforms: Common
uniform float uOpacity;
uniform float uThreshold;
uniform float uAlphaTest;
uniform vec3 uColor;
uniform sampler2D uMap1;
uniform sampler2D uMap2;
uniform sampler2D uLettersTotal;

// Uniforms: Strokes
uniform vec3 uStrokeColor;
uniform float uStrokeOutsetWidth;
uniform float uStrokeInsetWidth;

// Custom
uniform float uWeight;

// Utils: Median
float median(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
}

void main() {
    // Common
    // Texture sample: each atlas is sampled with its own UVs
    // (glyph packing differs between weight atlases)
    vec3 s1 = texture2D(uMap1, vUv).rgb;
    vec3 s2 = texture2D(uMap2, vUv2).rgb;
    
    float d1 = median(s1.r, s1.g, s1.b);
    float d2 = median(s2.r, s2.g, s2.b);

    // Signed distance
    float sigDist = mix(d1, d2, uWeight) - 0.5;

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

    // Letter by letter
    // gl_FragColor = filledFragColor * ((vLetterIndex + 1.0) / uLettersTotal);

    // Line by line
    // gl_FragColor = filledFragColor * ((vLineIndex + 1.0) / uLinesTotal);

    // Word by word
    // gl_FragColor = filledFragColor * ((vWordIndex + 1.0) / uWordsTotal);

    // Letter by letter per line
    // gl_FragColor = filledFragColor * ((vLineLetterIndex + 1.0) / vLineLettersTotal);

    // Word by word per line
    // gl_FragColor = filledFragColor * ((vLineWordIndex + 1.0) / vLineWordsTotal);
}
