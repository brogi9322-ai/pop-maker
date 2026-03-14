import { useState, useCallback, useRef } from 'react';

const MAX_HISTORY = 50;

/**
 * Undo/Redo 히스토리 관리 훅
 * - pushSnapshot: 이산 액션 시 히스토리 스택에 기록 + state 업데이트
 * - setElements: state만 업데이트 (드래그 중 연속 호출용)
 * - startDrag: 드래그 시작 시 현재 state를 임시 보관
 * - commitDrag: 드래그 완료 시 임시 보관된 state를 undoStack에 기록
 * - undo / redo: 히스토리 이동
 */
export function useHistory(initialElements) {
  const [elements, setElementsState] = useState(initialElements);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  // 드래그 시작 전 state를 임시 보관하는 ref
  const dragSnapshot = useRef(null);

  // state만 업데이트 (히스토리 미기록 — 드래그 중 연속 업데이트용)
  const setElements = useCallback((updater) => {
    setElementsState(updater);
  }, []);

  // 히스토리 스택에 기록 + state 업데이트 (버튼 클릭, 추가/삭제 등 이산 액션)
  const pushSnapshot = useCallback((newElements) => {
    setElementsState((prev) => {
      setUndoStack((stack) => {
        const next = [...stack, prev];
        return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
      });
      setRedoStack([]);
      return newElements;
    });
  }, []);

  // 드래그 시작 시 현재 state를 ref에 보관
  const startDrag = useCallback(() => {
    setElementsState((prev) => {
      dragSnapshot.current = prev;
      return prev;
    });
  }, []);

  // 드래그 완료 시 보관된 스냅샷(드래그 전 state)을 undoStack에 기록
  const commitDrag = useCallback(() => {
    if (dragSnapshot.current === null) return;
    const snap = dragSnapshot.current;
    dragSnapshot.current = null;
    setUndoStack((stack) => {
      const next = [...stack, snap];
      return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
    });
    setRedoStack([]);
  }, []);

  const undo = useCallback(() => {
    setUndoStack((stack) => {
      if (stack.length === 0) return stack;
      const prev = stack[stack.length - 1];
      const newStack = stack.slice(0, -1);
      setElementsState((current) => {
        setRedoStack((r) => [...r, current]);
        return prev;
      });
      return newStack;
    });
  }, []);

  const redo = useCallback(() => {
    setRedoStack((stack) => {
      if (stack.length === 0) return stack;
      const next = stack[stack.length - 1];
      const newStack = stack.slice(0, -1);
      setElementsState((current) => {
        setUndoStack((u) => [...u, current]);
        return next;
      });
      return newStack;
    });
  }, []);

  return {
    elements,
    setElements,
    pushSnapshot,
    startDrag,
    commitDrag,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
  };
}
