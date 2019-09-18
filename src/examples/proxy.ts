import { Api } from "../api";
import { crossJsonSocket } from './test-connections';
import { callbacksMiddleware } from "../middlewares/callbacks";
import { proxyObjMiddleware, RemoteProxyObj } from "../middlewares/proxy-obj";

const NUM_CALLS = 1;
const SOCKET_PATH = './bench-socket-' + Date.now();

async function remoteCall(x: RemoteProxyObj<{ a: number, b: number, c: (z: number) => number }>) {
    console.log('remoteCall aaaaa', await x.a());
    const sum = await x.a() + await x.b();
    return x.c(sum);
}

type RemoteApi = {
    remoteCall(x: RemoteProxyObj<{ a: number, b: number, c: (z: number) => number }>): Promise<number>;
};

(async function main() {
    const {
        clientStream,
        serverConStream,
    } = await crossJsonSocket(SOCKET_PATH);

    // DefaultConfig.debug = true;

    const localProxyMiddleware = proxyObjMiddleware();
    const remoteProxyMiddleware = proxyObjMiddleware();

    const localApi = new Api<RemoteApi, {}>({}, clientStream, {
        middlewares: [
            callbacksMiddleware().middleware,
            localProxyMiddleware.middleware,
        ]
    });

    const remoteApi = new Api<{}, RemoteApi>({
        remoteCall,
    }, serverConStream, {
        middlewares: [
            callbacksMiddleware().middleware,
            remoteProxyMiddleware.middleware,
        ]
    });

    let bestTime = Number.MAX_SAFE_INTEGER;
    let worsTime = Number.MIN_SAFE_INTEGER;

    let totalMs = 0;

    for (let i = 0; i < NUM_CALLS; ++i) {
        const a = Math.random();
        const b = Math.random();

        const start = process.hrtime();

        const x = localProxyMiddleware.serveProxyObj({
            a: 10,
            b: 20,
            c: (z: number) => {
                console.log('zzz', z);
                return z;
            }
        });

        try {
            const r = await localApi.call('remoteCall', x);
            console.log('returned', r);
        } catch (err) {
            console.log('callerr', err);
        }

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
