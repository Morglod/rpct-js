const msgpack = require('msgpack5')();

// Encode & Decode messagepack with https://github.com/mcollina/msgpack5
export function messagePackTransforms() {

    const encodeStream = msgpack.encoder();
    const decodeStream = msgpack.decoder();

    return {
        encodeStream,
        decodeStream
    };
}