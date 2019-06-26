import { Api } from "../api";
import { StreamIOTransport } from "../stream.transport";
import { DefaultConfig } from "../config";
import { simpleCrossStream } from "../streams";

function remoteSum(a: number, b: number, cb: (result: number) => void) {
    console.log(`remoteSum(${a}, ${b}, cb)`);
    cb(a + b);
}

(async function main() {
    // DefaultConfig.debug = true;
    DefaultConfig.uuidGeneratorFactory = () => () => `${Math.floor(Math.random()*999).toString(16)}-${Math.floor(Math.random()*999).toString(16)}-${Math.floor(Math.random()*999).toString(16)}-${Math.floor(Math.random()*999).toString(16)}`;

    const session = simpleCrossStream();

    const localStreamTransport = new StreamIOTransport(session as any, undefined, 'local');
    const localApi = new Api<{ remoteSum: typeof remoteSum }, {}>({}, localStreamTransport);

    const remoteStreamTransport = new StreamIOTransport(session as any, undefined, 'remote');
    const remoteApi = new Api<{}, { remoteSum: typeof remoteSum }>({
        selfMethods: {
            remoteSum,
        }
    }, remoteStreamTransport);

    localApi.callMethod('remoteSum', 10, 20, result => {
        console.log('answer:', result);
    });
})();