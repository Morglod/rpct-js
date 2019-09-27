import { Api } from "../api";
import { simpleCrossStream } from "../streams/utils";
import { ITransportProtocol } from "../transports/itransport";
import { DuplexStreamTransport } from "../transports/duplex-stream";
import { buffersMiddleware } from "../middlewares/buffers";

type Schema = {
    remotePrintBuffer: typeof remotePrintBuffer
};

function remotePrintBuffer(buffer: Buffer) {
    console.log('remote print buffer ', buffer);
    return buffer;
}

(async function main() {
    const session = simpleCrossStream<ITransportProtocol>();

    const localStreamTransport = new DuplexStreamTransport(session.a, undefined, 'local');
    const localApi = new Api<Schema, {}>({}, localStreamTransport);
    await localApi.addMiddleware(buffersMiddleware().middleware);
    
    const remoteStreamTransport = new DuplexStreamTransport(session.b, undefined, 'remote');
    const remoteApi = new Api<{}, Schema>({
        remotePrintBuffer,
    }, remoteStreamTransport);
    await remoteApi.addMiddleware(buffersMiddleware().middleware);

    const result = await localApi.call(
        'remotePrintBuffer',    // Remote api method
        Buffer.from([ 255, 0, 0, 255 ]),
    );

    console.log('result', result);
})();