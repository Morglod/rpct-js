import { DuplexJsonStreamTransport } from "../duplex-json-stream.transport";
import { StreamTransport } from "../stream.transport";
export declare function connectToJsonSocket(socketPath: string): Promise<DuplexJsonStreamTransport>;
export declare function createJsonSocketServer(socketPath: string, onConnection: (transport: DuplexJsonStreamTransport) => void): Promise<unknown>;
export declare function connectToMsgPackSocket(socketPath: string): Promise<StreamTransport>;
export declare function createMsgPackSocketServer(socketPath: string, onConnection: (transport: StreamTransport) => void): Promise<unknown>;
export declare function crossJsonSocket(socketPath: string): Promise<{
    clientStream: DuplexJsonStreamTransport;
    serverConStream: DuplexJsonStreamTransport;
}>;
export declare function crossMsgPackSocket(socketPath: string): Promise<{
    clientStream: StreamTransport;
    serverConStream: StreamTransport;
}>;
