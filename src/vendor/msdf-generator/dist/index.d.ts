interface MSDFGeneratorOptions {
    font: Uint8Array;
    charset: string;
    fontSize?: number;
    textureSize?: [number, number];
    fieldRange?: number;
    padding?: number;
    /**
     * Fix overlapping paths in glyphs using winding order detection.
     * This separates paths by area sign, unites outer paths, and subtracts inner holes.
     * Useful for fonts with self-intersecting contours (e.g., 'B', 'O', 'P', 'Q', etc.).
     * @default false
     */
    fixOverlaps?: boolean;
}
/**
 * Character/glyph information
 */
interface CharInfo {
    id: number;
    index: number;
    char: string;
    width: number;
    height: number;
    xoffset: number;
    yoffset: number;
    xadvance: number;
    chnl: number;
    x: number;
    y: number;
    page: number;
}
/**
 * Font metadata
 */
interface FontInfo {
    face: string;
    size: number;
    bold: number;
    italic: number;
    charset: string[];
    unicode: number;
    stretchH: number;
    smooth: number;
    aa: number;
    padding: number[];
    spacing: number[];
    outline: number;
}
/**
 * Common font metrics
 */
interface FontCommon {
    lineHeight: number;
    base: number;
    scaleW: number;
    scaleH: number;
    pages: number;
    packed: number;
    alphaChnl: number;
    redChnl: number;
    greenChnl: number;
    blueChnl: number;
}
/**
 * Distance field information
 */
interface DistanceField {
    fieldType: string;
    distanceRange: number;
}
/**
 * Kerning pair information
 */
interface KerningInfo {
    first: number;
    second: number;
    amount: number;
}
/**
 * Complete font data in BMFont JSON format.
 */
interface MSDFBitmapFont {
    pages: string[];
    chars: CharInfo[];
    info: FontInfo;
    common: FontCommon;
    distanceField: DistanceField;
    kernings: KerningInfo[];
}
/**
 * Font family data structure.
 * Maps font names to weight variants, each containing font data.
 * The value can be either a URL string or the font data object directly.
 */
type FontFamily = {
    [fontName: string]: {
        [weight: number]: string | MSDFBitmapFont;
    };
};
interface GlyphInfo {
    unicode: number;
    char: string;
    atlasPosition: [number, number];
    atlasSize: [number, number];
    bounds: {
        left: number;
        bottom: number;
        right: number;
        top: number;
    };
    advance: number;
    xoffset: number;
    yoffset: number;
}
interface FontMetrics {
    emSize: number;
    ascender: number;
    descender: number;
    lineHeight: number;
}
interface KerningPair {
    first: string;
    second: string;
    amount: number;
}
interface MSDFAtlas {
    texture: ImageData;
    glyphs: GlyphInfo[];
    metrics: FontMetrics;
    info: {
        name: string;
        weight: number;
        italic: boolean;
        bold: boolean;
    };
    kerning: KerningPair[];
    textureSize: [number, number];
    fieldRange: number;
}

interface MSDFGeneratorConfig {
    workerUrl?: string;
    wasmUrl?: string;
}
type FontConfig = Omit<MSDFGeneratorOptions, 'charset'> & {
    charset?: string;
};
type GenerateFontOptions = ({
    font: Uint8Array;
    fonts?: never;
} | {
    font?: never;
    fonts: FontConfig[];
}) & Omit<MSDFGeneratorOptions, 'font'> & {
    onProgress?: (progress: number, completed: number, total: number) => void;
};
type GenerateFontResult = FontFamily;
declare class MSDF {
    static Encoder: TextEncoder;
    private client;
    private workerUrl;
    private wasmUrl?;
    private initialized;
    constructor(config?: MSDFGeneratorConfig);
    initialize(): Promise<void>;
    generate(options: GenerateFontOptions): Promise<GenerateFontResult>;
    private generateSingle;
    private generateMultiple;
    generateAtlas(options: GenerateFontOptions): Promise<MSDFAtlas>;
    dispose(): Promise<void>;
    private toFontFamily;
    private atlasToBlob;
    private blobToBase64;
}

export { type CharInfo, type DistanceField, type FontCommon, type FontFamily, type FontInfo, type FontMetrics, type GenerateFontOptions, type GenerateFontResult, type GlyphInfo, type KerningInfo, type KerningPair, MSDF, type MSDFAtlas, type MSDFBitmapFont, type MSDFGeneratorConfig, type MSDFGeneratorOptions };
