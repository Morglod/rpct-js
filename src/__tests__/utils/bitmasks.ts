import { bitmaskMap } from "../../utils/bitmasks";

it('bitmasks 0', () => {
    const x = bitmaskMap([ 'a', 'b', 'c', 'd', 'e' ] as const);

    expect(x).toBeDefined();
    expect(x.a).toBe(1);
    expect(x.b).toBe(2);
    expect(x.c).toBe(4);
    expect(x.d).toBe(8);
    expect(x.e).toBe(16);
});

it('bitmasks with offsets', () => {
    for (let i = 3; i < 20; ++i) {
        const x = bitmaskMap([ 'a', 'b', 'c', 'd', 'e' ] as const, i);
    
        expect(x).toBeDefined();
        expect(x.a).toBe(1<<(0+i));
        expect(x.b).toBe(1<<(1+i));
        expect(x.c).toBe(1<<(2+i));
        expect(x.d).toBe(1<<(3+i));
        expect(x.e).toBe(1<<(4+i));
    }
});