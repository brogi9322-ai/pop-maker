import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useHistory } from './useHistory';

// 테스트용 요소 팩토리
function makeEl(id, extra = {}) {
  return { id, type: 'text', x: 0, y: 0, ...extra };
}

describe('useHistory — 기본 상태', () => {
  it('초기 elements가 빈 배열이면 canUndo/canRedo가 false', () => {
    const { result } = renderHook(() => useHistory([]));
    expect(result.current.elements).toEqual([]);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('초기 elements를 그대로 반환한다', () => {
    const initial = [makeEl('a'), makeEl('b')];
    const { result } = renderHook(() => useHistory(initial));
    expect(result.current.elements).toEqual(initial);
  });
});

describe('useHistory — pushSnapshot', () => {
  it('pushSnapshot 호출 후 elements가 새 값으로 업데이트된다', () => {
    const { result } = renderHook(() => useHistory([]));
    const el = makeEl('1');

    act(() => {
      result.current.pushSnapshot([el]);
    });

    expect(result.current.elements).toEqual([el]);
  });

  it('pushSnapshot 호출 후 canUndo가 true가 된다', () => {
    const { result } = renderHook(() => useHistory([]));

    act(() => {
      result.current.pushSnapshot([makeEl('1')]);
    });

    expect(result.current.canUndo).toBe(true);
  });

  it('pushSnapshot은 redoStack을 초기화한다', () => {
    const { result } = renderHook(() => useHistory([]));

    // 히스토리 생성 → undo → redo 가능 상태 만들기
    act(() => { result.current.pushSnapshot([makeEl('1')]); });
    act(() => { result.current.undo(); });
    expect(result.current.canRedo).toBe(true);

    // 새 pushSnapshot 호출 시 redo 스택 초기화
    act(() => { result.current.pushSnapshot([makeEl('2')]); });
    expect(result.current.canRedo).toBe(false);
  });

  it('여러 번 pushSnapshot 호출 시 undoStack이 쌓인다', () => {
    const { result } = renderHook(() => useHistory([]));

    act(() => { result.current.pushSnapshot([makeEl('1')]); });
    act(() => { result.current.pushSnapshot([makeEl('2')]); });
    act(() => { result.current.pushSnapshot([makeEl('3')]); });

    expect(result.current.canUndo).toBe(true);
    // undo 3번 가능 확인
    act(() => { result.current.undo(); });
    act(() => { result.current.undo(); });
    act(() => { result.current.undo(); });
    expect(result.current.canUndo).toBe(false);
  });
});

describe('useHistory — undo', () => {
  it('undo 후 이전 elements로 복원된다', () => {
    const { result } = renderHook(() => useHistory([]));
    const before = [makeEl('before')];
    const after = [makeEl('after')];

    act(() => { result.current.pushSnapshot(before); });
    act(() => { result.current.pushSnapshot(after); });

    expect(result.current.elements).toEqual(after);

    act(() => { result.current.undo(); });

    expect(result.current.elements).toEqual(before);
  });

  it('undo 후 canRedo가 true가 된다', () => {
    const { result } = renderHook(() => useHistory([]));

    act(() => { result.current.pushSnapshot([makeEl('1')]); });
    act(() => { result.current.undo(); });

    expect(result.current.canRedo).toBe(true);
  });

  it('undoStack이 비어있을 때 undo를 호출해도 에러 없이 무시된다', () => {
    const { result } = renderHook(() => useHistory([]));

    expect(() => {
      act(() => { result.current.undo(); });
    }).not.toThrow();

    expect(result.current.elements).toEqual([]);
  });

  it('undo는 가장 최근 pushSnapshot부터 역순으로 복원된다', () => {
    const { result } = renderHook(() => useHistory([]));
    const s1 = [makeEl('s1')];
    const s2 = [makeEl('s2')];
    const s3 = [makeEl('s3')];

    act(() => { result.current.pushSnapshot(s1); });
    act(() => { result.current.pushSnapshot(s2); });
    act(() => { result.current.pushSnapshot(s3); });

    act(() => { result.current.undo(); });
    expect(result.current.elements).toEqual(s2);

    act(() => { result.current.undo(); });
    expect(result.current.elements).toEqual(s1);
  });
});

describe('useHistory — redo', () => {
  it('undo 후 redo하면 앞으로 진행된다', () => {
    const { result } = renderHook(() => useHistory([]));
    const s1 = [makeEl('s1')];
    const s2 = [makeEl('s2')];

    act(() => { result.current.pushSnapshot(s1); });
    act(() => { result.current.pushSnapshot(s2); });
    act(() => { result.current.undo(); });
    expect(result.current.elements).toEqual(s1);

    act(() => { result.current.redo(); });
    expect(result.current.elements).toEqual(s2);
  });

  it('redo 후 canRedo는 스택이 소진되면 false가 된다', () => {
    const { result } = renderHook(() => useHistory([]));

    act(() => { result.current.pushSnapshot([makeEl('1')]); });
    act(() => { result.current.undo(); });
    expect(result.current.canRedo).toBe(true);

    act(() => { result.current.redo(); });
    expect(result.current.canRedo).toBe(false);
  });

  it('redoStack이 비어있을 때 redo를 호출해도 에러 없이 무시된다', () => {
    const { result } = renderHook(() => useHistory([]));

    expect(() => {
      act(() => { result.current.redo(); });
    }).not.toThrow();
  });
});

describe('useHistory — startDrag / commitDrag', () => {
  it('startDrag + commitDrag 후 undo하면 드래그 전 상태로 복원된다', () => {
    const { result } = renderHook(() => useHistory([]));
    const preDrag = [makeEl('pre', { x: 0, y: 0 })];
    const postDrag = [makeEl('pre', { x: 200, y: 200 })];

    // 초기 상태 설정
    act(() => { result.current.pushSnapshot(preDrag); });

    // 드래그 시작
    act(() => { result.current.startDrag(); });

    // 드래그 중 연속 업데이트 (setElements — 히스토리 미기록)
    act(() => { result.current.setElements(() => postDrag); });
    expect(result.current.elements).toEqual(postDrag);

    // 드래그 완료
    act(() => { result.current.commitDrag(); });

    // undo → 드래그 전 상태로
    act(() => { result.current.undo(); });
    expect(result.current.elements).toEqual(preDrag);
  });

  it('startDrag 없이 commitDrag를 호출해도 에러 없이 무시된다', () => {
    const { result } = renderHook(() => useHistory([]));

    expect(() => {
      act(() => { result.current.commitDrag(); });
    }).not.toThrow();

    expect(result.current.canUndo).toBe(false);
  });

  it('commitDrag 후 canUndo가 true가 된다', () => {
    const { result } = renderHook(() => useHistory([]));

    act(() => { result.current.pushSnapshot([makeEl('1')]); });
    act(() => { result.current.startDrag(); });
    act(() => { result.current.setElements(() => [makeEl('1', { x: 50 })]); });
    act(() => { result.current.commitDrag(); });

    // undo 가능 (초기 pushSnapshot + commitDrag = 2단계)
    act(() => { result.current.undo(); }); // commitDrag 전으로
    expect(result.current.canUndo).toBe(true);
  });
});

describe('useHistory — setElements', () => {
  it('setElements는 히스토리를 기록하지 않는다', () => {
    const { result } = renderHook(() => useHistory([]));

    act(() => {
      result.current.setElements(() => [makeEl('1')]);
    });

    expect(result.current.elements).toEqual([makeEl('1')]);
    expect(result.current.canUndo).toBe(false);
  });

  it('setElements는 함수 업데이터를 지원한다', () => {
    const { result } = renderHook(() => useHistory([makeEl('1')]));

    act(() => {
      result.current.setElements((prev) => [...prev, makeEl('2')]);
    });

    expect(result.current.elements).toHaveLength(2);
  });
});

describe('useHistory — MAX_HISTORY 제한', () => {
  it('50단계 초과 시 오래된 스냅샷이 자동 삭제된다', () => {
    const { result } = renderHook(() => useHistory([]));

    // 51번 pushSnapshot
    act(() => {
      for (let i = 0; i <= 50; i++) {
        result.current.pushSnapshot([makeEl(`el${i}`)]);
      }
    });

    // 50번 undo 가능, 51번째는 불가
    for (let i = 0; i < 50; i++) {
      act(() => { result.current.undo(); });
    }
    expect(result.current.canUndo).toBe(false);
  });
});
