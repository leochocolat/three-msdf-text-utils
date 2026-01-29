/**
 * Type definitions for BMFont / MSDF JSON format
 * Used by msdf-bmfont / three-msdf-text-utils / WebGL bitmap text renderers
 */

export interface BMFontInfo {
  face?: string;
  size?: number;
  bold?: number;
  italic?: number;
  charset?: string;
  unicode?: number;
  stretchH?: number;
  smooth?: number;
  aa?: number;
  padding?: [number, number, number, number];
  spacing?: [number, number];
  outline?: number;
}

export interface BMFontCommon {
  lineHeight: number;
  base: number;
  scaleW: number;
  scaleH: number;
  pages: number;
  packed?: number;
  alphaChnl?: number;
  redChnl?: number;
  greenChnl?: number;
  blueChnl?: number;
}

export interface BMFontPage {
  id: number;
  file: string;
}

export interface BMFontChar {
  id: number;        // unicode value
  index?: number;    // optional (not always present)
  char?: string;     // optional visible character
  x: number;
  y: number;
  width: number;
  height: number;
  xoffset: number;
  yoffset: number;
  xadvance: number;
  page: number;
  chnl: number;
}

export interface BMFontKerning {
  first: number;
  second: number;
  amount: number;
}

export interface BMFontJSON {
  pages: string[] | BMFontPage[];
  chars: BMFontChar[];
  kernings?: BMFontKerning[];
  info?: BMFontInfo;
  common?: BMFontCommon;
}
