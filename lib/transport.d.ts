import { Config } from "./config";
import { TicketListUUID } from "./ticket-list";
import { PodJSON } from "./types";
/** any serializable JSON type */
export declare type ITransportData = Exclude<PodJSON, null | undefined>;
export declare type ITransportRequestHandler = (data: ITransportData) => Promise<ITransportData>;
export declare type ITransportProtocol = {
    uuid: TicketListUUID;
    data: ITransportData;
};
export interface ITransportConfigurable {
    setConfig(config: Config): Promise<void> | void;
}
export interface ITransportMaster extends ITransportConfigurable {
    /** make request to remote connected slave */
    request<Data extends ITransportData>(data: Data): Promise<ITransportData>;
}
export interface ITransportSlave extends ITransportConfigurable {
    /** handle request from remote connected master with request handler */
    setRequestHandler(handler: ITransportRequestHandler): void;
    getRequestHandler(): ITransportRequestHandler;
}
/** Master + Slave */
export interface ITransport extends ITransportMaster, ITransportSlave {
}
