import { ApiMiddleware, Api, ApiProtocolArgTypeFlag, ApiProtocolArg } from "../api";

export const buffersMiddleware = () => {
    let api: Api<any, any>;

    const pack = (arg: any) => {
        if (Buffer.isBuffer(arg)) {
            const buf = (arg as Buffer);
            return {
                type: ApiProtocolArgTypeFlag.buffer,
                data64: buf.toString('base64'),
            } as const;
        }
        return undefined;
    };

    const unpack = (arg: ApiProtocolArg) => {
        if (arg.type === ApiProtocolArgTypeFlag.buffer) {
            const buf = Buffer.from(arg.data64, 'base64');
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