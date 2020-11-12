"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crossMsgPackSocket = exports.crossJsonSocket = exports.createMsgPackSocketServer = exports.connectToMsgPackSocket = exports.createJsonSocketServer = exports.connectToJsonSocket = void 0;
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
