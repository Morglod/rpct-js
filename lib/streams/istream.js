"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asDuplexStream = exports.asWritableStream = exports.asReadableStream = void 0;
function asReadableStream(rstream) {
    return rstream;
}
exports.asReadableStream = asReadableStream;
function asWritableStream(wstream) {
    return wstream;
}
exports.asWritableStream = asWritableStream;
function asDuplexStream(rwstream) {
    return rwstream;
}
exports.asDuplexStream = asDuplexStream;
