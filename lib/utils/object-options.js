"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getObjectOptions(obj, symbol, defaultOptions) {
    let opts = obj[symbol];
    if (!opts)
        opts = typeof defaultOptions === 'function' ? defaultOptions(obj) : defaultOptions;
    return opts;
}
exports.getObjectOptions = getObjectOptions;
function setObjectOptions(obj, symbol, options) {
    obj[symbol] = typeof options === 'function' ? options(obj) : options;
    return obj;
}
exports.setObjectOptions = setObjectOptions;
