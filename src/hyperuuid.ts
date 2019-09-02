import { default as hyperid } from 'hyperid';
import { UUIDGenerator } from './utils';

export function hyperidUUIDGenerator(): UUIDGenerator {
    const instance = hyperid({ fixedLength: true });

    return () => instance();
}