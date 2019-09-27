import { Config } from "../config";
import { PlainUUID } from "../utils/types";
import { ApiProtocolReturnType, ApiProtocol } from "../api";
/** any serializable JSON type */
export declare type ITransportData = ApiProtocol;
export declare type ITransportRequestHandler = (data: ApiProtocol) => Promise<ITransportResponse>;
export declare type ITransportProtocol_Api = {
    uuid: PlainUUID;
    api: ApiProtocol;
};
export declare type ITransportProtocol_Return = {
    uuid: PlainUUID;
    return: ApiProtocolReturnType;
};
export declare type ITransportProtocol_Exception = {
    uuid: PlainUUID;
    exception: string;
};
export declare type ITransportProtocolReturnable = ITransportProtocol_Return | ITransportProtocol_Exception;
export declare type ITransportProtocol = ITransportProtocol_Api | ITransportProtocol_Return | ITransportProtocol_Exception;
export declare type ITransportResponse_Return = {
    return: ApiProtocolReturnType;
};
export declare type ITransportResponse_Exception = {
    exception: string;
};
export declare type ITransportResponse = ITransportResponse_Return | ITransportResponse_Exception;
export declare function transportProtocolToResponse(protocol: ITransportProtocolReturnable): ITransportResponse;
export declare function isTransportProtocolReturnable(protocol: ITransportProtocol): protocol is ITransportProtocolReturnable;
export declare function isTransportProtocolApi(protocol: ITransportProtocol): protocol is ITransportProtocol_Api;
export interface ITransportConfigurable {
    setConfig(config: Config): Promise<void> | void;
}
export interface ITransportMaster extends ITransportConfigurable {
    /** make request to remote connected slave */
    request<Data extends ITransportData>(data: Data): Promise<ITransportResponse>;
}
export interface ITransportSlave extends ITransportConfigurable {
    /** handle request from remote connected master with request handler */
    setRequestHandler(handler: ITransportRequestHandler): void;
    getRequestHandler(): ITransportRequestHandler;
}
/** Master + Slave */
export interface ITransport extends ITransportMaster, ITransportSlave {
}
