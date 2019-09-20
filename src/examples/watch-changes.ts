import { Api } from "../api";
import { simpleCrossStream } from "../streams/utils";
import { ITransportProtocol } from "../transports/itransport";
import { proxyMapRemote } from "../utils/proxy-map-api";
import { DuplexStreamTransport } from "../transports/duplex-stream";
import { watchProperty } from "../utils/watch-prop";
import { DefaultConfig } from "../config";

const session = simpleCrossStream<ITransportProtocol>();

type ApiSchema = {
    listenCounter(
        onChange: (x: number) => void,
    ): void;
};

(async function server() {
    // counter
    let counter = 0;
    setInterval(() => counter++, 1000);

    function listenCounter(onChange: (x: number) => void) {
        return new Promise(resolve => {
            watchProperty(() => counter).on('change', onChange);
        });
    }

    const remoteStreamTransport = new DuplexStreamTransport(session.a, undefined, 'remote');
    const remoteApi = new Api<{}, ApiSchema>({
        listenCounter,
    }, remoteStreamTransport);
})();

(async function client() {
    const localStreamTransport = new DuplexStreamTransport(session.b, undefined, 'local');
    const localApi = new Api<ApiSchema, {}>({}, localStreamTransport);

    const api = proxyMapRemote(localApi);

    api.listenCounter(counter => {
        console.log('counter', counter);
    });
})();