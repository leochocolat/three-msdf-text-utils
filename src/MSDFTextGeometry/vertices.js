function pages(glyphs) {
    const pages = new Float32Array(glyphs.length * 4 * 1);
    let i = 0;
    glyphs.forEach(function(glyph) {
        const id = glyph.data.page || 0;
        pages[i++] = id;
        pages[i++] = id;
        pages[i++] = id;
        pages[i++] = id;
    });
    return pages;
}

function attributes(glyphs, texWidth, texHeight, flipY, layout) {
    const uvs = new Float32Array(glyphs.length * 4 * 2);
    const layoutUvs = new Float32Array(glyphs.length * 4 * 2);
    const positions = new Float32Array(glyphs.length * 4 * 2);
    const centers = new Float32Array(glyphs.length * 4 * 2);

    let i = 0;
    let j = 0;
    let k = 0;
    let l = 0;

    glyphs.forEach(function(glyph) {
        const bitmap = glyph.data;

        // UV
        const bw = (bitmap.x + bitmap.width);
        const bh = (bitmap.y + bitmap.height);

        // top left position
        const u0 = bitmap.x / texWidth;
        let v1 = bitmap.y / texHeight;
        const u1 = bw / texWidth;
        let v0 = bh / texHeight;

        if (flipY) {
            v1 = (texHeight - bitmap.y) / texHeight;
            v0 = (texHeight - bh) / texHeight;
        }

        // BL
        uvs[i++] = u0;
        uvs[i++] = v1;
        // TL
        uvs[i++] = u0;
        uvs[i++] = v0;
        // TR
        uvs[i++] = u1;
        uvs[i++] = v0;
        // BR
        uvs[i++] = u1;
        uvs[i++] = v1;

        // Layout UV: Text block UVS

        // BL
        layoutUvs[l++] = glyph.position[0] / layout.width;
        layoutUvs[l++] = (glyph.position[1] + layout.height) / layout.height;

        // TL
        layoutUvs[l++] = glyph.position[0] / layout.width;
        layoutUvs[l++] = (glyph.position[1] + layout.height + bitmap.height) / layout.height;
        // TR
        layoutUvs[l++] = (glyph.position[0] + bitmap.width) / layout.width;
        layoutUvs[l++] = (glyph.position[1] + layout.height + bitmap.height) / layout.height;
        // BR
        layoutUvs[l++] = (glyph.position[0] + bitmap.width) / layout.width;
        layoutUvs[l++] = (glyph.position[1] + layout.height) / layout.height;

        // Positions, Centers

        // bottom left position
        const x = glyph.position[0] + bitmap.xoffset;
        const y = glyph.position[1] + bitmap.yoffset;

        // quad size
        const w = bitmap.width;
        const h = bitmap.height;

        // Position

        // BL
        positions[j++] = x;
        positions[j++] = y;
        // TL
        positions[j++] = x;
        positions[j++] = y + h;
        // TR
        positions[j++] = x + w;
        positions[j++] = y + h;
        // BR
        positions[j++] = x + w;
        positions[j++] = y;

        // Center
        centers[k++] = x + w / 2;
        centers[k++] = y + h / 2;

        centers[k++] = x + w / 2;
        centers[k++] = y + h / 2;

        centers[k++] = x + w / 2;
        centers[k++] = y + h / 2;

        centers[k++] = x + w / 2;
        centers[k++] = y + h / 2;
    });

    return { uvs, layoutUvs, positions, centers };
}

function infos(glyphs, layout) {
    const words = new Float32Array(glyphs.length * 4);
    const lines = new Float32Array(glyphs.length * 4);
    const letters = new Float32Array(glyphs.length * 4);
    const lineLetters = new Float32Array(glyphs.length * 4);
    const lineLettersTotal = new Float32Array(glyphs.length * 4);

    let i = 0;
    let j = 0;
    let k = 0;
    let l = 0;
    let m = 0;

    let lineLetterIndex = 0;
    let previousLineIndex = -1;

    for (let index = 0; index < glyphs.length; index++) {
        const glyph = glyphs[index];

        lines[i++] = glyph.line;
        lines[i++] = glyph.line;
        lines[i++] = glyph.line;
        lines[i++] = glyph.line;

        letters[j++] = glyph.index;
        letters[j++] = glyph.index;
        letters[j++] = glyph.index;
        letters[j++] = glyph.index;

        lineLettersTotal[l++] = glyph.lineLettersTotal;
        lineLettersTotal[l++] = glyph.lineLettersTotal;
        lineLettersTotal[l++] = glyph.lineLettersTotal;
        lineLettersTotal[l++] = glyph.lineLettersTotal;

        if (previousLineIndex === glyph.line) {
            lineLetterIndex++;
        } else {
            lineLetterIndex = 0;
        }

        previousLineIndex = glyph.line;

        lineLetters[k++] = lineLetterIndex;
        lineLetters[k++] = lineLetterIndex;
        lineLetters[k++] = lineLetterIndex;
        lineLetters[k++] = lineLetterIndex;

        words[m++] = glyph.wordIndex;
        words[m++] = glyph.wordIndex;
        words[m++] = glyph.wordIndex;
        words[m++] = glyph.wordIndex;
    }

    return { words, lines, letters, lineLetters, lineLettersTotal };
}

export default {
    pages,
    attributes,
    infos,
};
