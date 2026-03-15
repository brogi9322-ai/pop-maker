import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useAuth } from './useAuth';

// validateBizNumber는 실제 구현 사용 (Firebase 의존성 없음)
// 테스트용 유효한 사업자번호: 국세청 체크섬 통과 값
// 1234567890은 임의 값 — 실제 통과하는 번호로 교체 필요하므로 storage 모킹으로 처리
vi.mock('../utils/storage', () => ({
  validateBizNumber: vi.fn((num) => {
    // 테스트용: 10자리 숫자면 유효로 처리
    const cleaned = num.replace(/-/g, '');
    return /^\d{10}$/.test(cleaned);
  }),
}));

describe('useAuth — localStorage 비어있을 때 초기 상태', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('bizNumber 초기값이 빈 문자열이다', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.bizNumber).toBe('');
  });

  it('isBanplus 초기값이 false이다', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isBanplus).toBe(false);
  });
});

describe('useAuth — localStorage에 값이 있을 때 초기 상태', () => {
  beforeEach(() => {
    localStorage.setItem('pop_banplus', '1234567890');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('bizNumber가 localStorage 값으로 초기화된다', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.bizNumber).toBe('1234567890');
  });

  it('isBanplus가 true로 초기화된다', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isBanplus).toBe(true);
  });
});

describe('useAuth — login', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('유효한 사업자번호로 login하면 true를 반환한다', () => {
    const { result } = renderHook(() => useAuth());

    let returnVal;
    act(() => {
      returnVal = result.current.login('1234567890');
    });

    expect(returnVal).toBe(true);
  });

  it('login 성공 후 isBanplus가 true가 된다', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.login('1234567890');
    });

    expect(result.current.isBanplus).toBe(true);
  });

  it('하이픈이 포함된 사업자번호는 하이픈을 제거한 값으로 저장된다', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.login('123-45-67890');
    });

    expect(result.current.bizNumber).toBe('1234567890');
    expect(localStorage.getItem('pop_banplus')).toBe('1234567890');
  });

  it('유효하지 않은 입력으로 login하면 false를 반환한다', () => {
    const { result } = renderHook(() => useAuth());

    let returnVal;
    act(() => {
      // validateBizNumber mock이 10자리 미만을 invalid로 처리
      returnVal = result.current.login('123');
    });

    expect(returnVal).toBe(false);
  });

  it('유효하지 않은 입력으로 login해도 isBanplus가 변하지 않는다', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.login('invalid');
    });

    expect(result.current.isBanplus).toBe(false);
  });

  it('login 성공 후 localStorage에 사업자번호가 저장된다', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.login('1234567890');
    });

    expect(localStorage.getItem('pop_banplus')).toBe('1234567890');
  });
});

describe('useAuth — logout', () => {
  beforeEach(() => {
    localStorage.setItem('pop_banplus', '1234567890');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('logout 후 isBanplus가 false가 된다', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.logout();
    });

    expect(result.current.isBanplus).toBe(false);
  });

  it('logout 후 bizNumber가 빈 문자열이 된다', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.logout();
    });

    expect(result.current.bizNumber).toBe('');
  });

  it('logout 후 localStorage에서 pop_banplus 항목이 제거된다', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.logout();
    });

    expect(localStorage.getItem('pop_banplus')).toBeNull();
  });
});
