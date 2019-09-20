"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
const stream_transport_1 = require("../stream.transport");
const window_stream_1 = require("../window.stream");
const utils_1 = require("./utils");
const tsee_1 = require("tsee");
function connectToPlugin(uiMethods) {
    const rstream = window_stream_1.createWindowReadStream(window, {
        unpack: evt => (evt.data).pluginMessage,
    }).stream;
    const wstream = window_stream_1.createWindowWriteStream(parent, {
        pack: (payload) => ({ pluginMessage: payload }),
    });
    const streamTransport = new stream_transport_1.StreamTransport(rstream, wstream, undefined, 'plugin ui');
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
    const streamTransport = new stream_transport_1.StreamTransport(rstream, wstream, undefined, 'plugin back');
    return new api_1.Api(pluginMethods, streamTransport);
}
exports.connectToUI = connectToUI;
