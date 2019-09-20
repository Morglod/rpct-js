import { Config } from "./config";
import { PodJSON, PlainUUID } from "./types";

/** any serializable JSON type */
export type ITransportData = PodJSON;
export type ITransportRequestHandler = (data: ITransportData) => Promise<ITransportResponse>;

export type ITransportProtocol = {
    uuid: PlainUUID,
    data: ITransportData,
};

export type ITransportResponse = {
    data: ITransportData,
    exception?: string,
};

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