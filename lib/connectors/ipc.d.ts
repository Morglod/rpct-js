/// <reference types="node" />
import type * as child_process from 'child_process';
import type { ITransport } from '../transports/itransport';
export declare function connectToChildProcess(childProc: child_process.ChildProcess): ITransport;
export declare function connectToParentProcess(masterProc: NodeJS.Process): ITransport;
