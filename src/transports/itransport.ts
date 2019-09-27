import { Config } from "../config";
import { PodJSON, PlainUUID } from "../utils/types";
import { ApiProtocolReturnType, ApiProtocolValue, ApiProtocol } from "../api";

/** any serializable JSON type */
export type ITransportData = ApiProtocol;
export type ITransportRequestHandler = (data: ApiProtocol) => Promise<ITransportResponse>;

export type ITransportProtocol_Api = {
    uuid: PlainUUID,
    api: ApiProtocol,
};

export type ITransportProtocol_Return = {
    uuid: PlainUUID,
    return: ApiProtocolReturnType,
};

export type ITransportProtocol_Exception = {
    uuid: PlainUUID,
    exception: string,
};

export type ITransportProtocolReturnable = ITransportProtocol_Return | ITransportProtocol_Exception;

export type ITransportProtocol =
    ITransportProtocol_Api |
    ITransportProtocol_Return |
    ITransportProtocol_Exception
;

export type ITransportResponse_Return = {
    return: ApiProtocolReturnType,
};

export type ITransportResponse_Exception = {
    exception: string,
};

export type ITransportResponse =
    ITransportResponse_Return |
    ITransportResponse_Exception
;

export function transportProtocolToResponse(protocol: ITransportProtocolReturnable): ITransportResponse {
    if ('exception' in protocol) {
        return { exception: protocol.exception };
    } else {
        return { return: protocol.return };
    }
}

export function isTransportProtocolReturnable(protocol: ITransportProtocol): protocol is ITransportProtocolReturnable {
    return ('exception' in protocol || 'return' in protocol);
}

export function isTransportProtocolApi(protocol: ITransportProtocol): protocol is ITransportProtocol_Api {
    return ('api' in protocol);
}

export interface ITransportConfigurable {
    setConfig(config: Config): Promise<void>|void;
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
export interface ITransport extends ITransportMaster, ITransportSlave {}