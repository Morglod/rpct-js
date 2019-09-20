"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const duplex_json_stream_1 = require("../transports/duplex-json-stream");
const istream_1 = require("../streams/istream");
const net = __importStar(require("net"));
const message_pack_transform_1 = require("./message-pack-transform");
const stream_1 = require("../transports/stream");
const jsonStream = require('duplex-json-stream');
function connectToJsonSocket(socketPath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => {
            const conn = net.connect(socketPath, () => __awaiter(this, void 0, void 0, function* () {
                const chain = jsonStream(conn);
                const localStreamTransport = new duplex_json_stream_1.DuplexJsonStreamTransport(istream_1.asDuplexStream(chain), undefined, 'local');
                resolve(localStreamTransport);
            })).on('error', err => {
                console.log('failed connect');
                console.error(err);
            });
            ;
        });
    });
}
exports.connectToJsonSocket = connectToJsonSocket;
function createJsonSocketServer(socketPath, onConnection) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => {
            const srv = net.createServer(socket => {
                const chain = jsonStream(socket);
                const remoteStreamTransport = new duplex_json_stream_1.DuplexJsonStreamTransport(istream_1.asDuplexStream(chain), undefined, 'remote');
                onConnection(remoteStreamTransport);
            }).listen(socketPath, () => {
                console.log('server listening');
                resolve(srv);
            }).on('error', err => {
                console.log('failed createServer');
                console.error(err);
            });
        });
    });
}
exports.createJsonSocketServer = createJsonSocketServer;
function connectToMsgPackSocket(socketPath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => {
            const conn = net.connect(socketPath, () => __awaiter(this, void 0, void 0, function* () {
                const { encodeStream, decodeStream } = message_pack_transform_1.messagePackTransforms();
                const readable = conn.pipe(decodeStream);
                const writable = encodeStream;
                writable.pipe(conn);
                const localStreamTransport = new stream_1.StreamTransport(readable, writable, undefined, 'local');
                resolve(localStreamTransport);
            })).on('error', err => {
                console.log('failed connect');
                console.error(err);
            });
            ;
        });
    });
}
exports.connectToMsgPackSocket = connectToMsgPackSocket;
function createMsgPackSocketServer(socketPath, onConnection) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => {
            const srv = net.createServer(socket => {
                const { encodeStream, decodeStream } = message_pack_transform_1.messagePackTransforms();
                const readable = socket.pipe(decodeStream);
                const writable = encodeStream;
                writable.pipe(socket);
                const remoteStreamTransport = new stream_1.StreamTransport(readable, writable, undefined, 'remote');
                onConnection(remoteStreamTransport);
            }).listen(socketPath, () => {
                console.log('server listening');
                resolve(srv);
            }).on('error', err => {
                console.log('failed createServer');
                console.error(err);
            });
        });
    });
}
exports.createMsgPackSocketServer = createMsgPackSocketServer;
function crossJsonSocket(socketPath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => {
            const handleConnection = (transport) => __awaiter(this, void 0, void 0, function* () {
                const client = yield clientPromise;
                resolve({
                    clientStream: client,
                    serverConStream: transport,
                });
            });
            createJsonSocketServer(socketPath, handleConnection);
            const clientPromise = connectToJsonSocket(socketPath);
        });
    });
}
exports.crossJsonSocket = crossJsonSocket;
function crossMsgPackSocket(socketPath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => {
            const handleConnection = (transport) => __awaiter(this, void 0, void 0, function* () {
                const client = yield clientPromise;
                resolve({
                    clientStream: client,
                    serverConStream: transport,
                });
            });
            createMsgPackSocketServer(socketPath, handleConnection);
            const clientPromise = connectToMsgPackSocket(socketPath);
        });
    });
}
exports.crossMsgPackSocket = crossMsgPackSocket;
