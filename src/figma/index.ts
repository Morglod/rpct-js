import { EventEmitter } from 'tsee';

import { DefaultMethodMap, Api } from '../api';
import { StreamTransport } from '../transports/stream';
import { createWindowReadStream, createWindowWriteStream } from '../streams/dom-window';
import { StreamReadableEvents } from '../streams/istream';
import { ITransportProtocol } from '../transports/itransport';

import { FigmaPluginWriteStream } from './utils';

export async function connectToPlugin<
    PluginMethods extends DefaultMethodMap,
    UIMethods extends DefaultMethodMap,
>(uiMethods: UIMethods): Promise<Api<PluginMethods, UIMethods>> {
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

    const api = new Api<PluginMethods, UIMethods>(Object.assign(uiMethods, {

    }), streamTransport);

    return new Promise(async resolve => {
        let connecting = true;
        while(connecting) {
            (api.call as any)('$connectToUI_handshake', () => {
                connecting = false;
                resolve(api);
            });
            await new Promise(r => setTimeout(r, 200));
        }
    });
}

export async function connectToUI<
    PluginMethods extends DefaultMethodMap,
    UIMethods extends DefaultMethodMap,
>(
    figma: { ui: {
        postMessage(data:any): void,
        onmessage?(pluginMessage: any, props: any): void,
    }},
    pluginMethods: PluginMethods,
): Promise<Api<UIMethods, PluginMethods>> {
    const wstream = new FigmaPluginWriteStream(figma);
    const rstream = new EventEmitter<StreamReadableEvents<ITransportProtocol>>();

    figma.ui.onmessage = msg => {
        rstream.emit('data', msg);
    };

    const streamTransport = new StreamTransport(rstream, wstream, undefined, 'plugin back');

    return new Promise(resolve => {
        let isConnected = false;
        const api = new Api<UIMethods, PluginMethods>(Object.assign(pluginMethods, {
            $connectToUI_handshake(connected: Function) {
                if (isConnected) return;
                isConnected = true;
                connected();
                resolve(api);
            }
        }), streamTransport);
    });
}