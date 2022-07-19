// Varyings
#include <three_msdf_varyings>

// Uniforms
#include <three_msdf_common_uniforms>
#include <three_msdf_strokes_uniforms>

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

    filledFragColor.a += vLetterIndex;

    gl_FragColor = filledFragColor;
    gl_FragColor = vec4(vLayoutUv.x, 0.0, 0.0, 1.0);
}
