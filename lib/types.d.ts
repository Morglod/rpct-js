declare type _POD_ = string | number | boolean | undefined | null;
declare type _POD_A = _POD_[] | _POD_;
export declare type PodJSON = _POD_A | {
    [x in string | number]: PodJSON;
} | {
    [x in string | number]: PodJSON[];
} | {
    [x in string | number]: PodJSON;
}[] | {
    [x in string | number]: PodJSON[];
}[];
export {};
