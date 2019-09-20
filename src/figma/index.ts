import { DefaultMethodMap, Api } from '../api';
import { StreamTransport } from '../stream.transport';
import { createWindowReadStream, createWindowWriteStream } from '../window.stream';
import { FigmaPluginWriteStream } from './utils';
import { EventEmitter } from 'tsee';
import { StreamReadableEvents } from '../stream.types';
import { ITransportProtocol } from '../transport';

export function connectToPlugin<
    PluginMethods extends DefaultMethodMap,
    UIMethods extends DefaultMethodMap,
>(uiMethods: UIMethods) {
    const rstream = createWindowReadStream(window, {
        unpack: evt => (evt.data).pluginMessage,
    }).stream;

    const wstream = createWindowWriteStream(parent, {
        pack: (payload) => ({ pluginMessage: payload }),
    });

    const streamTransport = new StreamTransport(
        rstream,
        wstream,
        undefined,
        'plugin ui'
    );

    // connected api
    return new Api<PluginMethods, UIMethods>(uiMethods, streamTransport);
}

export function connectToUI<
    PluginMethods extends DefaultMethodMap,
    UIMethods extends DefaultMethodMap,
>(
    figma: { ui: {
        postMessage(data:any): void,
        onmessage?(pluginMessage: any, props: any): void,
    }},
    pluginMethods: PluginMethods,
) {
    const wstream = new FigmaPluginWriteStream(figma);
    const rstream = new EventEmitter<StreamReadableEvents<ITransportProtocol>>();

    figma.ui.onmessage = msg => {
        rstream.emit('data', msg);
    };

    const streamTransport = new StreamTransport(rstream, wstream, undefined, 'plugin back');

    return new Api<UIMethods, PluginMethods>(pluginMethods, streamTransport);
}