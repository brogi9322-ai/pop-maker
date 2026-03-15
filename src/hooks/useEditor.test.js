import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useEditor } from './useEditor';
import { EditorProvider } from '../context/EditorContext';

// Firebase 및 외부 의존성 목킹
vi.mock('../firebase', () => ({ db: {}, auth: {} }));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn().mockResolvedValue({ id: 'mock-id' }),
  getDocs: vi.fn().mockResolvedValue({ docs: [] }),
  getDoc: vi.fn(),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  deleteDoc: vi.fn().mockResolvedValue(undefined),
  doc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
}));

vi.mock('html2canvas', () => ({ default: vi.fn() }));

describe('useEditor — EditorProvider 외부에서 호출', () => {
  it('EditorProvider 없이 useEditor를 호출하면 에러가 발생한다', () => {
    // renderHook 기본 wrapper 없음 → context null
    expect(() => {
      renderHook(() => useEditor());
    }).toThrow('useEditor must be used within EditorProvider');
  });
});

describe('useEditor — EditorProvider 내부에서 호출', () => {
  it('EditorProvider 안에서 useEditor를 호출하면 context 객체를 반환한다', () => {
    const { result } = renderHook(() => useEditor(), {
      wrapper: EditorProvider,
    });

    // 핵심 상태 값 존재 확인
    expect(result.current).toBeDefined();
    expect(typeof result.current.elements).toBe('object');
    expect(typeof result.current.addText).toBe('function');
    expect(typeof result.current.handleDelete).toBe('function');
    expect(typeof result.current.handleDuplicate).toBe('function');
    expect(typeof result.current.undo).toBe('function');
    expect(typeof result.current.redo).toBe('function');
  });

  it('초기 elements가 빈 배열이다', () => {
    const { result } = renderHook(() => useEditor(), {
      wrapper: EditorProvider,
    });

    expect(result.current.elements).toEqual([]);
  });

  it('초기 selectedId가 null이다', () => {
    const { result } = renderHook(() => useEditor(), {
      wrapper: EditorProvider,
    });

    expect(result.current.selectedId).toBeNull();
  });
});
