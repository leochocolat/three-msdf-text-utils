// Attribute
attribute vec2 layoutUv;

attribute float lineIndex;

attribute float lineLettersTotal;
attribute float lineLetterIndex;

attribute float lineWordsTotal;
attribute float lineWordIndex;

attribute float wordIndex;

attribute float letterIndex;

// Varyings
varying vec2 vUv;
varying vec2 vLayoutUv;
varying vec3 vViewPosition;
varying vec3 vNormal;

varying float vLineIndex;

varying float vLineLettersTotal;
varying float vLineLetterIndex;

varying float vLineWordsTotal;
varying float vLineWordIndex;

varying float vWordIndex;

varying float vLetterIndex;

void main() {
    // Output
    vec4 mvPosition = vec4(position, 1.0);
    mvPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * mvPosition;

    // Varyings
    vUv = uv;
    vLayoutUv = layoutUv;
    vViewPosition = -mvPosition.xyz;
    vNormal = normal;

    vLineIndex = lineIndex;

    vLineLettersTotal = lineLettersTotal;
    vLineLetterIndex = lineLetterIndex;

    vLineWordsTotal = lineWordsTotal;
    vLineWordIndex = lineWordIndex;

    vWordIndex = wordIndex;

    vLetterIndex = letterIndex;
}
