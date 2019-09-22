import { Api } from "../api";
import { simpleCrossStream } from "../streams/utils";
import { ITransportProtocol } from "../transports/itransport";
import { DuplexStreamTransport } from "../transports/duplex-stream";

function remoteSum(a: number, b: number, sumCallback: (result: number) => void, mulCallback: (result: number) => void) {
    console.log(`remoteSum(${a}, ${b})`);
    sumCallback(a + b);
    mulCallback(a * b);
    mulCallback(a * b + 5);
    return 'hello world!';
}

it('main', async () => {
    const session = simpleCrossStream<ITransportProtocol>();

    const localStreamTransport = new DuplexStreamTransport(session.a, undefined, 'local');
    const localApi = new Api<{ remoteSum: typeof remoteSum }, {}>({}, localStreamTransport);

    const remoteStreamTransport = new DuplexStreamTransport(session.b, undefined, 'remote');
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

    expect(result).toBe('hello world!');
});
