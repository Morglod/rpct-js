import { hyperidUUIDGenerator } from "../../utils/hyperuuid";

it('hyperuuids', () => {
    const generator = hyperidUUIDGenerator();
    expect(generator).toBeInstanceOf(Function);

    for (let i = 0; i < 10; ++i) {
        const x = generator();
        expect(x).toBeDefined();
        expect(typeof x).toBe('string');
    }
});