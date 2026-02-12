// src/worker-client.ts
import { wrap } from "comlink";
var MSDFGeneratorWorkerClient = class {
  worker;
  api;
  initPromise;
  constructor(workerUrl, wasmBinaryUrl) {
    this.worker = new Worker(workerUrl, { type: "module" });
    this.api = wrap(this.worker);
    this.initPromise = this.api.initialize(wasmBinaryUrl);
  }
  initialize = () => this.initPromise;
  loadFont = async (fontData) => {
    await this.initPromise;
    return this.api.loadFont(fontData);
  };
  generateAtlas = (options) => this.api.generateAtlas(options);
  exportJSON = (options) => this.api.exportJSON(options);
  dispose = () => this.api.dispose();
  generateMSDFAtlas = (options) => this.api.generateMSDFAtlas(options);
  generateMSDFFont = (options) => this.api.generateMSDFFont(options);
  terminate = () => this.worker.terminate();
};

// src/MSDFGenerator.ts
var MSDF = class {
  static Encoder = new TextEncoder();
  client = null;
  workerUrl;
  wasmUrl;
  initialized = false;
  constructor(config = {}) {
    this.workerUrl = config.workerUrl || new URL("./worker.js", import.meta.url).href;
    this.wasmUrl = config.wasmUrl;
  }
  async initialize() {
    if (this.initialized) return;
    this.client = new MSDFGeneratorWorkerClient(this.workerUrl, this.wasmUrl);
    await this.client.initialize();
    this.initialized = true;
  }
  async generate(options) {
    if (!this.client || !this.initialized) {
      throw new Error("MSDF not initialized. Call initialize() first.");
    }
    if (options.fonts) return this.generateMultiple(options);
    return this.generateSingle(options);
  }
  async generateSingle(options) {
    const { onProgress, ...workerOptions } = options;
    await this.client.loadFont(workerOptions.font);
    const atlas = await this.client.generateAtlas(workerOptions);
    const json = await this.client.exportJSON({
      atlas,
      fontSize: options.fontSize || 48
    });
    const blob = await this.atlasToBlob(atlas);
    const base64 = await this.blobToBase64(blob);
    const jsonWithInlinedTexture = {
      ...json,
      pages: [`data:image/png;base64,${base64}`]
    };
    onProgress?.(100, 1, 1);
    return this.toFontFamily(
      jsonWithInlinedTexture,
      atlas.info.name || "font",
      atlas.info.weight || 400
    );
  }
  // TODO - We should worker-pool this, wasm bit is tricky tho
  async generateMultiple(options) {
    const { fonts, onProgress, ...globalOptions } = options;
    if (!fonts || fonts.length === 0) throw new Error("No fonts provided");
    const result = {};
    let completed = 0;
    const total = fonts.length;
    for (const fontConfig of fonts) {
      const { font, ...fontOptions } = fontConfig;
      const mergedOptions = {
        ...globalOptions,
        ...fontOptions,
        font,
        charset: fontOptions.charset ?? globalOptions.charset ?? ""
      };
      if (!mergedOptions.charset)
        throw new Error("charset is required globally or per-font");
      const fontFamily = await this.generateSingle(mergedOptions);
      for (const [fontName, weights] of Object.entries(fontFamily)) {
        for (const [weight, fontData] of Object.entries(weights)) {
          const weightNum = Number(weight);
          if (result[fontName]?.[weightNum]) {
            console.warn(
              `Duplicate font: ${fontName} (${weightNum}). Overwriting.`
            );
          }
          if (!result[fontName]) result[fontName] = {};
          result[fontName][weightNum] = fontData;
        }
      }
      completed++;
      onProgress?.(Math.round(completed / total * 100), completed, total);
    }
    return result;
  }
  async generateAtlas(options) {
    if (!this.client || !this.initialized) {
      throw new Error("MSDF not initialized. Call initialize() first.");
    }
    const { onProgress, ...workerOptions } = options;
    await this.client.loadFont(workerOptions.font);
    return await this.client.generateAtlas(workerOptions);
  }
  async dispose() {
    if (this.client) {
      await this.client.dispose();
      this.client.terminate();
      this.client = null;
      this.initialized = false;
    }
  }
  async toFontFamily(json, fontName, fontWeight) {
    return {
      [fontName]: {
        [fontWeight]: json
      }
    };
  }
  atlasToBlob(atlas) {
    const canvas = document.createElement("canvas");
    canvas.width = atlas.textureSize[0];
    canvas.height = atlas.textureSize[1];
    canvas.getContext("2d").putImageData(atlas.texture, 0, 0);
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error("Failed to create blob")),
        "image/png"
      );
    });
  }
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
};
export {
  MSDF
};
