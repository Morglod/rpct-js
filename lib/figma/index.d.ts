import { DefaultMethodMap, Api } from '../api';
export declare function connectToPlugin<PluginMethods extends DefaultMethodMap, UIMethods extends DefaultMethodMap>(uiMethods: UIMethods): Promise<Api<PluginMethods, UIMethods>>;
export declare function connectToUI<PluginMethods extends DefaultMethodMap, UIMethods extends DefaultMethodMap>(figma: {
    ui: {
        postMessage(data: any): void;
        onmessage?(pluginMessage: any, props: any): void;
    };
}, pluginMethods: PluginMethods): Promise<Api<UIMethods, PluginMethods>>;
