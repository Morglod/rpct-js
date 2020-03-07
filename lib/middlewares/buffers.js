"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
exports.buffersMiddleware = () => {
    let api;
    const pack = (arg) => {
        if (Buffer.isBuffer(arg)) {
            const buf = arg;
            return {
                type: api_1.ApiProtocolArgTypeFlag.buffer,
                bufferType: 'Buffer',
                data64: buf.toString('base64'),
            };
        }
        if (arg instanceof Uint8Array) {
            const buf = Buffer.from(arg);
            return {
                type: api_1.ApiProtocolArgTypeFlag.buffer,
                bufferType: 'Uint8Array',
                data64: buf.toString('base64'),
            };
        }
        return undefined;
    };
    const unpack = (arg) => {
        if (arg.type === api_1.ApiProtocolArgTypeFlag.buffer) {
            const buf = Buffer.from(arg.data64, 'base64');
            if (arg.bufferType === 'Uint8Array') {
                return Uint8Array.from(buf);
            }
            return buf;
        }
        return undefined;
    };
    const middleware = {
        install(api_) {
            api = api_;
        },
        postCall(params, rid) {
        },
        packArg(packed, origArg, argI, rid) {
            const r = pack(origArg);
            return r === undefined ? packed : r;
        },
        unpackArg(unpacked, origArg, argI, rid) {
            const r = unpack(origArg);
            return r === undefined ? unpacked : r;
        },
        packReturnValue(packed, origArg, rid) {
            const r = pack(origArg);
            return r === undefined ? packed : r;
        },
        unpackReturnValue(unpacked, origArg, rid) {
            const r = unpack(origArg);
            return r === undefined ? unpacked : r;
        }
    };
    return {
        middleware,
    };
};
