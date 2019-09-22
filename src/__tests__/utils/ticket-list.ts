import { TicketListAnswerError, TicketList } from "../../utils/ticket-list";

it('TicketListAnswerError', () => {
    for (let i = 0; i < 10; ++i) {
        try {
            throw new TicketListAnswerError('error' + i, 'x' + i);
        } catch (err) {
            const x = err as TicketListAnswerError;
            expect(x).toBeInstanceOf(TicketListAnswerError);
            expect(x.message).toBe('error' + i);
            expect(x.uuid).toBe('x' + i);
        }
    }
});

it('TicketList.ask', () => {
    const tl = new TicketList<string>();

    for (let i = 0; i < 10; ++i) {
        const myUuid = 'qweqwe'+i;
        const tr = tl.ask(myUuid);
    
        expect(tr).toBeDefined();
        expect(tr.answer).toBeInstanceOf(Promise);
        expect(tr.uuid).toBe(myUuid);

        expect(tl.hasUUID(myUuid)).toBe(true);
        expect(tl.hasUUID(myUuid+'__')).toBe(false);
    }
});

it('TicketList.answer ok', () => new Promise(resolve => {
    const tl = new TicketList<string>();

    const pending: Promise<string>[] = [];
    for (let i = 0; i < 10; ++i) {
        const myUuid = 'qweqwe'+i;
        const x = tl.ask(myUuid);
        pending.push(x.answer);
    }

    setTimeout(async () => {
        for (let i = 0; i < 10; ++i) {
            const myUuid = 'qweqwe'+i;
            tl.answer(myUuid, 'hello'+i);

            const xr = await pending[i];
            expect(xr).toBe('hello'+i);
        }

        resolve();
    }, 200);
}));

it('TicketList.answer bad', () => new Promise(resolve => {
    const tl = new TicketList<string>();

    const pending: Promise<string>[] = [];
    for (let i = 0; i < 10; ++i) {
        const myUuid = 'qweqwe'+i;
        const x = tl.ask(myUuid);
        pending.push(x.answer);
    }

    setTimeout(async () => {
        for (let i = 10; i < 20; ++i) {
            const myUuid = 'qweqwe'+i;
            
            try {
                tl.answer(myUuid, 'hello'+i);
            } catch(err) {
                expect(err).toBeInstanceOf(TicketListAnswerError);
            }
        }

        resolve();
    }, 200);
}));

it('TicketList.answer reject', () => new Promise(resolve => {
    const tl = new TicketList<string>();

    const pending: Promise<string>[] = [];
    for (let i = 0; i < 10; ++i) {
        const myUuid = 'qweqwe'+i;
        const x = tl.ask(myUuid);
        pending.push(x.answer);
    }

    setTimeout(async () => {
        for (let i = 0; i < 10; ++i) {
            const myUuid = 'qweqwe'+i;
            tl.rejectTicket(myUuid);

            try {
                const xr = await pending[i];
                expect(xr).toBe(false);
            } catch(err) {
                expect(true).toBe(true);
            }
        }

        resolve();
    }, 200);
}));