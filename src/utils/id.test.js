import { describe, it, expect } from 'vitest';
import { genId } from './id';

describe('genId', () => {
  it('문자열을 반환한다', () => {
    expect(typeof genId()).toBe('string');
  });

  it('"el_" 접두사로 시작한다', () => {
    expect(genId()).toMatch(/^el_/);
  });

  it('연속 호출 시 서로 다른 id를 반환한다', () => {
    const ids = Array.from({ length: 10 }, () => genId());
    const unique = new Set(ids);
    expect(unique.size).toBe(10);
  });

  it('id가 단조 증가한다 (나중 호출이 더 큰 숫자 접미사)', () => {
    const a = genId();
    const b = genId();
    const numA = parseInt(a.replace('el_', ''), 10);
    const numB = parseInt(b.replace('el_', ''), 10);
    expect(numB).toBeGreaterThan(numA);
  });
});
