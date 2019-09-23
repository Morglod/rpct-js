"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsee_1 = require("tsee");
const api_1 = require("../api");
const stream_1 = require("../transports/stream");
const dom_window_1 = require("../streams/dom-window");
const utils_1 = require("./utils");
function connectToPlugin(uiMethods) {
    return __awaiter(this, void 0, void 0, function* () {
        const rstream = dom_window_1.createWindowReadStream(window, {
            unpack: evt => (evt.data).pluginMessage,
        }).stream;
        const wstream = dom_window_1.createWindowWriteStream(parent, {
            pack: (payload) => ({ pluginMessage: payload }),
        });
        const streamTransport = new stream_1.StreamTransport(rstream, wstream, undefined, 'plugin ui');
        const api = new api_1.Api(Object.assign(uiMethods, {}), streamTransport);
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            let connecting = true;
            while (connecting) {
                api.call('$connectToUI_handshake', () => {
                    connecting = false;
                    resolve(api);
                });
                yield new Promise(r => setTimeout(r, 200));
            }
        }));
    });
}
exports.connectToPlugin = connectToPlugin;
function connectToUI(figma, pluginMethods) {
    return __awaiter(this, void 0, void 0, function* () {
        const wstream = new utils_1.FigmaPluginWriteStream(figma);
        const rstream = new tsee_1.EventEmitter();
        figma.ui.onmessage = msg => {
            rstream.emit('data', msg);
        };
        const streamTransport = new stream_1.StreamTransport(rstream, wstream, undefined, 'plugin back');
        return new Promise(resolve => {
            let isConnected = false;
            const api = new api_1.Api(Object.assign(pluginMethods, {
                $connectToUI_handshake(connected) {
                    if (isConnected)
                        return;
                    isConnected = true;
                    connected();
                    resolve(api);
                }
            }), streamTransport);
        });
    });
}
exports.connectToUI = connectToUI;
