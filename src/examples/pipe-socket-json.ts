import * as net from 'net';
import * as path from 'path';
const jsonStream = require('duplex-json-stream');

import { Api } from "../api";
import { DuplexJsonStreamTransport } from "../transports/duplex-json-stream";
import { asDuplexStream } from "../streams/istream";

function remoteSum(a: number, b: number, cb: (result: number) => void) {
    console.log(`remoteSum(${a}, ${b}, cb)`);
    cb(a + b);
}

const WINDOWS = 0;
const SOCKET_PATH = WINDOWS ? path.join('\\\\?\\pipe', process.cwd(), 'myctl') : './test-socket';

(async function main() {
    const srv = await server();
    const conn = await client();
})();

async function client() {
    return new Promise(resolve => {
        const conn = net.connect(SOCKET_PATH, async () => {
            const chain = jsonStream(conn);

            const localStreamTransport = new DuplexJsonStreamTransport(asDuplexStream(chain), undefined, 'local');
            const localApi = new Api<{ remoteSum: typeof remoteSum }, {}>({}, localStreamTransport);
        
            await new Promise(rr => {
                localApi.callMethod('remoteSum', 10, 20, result => {
                    console.log('answer:', result);
                    rr();
                });
            });

            resolve(conn);
        }).on('error', err => {
            console.log('failed connect');
            console.error(err);
        });;
    })
}

async function server() {
    return new Promise(resolve => {
        const srv = net.createServer(socket => {
            const chain = jsonStream(socket);
            const remoteStreamTransport = new DuplexJsonStreamTransport(asDuplexStream(chain), undefined, 'remote');
            const remoteApi = new Api<{}, { remoteSum: typeof remoteSum }>({
                remoteSum,
            }, remoteStreamTransport);
        }).listen(SOCKET_PATH, () => {
            console.log('server listening');
            resolve(srv);
        }).on('error', err => {
            console.log('failed createServer');
            console.error(err);
        });
    });
}