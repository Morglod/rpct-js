import { UUIDGeneratorFactory, unsafeUUIDGenerator } from "./utils/utils";

export type Config = {
    version: string,
    debug: boolean,
    uuidGeneratorFactory: UUIDGeneratorFactory,
};

export const DefaultConfig: Config = {
    version: '0.1.0',
    debug: false,
    uuidGeneratorFactory: unsafeUUIDGenerator,
};
