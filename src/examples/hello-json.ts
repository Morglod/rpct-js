import { Api } from "../api";
import { DuplexJsonStreamTransport } from "../duplex-json-stream.transport";
import { simpleCrossStream } from "../streams";

function remoteSum(a: number, b: number, cb: (result: number) => void) {
    console.log(`remoteSum(${a}, ${b}, cb)`);
    cb(a + b);
}

(async function main() {
    const session = simpleCrossStream();

    const localStreamTransport = new DuplexJsonStreamTransport(session, undefined, 'local');
    const localApi = new Api<{ remoteSum: typeof remoteSum }, {}>({}, localStreamTransport);

    const remoteStreamTransport = new DuplexJsonStreamTransport(session, undefined, 'remote');
    const remoteApi = new Api<{}, { remoteSum: typeof remoteSum }>({
        selfMethods: {
            remoteSum,
        }
    }, remoteStreamTransport);

    localApi.callMethod('remoteSum', 10, 20, result => {
        console.log('answer:', result);
    });
})();