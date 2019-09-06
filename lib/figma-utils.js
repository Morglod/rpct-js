"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsee = __importStar(require("tsee"));
class FigmaPluginWriteStream extends tsee.EventEmitter {
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
