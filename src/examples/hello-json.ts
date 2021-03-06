import { Api } from "../api";
import { simpleCrossStream } from "../streams/utils";
import { DuplexStreamTransport } from "../transports/duplex-stream";

function remoteSum(a: number, b: number, cb: (result: number) => void) {
    console.log(`remoteSum(${a}, ${b}, cb)`);
    cb(a + b);
}

(async function main() {
    const session = simpleCrossStream();

    const localStreamTransport = new DuplexStreamTransport(session.a, undefined, 'local');
    const localApi = new Api<{ remoteSum: typeof remoteSum }, {}>({}, localStreamTransport);

    const remoteStreamTransport = new DuplexStreamTransport(session.b, undefined, 'remote');
    const remoteApi = new Api<{}, { remoteSum: typeof remoteSum }>({
        remoteSum,
    }, remoteStreamTransport);

    localApi.callMethod('remoteSum', 10, 20, result => {
        console.log('answer:', result);
    });
})();