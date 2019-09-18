import { Api } from "../api";
import { DuplexStreamTransport } from "../duplex-stream.transport";
import { simpleCrossStream } from "../stream.utils";
import { ITransportProtocol } from "../transport";

function remoteSum(a: number, b: number, sumCallback: (result: number) => void, mulCallback: (result: number) => void) {
    console.log(`remoteSum(${a}, ${b})`);
    sumCallback(a + b);
    mulCallback(a * b);
    mulCallback(a * b + 5);
    return 'hello world!';
}

(async function main() {
    const session = simpleCrossStream<ITransportProtocol>();

    const localStreamTransport = new DuplexStreamTransport(session, undefined, 'local');
    const localApi = new Api<{ remoteSum: typeof remoteSum }, {}>({}, localStreamTransport);

    const remoteStreamTransport = new DuplexStreamTransport(session, undefined, 'remote');
    const remoteApi = new Api<{}, { remoteSum: typeof remoteSum }>({
        remoteSum,
    }, remoteStreamTransport);

    const result = await localApi.callMethod(
        'remoteSum',    // Remote api method
        10,             // argument `a`
        20,             // argument `b`
        sumResult => console.log('sum:', sumResult),    // argument `sumCallback`
        mulResult => console.log('mul:', mulResult)     // argument `mulCallback`
    );

    console.log('result', result);
})();