import { describe, it, expect } from 'vitest';

describe('toolchain smoke test', () => {
  it('Vitest runs', () => {
    expect(1 + 1).toBe(2);
  });

  it('TypeScript types work', () => {
    const sum = (a: number, b: number): number => a + b;
    expect(sum(2, 3)).toBe(5);
  });
});
