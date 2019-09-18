import { Api } from "../api";
import { crossJsonSocket } from './test-connections';

const NUM_CALLS = 10000;
const SOCKET_PATH = './bench-socket-' + Date.now();

function remoteCall(a: number, b: number, c: (x: number) => number) {
    return c(a+b);
}

type RemoteApi = {
    remoteCall(a: number, b: number, c: (x: number) => number): number;
};

(async function main() {

    const {
        clientStream,
        serverConStream,
    } = await crossJsonSocket(SOCKET_PATH);

    // DefaultConfig.debug = true;

    const localApi = new Api<RemoteApi, {}>({}, clientStream);

    const remoteApi = new Api<{}, RemoteApi>({
        remoteCall,
    }, serverConStream);

    let bestTime = Number.MAX_SAFE_INTEGER;
    let worsTime = Number.MIN_SAFE_INTEGER;

    let totalMs = 0;

    for (let i = 0; i < NUM_CALLS; ++i) {
        const a = Math.random();
        const b = Math.random();

        const start = process.hrtime();

        const r = await localApi.call('remoteCall', a, b, c => c);
        if (a+b !== r) throw new Error('bad result');

        const [, nanosecDiff] = process.hrtime(start);

        if (bestTime > nanosecDiff) bestTime = nanosecDiff;
        if (worsTime < nanosecDiff) worsTime = nanosecDiff;

        totalMs += nanosecDiff / 1000000;
    }

    const averageMs = totalMs / NUM_CALLS;

    console.log(`
        best time = ${bestTime / 1000000}ms
        worst time = ${worsTime / 1000000}ms
        average = ${totalMs / NUM_CALLS}ms
        average rps = ${1000 / averageMs}
    `);

    process.exit(0);
})();
