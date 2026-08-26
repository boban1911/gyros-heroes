import { vi } from 'vitest';

/**
 * Lightweight scripted Drizzle-shaped mock for the Neon HTTP client exposed
 * by `db/client.ts`. Production code awaits each chain (e.g.
 * `await db.select(cols).from(t).where(c).limit(1)`), so every chain method
 * returns a Thenable that, when awaited, pops the next scripted result off a
 * FIFO queue.
 *
 * Usage in tests:
 *   const dbMock = createFakeDb();
 *   dbMock.queue.push([{ id: 'abc' }]);  // first awaited query result
 *   dbMock.queue.push([]);               // second awaited query result
 *   ...
 *
 * Spies on the entry methods (`select`, `insert`, `update`, `delete`) and on
 * the per-call `.values`, `.set`, `.where`, etc. let tests assert which
 * tables / values were involved without simulating SQL semantics.
 *
 * Inserts/updates/deletes that aren't `.returning()` resolve to `undefined`
 * if the next queue entry is missing; otherwise they consume the entry like
 * a select.
 */

export interface FakeDb {
  /** FIFO queue of awaited results; each entry corresponds to one awaited chain. */
  queue: unknown[];
  /** Entry-method spies — assert table arguments, call counts, etc. */
  selectSpy: ReturnType<typeof vi.fn>;
  insertSpy: ReturnType<typeof vi.fn>;
  updateSpy: ReturnType<typeof vi.fn>;
  deleteSpy: ReturnType<typeof vi.fn>;
  /** All `.values()` payloads passed during the test, in call order. */
  insertValues: unknown[];
  /** All `.set()` payloads passed during the test, in call order. */
  updateSets: unknown[];
  /** Drizzle-shaped client to inject in `vi.mock('../../db/client', ...)`. */
  db: Record<string, unknown>;
}

export function createFakeDb(): FakeDb {
  const queue: unknown[] = [];
  const insertValues: unknown[] = [];
  const updateSets: unknown[] = [];

  function makeChain(): unknown {
    const passthrough = [
      'from',
      'where',
      'innerJoin',
      'leftJoin',
      'orderBy',
      'limit',
      'returning',
      'groupBy',
      'onConflictDoUpdate',
      'onConflictDoNothing',
    ];
    const chain: Record<string, unknown> = {};
    for (const method of passthrough) {
      chain[method] = vi.fn(() => chain);
    }
    chain['values'] = vi.fn((payload: unknown) => {
      insertValues.push(payload);
      return chain;
    });
    chain['set'] = vi.fn((payload: unknown) => {
      updateSets.push(payload);
      return chain;
    });
    chain['then'] = (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) => {
      try {
        const next = queue.shift();
        return Promise.resolve(next).then(resolve, reject);
      } catch (err) {
        return Promise.reject(err).then(resolve, reject);
      }
    };
    return chain;
  }

  const selectSpy = vi.fn(() => makeChain());
  const insertSpy = vi.fn(() => makeChain());
  const updateSpy = vi.fn(() => makeChain());
  const deleteSpy = vi.fn(() => makeChain());

  return {
    queue,
    selectSpy,
    insertSpy,
    updateSpy,
    deleteSpy,
    insertValues,
    updateSets,
    db: {
      select: selectSpy,
      insert: insertSpy,
      update: updateSpy,
      delete: deleteSpy,
    },
  };
}
