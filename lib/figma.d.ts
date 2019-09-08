import { DefaultMethodMap, Api } from './api';
export * from './browser';
export * from './figma-utils';
export declare function connectToPlugin<PluginMethods extends DefaultMethodMap, UIMethods extends DefaultMethodMap>(uiMethods: UIMethods): Api<PluginMethods, UIMethods>;
export declare function connectToUI<PluginMethods extends DefaultMethodMap, UIMethods extends DefaultMethodMap>(figma: {
    ui: {
        postMessage(data: any): void;
        onmessage?(pluginMessage: any, props: any): void;
    };
}, pluginMethods: PluginMethods): Api<UIMethods, PluginMethods>;
