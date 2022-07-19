// Output
vec4 mvPosition = vec4(position, 1.0);
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;

// Varyings
vUv = uv;
vLayoutUv = layoutUv;
vViewPosition = -mvPosition.xyz;
vNormal = normal;
vLineIndex = line;
vLetterIndex = letter;
vLineLetterIndex = lineLetters;
vLineLettersTotal = lineLettersTotal;