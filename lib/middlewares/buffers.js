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
                data64: buf.toString('base64'),
            };
        }
        return undefined;
    };
    const unpack = (arg) => {
        if (arg.type === api_1.ApiProtocolArgTypeFlag.buffer) {
            const buf = Buffer.from(arg.data64, 'base64');
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
        packArg(_, origArg, argI, rid) {
            return pack(origArg);
        },
        unpackArg(_, origArg, argI, rid) {
            return unpack(origArg);
        },
        packReturnValue(_, origArg, rid) {
            return pack(origArg);
        },
        unpackReturnValue(_, origArg, rid) {
            return unpack(origArg);
        }
    };
    return {
        middleware,
    };
};
