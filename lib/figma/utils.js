"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tsee_1 = require("tsee");
class FigmaPluginWriteStream extends tsee_1.EventEmitter {
    constructor(figma) {
        super();
        this.figma = figma;
    }
    write(chunk, stringEncoding_callback, callback) {
        if (typeof stringEncoding_callback === 'function') {
            callback = stringEncoding_callback;
        }
        this.figma.ui.postMessage(chunk);
        if (callback)
            callback();
        return true;
    }
}
exports.FigmaPluginWriteStream = FigmaPluginWriteStream;
