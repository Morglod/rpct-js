import { UUIDGeneratorFactory } from "./utils/utils";
export declare type Config = {
    version: string;
    debug: boolean;
    uuidGeneratorFactory: UUIDGeneratorFactory;
};
export declare const DefaultConfig: Config;
