import { Api, DefaultMethodMap } from './api';
import { PodJSON } from './transport';
export declare class CodecsApi<RemoteMethodMap extends DefaultMethodMap, SelfMethodMap extends DefaultMethodMap> {
    readonly api: Api<RemoteMethodMap, SelfMethodMap>;
    constructor(api: Api<RemoteMethodMap, SelfMethodMap>);
}
export declare type CodecDesc = {
    codecId: string;
    encode: (data: any) => PodJSON;
    decode: (encodedData: PodJSON) => any;
    canEncode: (data: any) => boolean;
};
