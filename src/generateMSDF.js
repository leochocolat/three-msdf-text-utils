import { Texture } from 'three';
import { MSDF } from './vendor/msdf-generator/dist/index';
import { Font } from 'three/examples/jsm/Addons.js';

const defaultOptions = {
    charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ',
    fontSize: 48,
    textureSize: [512, 512],
    fieldRange: 4,
    fixOverlaps: true,
    onProgress: () => {},
}

const generateMSDF = async(fontPath, options = {}) => {
    const parsedOptions = { ...defaultOptions, ...options };
    
    const msdf = new MSDF({
        workerUrl: parsedOptions.workerUrl,
        wasmUrl: parsedOptions.wasmUrl,
    });
    
    await msdf.initialize();
    
    const req = await fetch(fontPath);
    
    const ab = await req.arrayBuffer();
    const fontBuffer = new Uint8Array(ab);

    // Generate MSDF atlas
    const result = await msdf.generate({
        font: fontBuffer,
        charset: parsedOptions.charset,
        fontSize: parsedOptions.fontSize,
        textureSize: parsedOptions.textureSize,
        fieldRange: parsedOptions.fieldRange,
        fixOverlaps: parsedOptions.fixOverlaps,
        onProgress: parsedOptions.onProgress,
    });

    await msdf.dispose();

    const fontName = Object.keys(result)[0];
    const fontWeight = Object.keys(result[fontName])[0];
    const fontData = result[fontName][fontWeight];
    const atlasBase64 = fontData.pages[0];

    const atlas = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            const texture = new Texture(image);
            texture.needsUpdate = true;
            resolve(texture);
        };
        image.onerror = reject;
        image.src = atlasBase64;
    });

    return {
        font: new Font(fontData),
        atlas,
    };
}

export default generateMSDF;