import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useToast } from './useToast';

describe('useToast — 초기 상태', () => {
  it('초기에 토스트 목록이 비어있다', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toHaveLength(0);
  });
});

describe('useToast — toast 편의 메서드', () => {
  it('toast.success 호출 시 type이 success인 토스트가 추가된다', () => {
    const { result } = renderHook(() => useToast());

    act(() => { result.current.toast.success('저장 완료'); });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      message: '저장 완료',
      type: 'success',
    });
  });

  it('toast.error 호출 시 type이 error인 토스트가 추가된다', () => {
    const { result } = renderHook(() => useToast());

    act(() => { result.current.toast.error('저장 실패'); });

    expect(result.current.toasts[0]).toMatchObject({ type: 'error' });
  });

  it('toast.warning 호출 시 type이 warning인 토스트가 추가된다', () => {
    const { result } = renderHook(() => useToast());

    act(() => { result.current.toast.warning('입력값 오류'); });

    expect(result.current.toasts[0]).toMatchObject({ type: 'warning' });
  });

  it('toast.info 호출 시 type이 info인 토스트가 추가된다', () => {
    const { result } = renderHook(() => useToast());

    act(() => { result.current.toast.info('안내 메시지'); });

    expect(result.current.toasts[0]).toMatchObject({ type: 'info' });
  });

  it('각 토스트는 고유한 id를 가진다', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast.success('첫 번째');
      result.current.toast.success('두 번째');
    });

    const [t1, t2] = result.current.toasts;
    expect(t1.id).not.toBe(t2.id);
  });

  it('여러 토스트를 동시에 표시할 수 있다', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast.success('하나');
      result.current.toast.error('둘');
      result.current.toast.info('셋');
    });

    expect(result.current.toasts).toHaveLength(3);
  });
});

describe('useToast — dismissToast', () => {
  it('dismissToast(id) 호출 시 해당 토스트가 제거된다', () => {
    const { result } = renderHook(() => useToast());

    act(() => { result.current.toast.success('테스트'); });
    const id = result.current.toasts[0].id;

    act(() => { result.current.dismissToast(id); });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('존재하지 않는 id로 dismissToast를 호출해도 에러가 없다', () => {
    const { result } = renderHook(() => useToast());

    act(() => { result.current.toast.success('테스트'); });

    expect(() => {
      act(() => { result.current.dismissToast(99999); });
    }).not.toThrow();

    // 원래 토스트는 그대로
    expect(result.current.toasts).toHaveLength(1);
  });

  it('여러 토스트 중 특정 id만 제거된다', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast.success('첫 번째');
      result.current.toast.error('두 번째');
    });

    const idToRemove = result.current.toasts[0].id;
    act(() => { result.current.dismissToast(idToRemove); });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('두 번째');
  });
});

describe('useToast — duration 옵션', () => {
  it('duration을 지정하면 해당 값이 토스트에 저장된다', () => {
    const { result } = renderHook(() => useToast());

    act(() => { result.current.toast.success('5초 토스트', 5000); });

    expect(result.current.toasts[0].duration).toBe(5000);
  });

  it('duration을 지정하지 않으면 기본값 3000이 적용된다', () => {
    const { result } = renderHook(() => useToast());

    act(() => { result.current.toast.info('기본 토스트'); });

    expect(result.current.toasts[0].duration).toBe(3000);
  });
});
