import { Config } from "./config";
import { TicketListUUID } from "./ticket-list";

type _POD_ = string|number|boolean|undefined|null;
type _POD_A = _POD_[]|_POD_;

export type PodJSON =
    _POD_A|
    { [x in string|number]: PodJSON }|
    { [x in string|number]: PodJSON[] }|
    { [x in string|number]: PodJSON }[]|
    { [x in string|number]: PodJSON[] }[];

/** any serializable JSON type */
export type ITransportData = Exclude<PodJSON, null|undefined>;
export type ITransportRequestHandler = (data: ITransportData) => Promise<ITransportData>;

export type ITransportProtocol = {
    uuid: TicketListUUID,
    data: ITransportData,
};

export interface ITransportConfigurable {
    setConfig(config: Config): Promise<void>|void;
}

export interface ITransportMaster extends ITransportConfigurable {
    /** make request to remote connected slave */
    request<Data extends ITransportData>(data: Data): Promise<ITransportData>;
}

export interface ITransportSlave extends ITransportConfigurable {
    /** handle request from remote connected master */
    setRequestHandler(handler: ITransportRequestHandler): void;
    getRequestHandler(): ITransportRequestHandler;
}

/** Master + Slave */
export interface ITransport extends ITransportMaster, ITransportSlave {}