"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagePackTransforms = void 0;
const msgpack = require('msgpack5')();
// Encode & Decode messagepack with https://github.com/mcollina/msgpack5
function messagePackTransforms() {
    const encodeStream = msgpack.encoder();
    const decodeStream = msgpack.decoder();
    return {
        encodeStream,
        decodeStream
    };
}
exports.messagePackTransforms = messagePackTransforms;
