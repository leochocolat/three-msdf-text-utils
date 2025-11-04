declare module "three-msdf-text-utils" {
  import { BMFontJSON } from "./bmfont-json";
  import type * as THREE from "three/webgpu";
  import type { ShaderNodeObject } from "three/tsl"

  interface WordWrapOptions {
    width?: number;
    mode?: "pre" | "nowrap" | "normal";
    start?: number;
    end?: number;
  }

  export interface MSDFTextGeometryOptions extends WordWrapOptions {
    text: string;
    font: BMFontJSON;
    flipY?: boolean;
    multipage?: boolean;
    align?: "left" | "center" | "right";
    letterSpacing?: number;
    lineHeight?: number;
    tabSize?: number;
  }

  interface Glyph {
    position: [number, number],
    data: BMFontChar,
    index: number,
    // Line
    linesTotal: number,
    lineIndex: number,
    lineLettersTotal: number,
    lineLetterIndex: number,
    lineWordsTotal: number,
    lineWordIndex: number,
    // Word
    wordsTotal: number,
    wordIndex: number,
    // Letter
    lettersTotal: number,
    letterIndex: number,
  }

  interface TextLayout {
    width: number;
    height: number;
    descender: number;
    ascender: number;
    xHeight: number;
    baseline: number;
    capHeight: number;
    lineHeight: number;
    linesTotal: number;
    lettersTotal: number;
    glyphs: Glyph[];
  }

  export class MSDFTextGeometry extends THREE.BufferGeometry {
    constructor(options: string | MSDFTextGeometryOptions);
    update(options: string | MSDFTextGeometryOptions): void;
    layout: TextLayout;
    visibleGlyphs: Glyph[];
  }

  export interface MSDFTextMaterialOptions extends THREE.ShaderMaterialParameters {
    extensions?: {
      derivatives?: boolean;
      [k: string]: any;
    };
    uniforms?: {
      // Common
      uOpacity?: { value: number };
      uColor?: { value: THREE.Color };
      uMap?: { value: THREE.Texture | null };
      // Rendering
      uThreshold?: { value: number };
      uAlphaTest?: { value: number };
      // Stroke
      uStrokeColor?: { value: THREE.Color };
      uStrokeOutsetWidth?: { value: number };
      uStrokeInsetWidth?: { value: number };
    };
  }

  export class MSDFTextMaterial extends THREE.ShaderMaterial {
    constructor(options?: MSDFTextMaterialOptions);
  }

  export interface MSDFTextNodeMaterialOptions {
    map: THREE.Texture, // MSDF atlas texture
    transparent?: boolean,
    alphaTest?: number,
    opacity?: number,
    color?: THREE.ColorRepresentation,
    isSmooth?: number,
    threshold?: number,
    strokeColor?: THREE.ColorRepresentation,
    strokeOutsetWidth?: number,
    strokeInsetWidth?: number,
  }

  export class MSDFTextNodeMaterial extends THREE.NodeMaterial {
    constructor(options?: MSDFTextNodeMaterialOptions);
    map: THREE.Texture;
    transparent: boolean;
    alphaTest: number;
    opacity: number;
    color: THREE.Color;
    isSmooth: number;
    threshold: number;
    strokeColor: THREE.Color;
    strokeOutsetWidth: number;
    strokeInsetWidth: number;
    colorNode: ShaderNodeObject;
    opacityNode: ShaderNodeObject;
  }
}
