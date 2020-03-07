import { ApiMiddleware, Api, ApiProtocolArgTypeFlag, ApiProtocolArg } from "../api";

export const buffersMiddleware = () => {
    let api: Api<any, any>;

    const pack = (arg: any) => {
        if (Buffer.isBuffer(arg)) {
            const buf = (arg as Buffer);
            return {
                type: ApiProtocolArgTypeFlag.buffer,
                bufferType: 'Buffer',
                data64: buf.toString('base64'),
            } as const;
        }
        if (arg instanceof Uint8Array) {
            const buf = Buffer.from(arg as Uint8Array);
            return {
                type: ApiProtocolArgTypeFlag.buffer,
                bufferType: 'Uint8Array',
                data64: buf.toString('base64'),
            } as const;
        }
        return undefined;
    };

    const unpack = (arg: ApiProtocolArg) => {
        if (arg.type === ApiProtocolArgTypeFlag.buffer) {
            const buf = Buffer.from(arg.data64, 'base64');
            if (arg.bufferType === 'Uint8Array') {
                return Uint8Array.from(buf);
            }
            return buf;
        }
        return undefined;
    };

    const middleware: ApiMiddleware = {
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