import {cloneJSON, simpleCountGenerator, unsafeUUIDGenerator} from '../../utils/utils';

it('clone plain json', () => {
    const x = { a: { b: [123,{c:'hello'}]}};
    const y = cloneJSON(x);

    expect(x).toMatchObject(y);
});

it('simple counter generator', () => {
    const counter = simpleCountGenerator();

    expect(counter).toBeInstanceOf(Function);

    const generated: number[] = [];

    for (let i = 0; i < 20; ++i) {
        const x = counter();
        expect(typeof x).toBe('number');
        expect(generated.includes(x)).toBe(false);
        generated.push(x);
    }
});

it('simple counter generator max_safe', () => {
    const counter = simpleCountGenerator(Number.MAX_SAFE_INTEGER);

    expect(counter).toBeInstanceOf(Function);

    const generated: number[] = [];

    for (let i = 0; i < 20; ++i) {
        const x = counter();
        expect(typeof x).toBe('number');
        expect(generated.includes(x)).toBe(false);
        generated.push(x);
    }
});

it('unsafe uuid generator', () => {
    const uuidgen = unsafeUUIDGenerator();

    expect(uuidgen).toBeInstanceOf(Function);

    const generated: any[] = [];

    for (let i = 0; i < 20; ++i) {
        const x = uuidgen();
        expect(typeof x).toBe('string');
        expect(generated.includes(x)).toBe(false);
        generated.push(x);
    }
});