import { DefaultMethodMap, Api } from './api';
export * from './browser';
export * from './figma-utils';
export declare function connectToPlugin<PluginMethods extends DefaultMethodMap, UIMethods extends DefaultMethodMap>(uiMethods: UIMethods): Api<PluginMethods, UIMethods>;
export declare function connectToUI<PluginMethods extends DefaultMethodMap, UIMethods extends DefaultMethodMap>(figma: {
    ui: {
        postMessage(data: any): void;
        onmessage(msg: any): void;
    };
}, pluginMethods: PluginMethods): void;
