import { Config } from "./config";
import { PodJSON, PlainUUID } from "./types";
/** any serializable JSON type */
export declare type ITransportData = PodJSON;
export declare type ITransportRequestHandler = (data: ITransportData) => Promise<ITransportResponse>;
export declare type ITransportProtocol = {
    uuid: PlainUUID;
    data: ITransportData;
};
export declare type ITransportResponse = {
    data: ITransportData;
    exception?: string;
};
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
