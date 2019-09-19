import { Api } from "../api";
import { simpleCrossStream } from "../stream.utils";
import { ITransportProtocol } from "../transport";
import { proxyMapRemote } from "../proxy-map-api";
import { DuplexStreamTransport } from "../duplex-stream.transport";

const session = simpleCrossStream<ITransportProtocol>();

type ApiSchema = {
    sum(
        a: number,
        b: number,
        sumCallback: (result: number) => void,
        mulCallback: (result: number) => void,
    ): string;
};

(async function server() {
    function sum(a: number, b: number, sumCallback: (result: number) => void, mulCallback: (result: number) => void) {
        console.log(`remoteSum(${a}, ${b})`);
        sumCallback(a + b);
        mulCallback(a * b);
        mulCallback(a * b + 5);
        return 'hello world!';
    }

    const remoteStreamTransport = new DuplexStreamTransport(session.a, undefined, 'remote');
    const remoteApi = new Api<{}, ApiSchema>({
        sum,
    }, remoteStreamTransport);
})();

(async function client() {
    const localStreamTransport = new DuplexStreamTransport(session.b, undefined, 'local');
    const localApi = new Api<ApiSchema, {}>({}, localStreamTransport);

    const api = proxyMapRemote(localApi);

    const result = await api.sum(
        10,
        20,
        sumResult => console.log('sum:', sumResult),
        mulResult => console.log('mul:', mulResult),
    );

    console.log('result', result);
})();