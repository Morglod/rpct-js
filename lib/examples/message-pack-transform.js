"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var msgpack = require('msgpack5')();
// Encode & Decode messagepack with https://github.com/mcollina/msgpack5
function messagePackTransforms() {
    var encodeStream = msgpack.encoder();
    var decodeStream = msgpack.decoder();
    return {
        encodeStream: encodeStream,
        decodeStream: decodeStream
    };
}
exports.messagePackTransforms = messagePackTransforms;
