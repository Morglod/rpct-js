"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tsee_1 = require("tsee");
const api_1 = require("../api");
const stream_1 = require("../transports/stream");
const dom_window_1 = require("../streams/dom-window");
const utils_1 = require("./utils");
function connectToPlugin(uiMethods) {
    const rstream = dom_window_1.createWindowReadStream(window, {
        unpack: evt => (evt.data).pluginMessage,
    }).stream;
    const wstream = dom_window_1.createWindowWriteStream(parent, {
        pack: (payload) => ({ pluginMessage: payload }),
    });
    const streamTransport = new stream_1.StreamTransport(rstream, wstream, undefined, 'plugin ui');
    // connected api
    return new api_1.Api(uiMethods, streamTransport);
}
exports.connectToPlugin = connectToPlugin;
function connectToUI(figma, pluginMethods) {
    const wstream = new utils_1.FigmaPluginWriteStream(figma);
    const rstream = new tsee_1.EventEmitter();
    figma.ui.onmessage = msg => {
        rstream.emit('data', msg);
    };
    const streamTransport = new stream_1.StreamTransport(rstream, wstream, undefined, 'plugin back');
    return new api_1.Api(pluginMethods, streamTransport);
}
exports.connectToUI = connectToUI;
