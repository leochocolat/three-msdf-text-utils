// Varyings
#include <three_msdf_varyings>

// Uniforms
#include <three_msdf_common_uniforms>
#include <three_msdf_strokes_uniforms>

uniform float uLinesTotal;
uniform float uLettersTotal;
uniform float uWordsTotal;

// Utils
#include <three_msdf_median>

void main() {
    // Common
    #include <three_msdf_common>

    // Strokes
    #include <three_msdf_strokes>

    // Alpha Test
    #include <three_msdf_alpha_test>

    // Outputs
    #include <three_msdf_common_output>

    // Letter by letter
    // gl_FragColor = filledFragColor * ((vLetterIndex + 1.0) / uLettersTotal);

    // Line by line
    // gl_FragColor = filledFragColor * ((vLineIndex + 1.0) / uLinesTotal);

    // Word by word
    // gl_FragColor = filledFragColor * ((vWordIndex + 1.0) / uWordsTotal);

    // Letter by letter per line
    gl_FragColor = filledFragColor * ((vLineLetterIndex + 1.0) / vLineLettersTotal);

    // Word by word per line
    // gl_FragColor = filledFragColor * ((vLineWordIndex + 1.0) / vLineWordsTotal);
}
