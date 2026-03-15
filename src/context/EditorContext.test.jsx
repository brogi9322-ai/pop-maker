import { act, fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EditorProvider } from './EditorContext';
import { useEditor } from '../hooks/useEditor';

// Firebase 목킹
vi.mock('../firebase', () => ({ db: {}, auth: {} }));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn().mockResolvedValue({ id: 'mock-doc-id' }),
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

// html2canvas 목킹
vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: vi.fn().mockReturnValue('data:image/png;base64,fake'),
  }),
}));

// storage utils 목킹
vi.mock('../utils/storage', () => ({
  saveTemplate: vi.fn().mockResolvedValue('mock-doc-id'),
  updateTemplate: vi.fn().mockResolvedValue(undefined),
  validateBizNumber: vi.fn((num) => /^\d{10}$/.test(num.replace(/-/g, ''))),
  getUserId: vi.fn().mockReturnValue('user_test'),
}));

// renderHook 래퍼
function wrapper({ children }) {
  return <EditorProvider>{children}</EditorProvider>;
}

describe('EditorContext — handleSelectTemplate', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('템플릿 선택 후 template 상태가 업데이트된다', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });
    const tpl = {
      id: 1, name: '빨간 세일',
      background: 'red', textColor: '#fff',
      defaultText: '세일', category: '세일/할인',
    };

    act(() => {
      result.current.handleSelectTemplate(tpl);
    });

    expect(result.current.template).toEqual(tpl);
  });

  it('템플릿 선택 후 elements에 기본 텍스트 요소가 생성된다', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });
    const tpl = {
      id: 1, name: '빨간 세일',
      background: 'red', textColor: '#fff',
      defaultText: '세일', category: '세일/할인',
    };

    act(() => {
      result.current.handleSelectTemplate(tpl);
    });

    expect(result.current.elements).toHaveLength(1);
    expect(result.current.elements[0].type).toBe('text');
    expect(result.current.elements[0].text).toBe('세일');
  });

  it('템플릿 선택 후 selectedId가 null이 된다', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });
    const tpl = {
      id: 1, name: '빨간 세일',
      background: 'red', textColor: '#fff',
      defaultText: '세일', category: '세일/할인',
    };

    act(() => {
      result.current.handleSelectTemplate(tpl);
    });

    expect(result.current.selectedId).toBeNull();
  });
});

describe('EditorContext — addText', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('addText 호출 후 elements에 텍스트 요소가 추가된다', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });

    act(() => {
      result.current.addText();
    });

    expect(result.current.elements).toHaveLength(1);
    expect(result.current.elements[0].type).toBe('text');
  });

  it('addText 호출 후 selectedId가 새 요소 id로 설정된다', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });

    act(() => {
      result.current.addText();
    });

    expect(result.current.selectedId).toBe(result.current.elements[0].id);
  });

  it('addText를 여러 번 호출하면 요소가 누적된다', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });

    // addText는 elements 클로저를 사용하므로 각각 별도 act()로 호출해야 한다
    act(() => { result.current.addText(); });
    act(() => { result.current.addText(); });

    expect(result.current.elements).toHaveLength(2);
  });
});

describe('EditorContext — handleAddAsset', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('handleAddAsset 호출 후 image 요소가 추가된다', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });
    const asset = {
      id: 'med_01', name: '알약',
      src: 'data:image/svg+xml;charset=utf-8,%3Csvg%3E%3C%2Fsvg%3E',
    };

    act(() => {
      result.current.handleAddAsset(asset);
    });

    expect(result.current.elements).toHaveLength(1);
    expect(result.current.elements[0].type).toBe('image');
    expect(result.current.elements[0].name).toBe('알약');
  });

  it('handleAddAsset 호출 후 selectedId가 새 요소 id로 설정된다', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });
    const asset = { id: 'med_01', name: '알약', src: 'data:image/svg+xml,' };

    act(() => {
      result.current.handleAddAsset(asset);
    });

    expect(result.current.selectedId).toBe(result.current.elements[0].id);
  });
});

describe('EditorContext — handleChangeElement', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('handleChangeElement 호출 시 해당 요소가 업데이트된다', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });

    act(() => {
      result.current.addText();
    });

    const el = result.current.elements[0];
    const updated = { ...el, text: '변경된 텍스트' };

    act(() => {
      result.current.handleChangeElement(updated);
    });

    expect(result.current.elements[0].text).toBe('변경된 텍스트');
  });

  it('handleChangeElement는 다른 요소에 영향을 주지 않는다', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });

    // 요소 두 개를 별도 act()로 추가 (클로저 stale 방지)
    act(() => { result.current.addText(); });
    act(() => { result.current.addText(); });

    const firstEl = result.current.elements[0];
    const secondEl = result.current.elements[1];
    const updatedFirst = { ...firstEl, text: '첫 번째만 변경' };

    act(() => {
      result.current.handleChangeElement(updatedFirst);
    });

    expect(result.current.elements[0].text).toBe('첫 번째만 변경');
    expect(result.current.elements[1].id).toBe(secondEl.id);
  });
});

describe('EditorContext — handleDelete', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('handleDelete 호출 시 선택된 요소가 제거된다', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });

    act(() => {
      result.current.addText();
    });

    const elId = result.current.elements[0].id;

    act(() => {
      result.current.setSelectedId(elId);
    });

    act(() => {
      result.current.handleDelete();
    });

    expect(result.current.elements).toHaveLength(0);
  });

  it('handleDelete 호출 후 selectedId가 null이 된다', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });

    act(() => {
      result.current.addText();
    });

    const elId = result.current.elements[0].id;

    act(() => {
      result.current.setSelectedId(elId);
    });

    act(() => {
      result.current.handleDelete();
    });

    expect(result.current.selectedId).toBeNull();
  });
});

describe('EditorContext — handleDuplicate', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('handleDuplicate 호출 시 요소가 복제된다', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });

    act(() => {
      result.current.addText();
    });

    const elId = result.current.elements[0].id;

    act(() => {
      result.current.setSelectedId(elId);
    });

    act(() => {
      result.current.handleDuplicate();
    });

    expect(result.current.elements).toHaveLength(2);
  });

  it('복제된 요소는 원본과 다른 id를 가진다', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });

    act(() => {
      result.current.addText();
    });

    const originalId = result.current.elements[0].id;

    act(() => {
      result.current.setSelectedId(originalId);
    });

    act(() => {
      result.current.handleDuplicate();
    });

    const ids = result.current.elements.map((el) => el.id);
    expect(new Set(ids).size).toBe(2);
  });
});

describe('EditorContext — handleBringFront / handleSendBack', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('handleBringFront 호출 시 선택 요소의 zIndex가 증가한다', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });

    act(() => {
      result.current.addText();
    });

    const el = result.current.elements[0];
    const originalZIndex = el.zIndex;

    act(() => {
      result.current.setSelectedId(el.id);
    });

    act(() => {
      result.current.handleBringFront();
    });

    expect(result.current.elements[0].zIndex).toBeGreaterThan(originalZIndex);
  });

  it('handleSendBack 호출 시 선택 요소의 zIndex가 감소한다 (최소 1)', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });

    act(() => {
      result.current.addText();
    });

    const el = result.current.elements[0];

    act(() => {
      result.current.setSelectedId(el.id);
    });

    // zIndex를 3으로 올린 뒤 뒤로 보내기
    act(() => {
      result.current.handleBringFront();
      result.current.handleBringFront();
    });

    const zIndexBefore = result.current.elements[0].zIndex;

    act(() => {
      result.current.handleSendBack();
    });

    expect(result.current.elements[0].zIndex).toBeLessThan(zIndexBefore);
  });
});

describe('EditorContext — handleLayerReorder', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('handleLayerReorder 호출 시 두 요소의 zIndex가 교환된다', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });

    // 요소 두 개를 별도 act()로 추가 (클로저 stale 방지)
    act(() => { result.current.addText(); });
    act(() => { result.current.addText(); });

    const [el1, el2] = result.current.elements;
    const zIndex1 = el1.zIndex;
    const zIndex2 = el2.zIndex;

    act(() => {
      result.current.handleLayerReorder(el1.id, el2.id);
    });

    const updated = result.current.elements;
    const updatedEl1 = updated.find((el) => el.id === el1.id);
    const updatedEl2 = updated.find((el) => el.id === el2.id);

    expect(updatedEl1.zIndex).toBe(zIndex2);
    expect(updatedEl2.zIndex).toBe(zIndex1);
  });
});

describe('EditorContext — handleToggleLock / handleToggleHide', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('handleToggleLock 호출 시 요소의 locked 상태가 토글된다', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });

    act(() => {
      result.current.addText();
    });

    const elId = result.current.elements[0].id;
    expect(result.current.elements[0].locked).toBe(false);

    act(() => {
      result.current.handleToggleLock(elId);
    });

    expect(result.current.elements[0].locked).toBe(true);
  });

  it('handleToggleLock 호출 시 selectedId가 null로 초기화된다', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });

    act(() => {
      result.current.addText();
    });

    const elId = result.current.elements[0].id;

    act(() => {
      result.current.setSelectedId(elId);
    });

    act(() => {
      result.current.handleToggleLock(elId);
    });

    expect(result.current.selectedId).toBeNull();
  });

  it('handleToggleHide 호출 시 요소의 hidden 상태가 토글된다', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });

    act(() => {
      result.current.addText();
    });

    const elId = result.current.elements[0].id;
    expect(result.current.elements[0].hidden).toBe(false);

    act(() => {
      result.current.handleToggleHide(elId);
    });

    expect(result.current.elements[0].hidden).toBe(true);
  });
});

describe('EditorContext — handleApplyCustomSize', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('유효한 크기 입력 시 canvasSize가 변경된다', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });

    act(() => {
      result.current.setCustomWidth('500');
      result.current.setCustomHeight('400');
    });

    act(() => {
      result.current.handleApplyCustomSize();
    });

    expect(result.current.canvasSize.width).toBe(500);
    expect(result.current.canvasSize.height).toBe(400);
  });

  it('범위를 벗어난 값(99px) 입력 시 canvasSize가 변경되지 않는다', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });
    const originalSize = result.current.canvasSize;

    act(() => {
      result.current.setCustomWidth('99');
      result.current.setCustomHeight('300');
    });

    act(() => {
      result.current.handleApplyCustomSize();
    });

    expect(result.current.canvasSize).toEqual(originalSize);
  });

  it('범위를 벗어난 값(2001px) 입력 시 canvasSize가 변경되지 않는다', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });
    const originalSize = result.current.canvasSize;

    act(() => {
      result.current.setCustomWidth('2001');
      result.current.setCustomHeight('300');
    });

    act(() => {
      result.current.handleApplyCustomSize();
    });

    expect(result.current.canvasSize).toEqual(originalSize);
  });
});

describe('EditorContext — 키보드 단축키', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('Ctrl+Z로 undo가 실행된다', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });

    act(() => {
      result.current.addText();
    });

    expect(result.current.elements).toHaveLength(1);

    act(() => {
      fireEvent.keyDown(window, { key: 'z', ctrlKey: true });
    });

    expect(result.current.elements).toHaveLength(0);
  });

  it('Ctrl+Y로 redo가 실행된다', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });

    act(() => {
      result.current.addText();
    });

    // undo
    act(() => {
      fireEvent.keyDown(window, { key: 'z', ctrlKey: true });
    });

    expect(result.current.elements).toHaveLength(0);

    // redo
    act(() => {
      fireEvent.keyDown(window, { key: 'y', ctrlKey: true });
    });

    expect(result.current.elements).toHaveLength(1);
  });

  it('Delete 키로 선택된 요소가 삭제된다', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });

    act(() => {
      result.current.addText();
    });

    const elId = result.current.elements[0].id;

    act(() => {
      result.current.setSelectedId(elId);
    });

    act(() => {
      fireEvent.keyDown(window, { key: 'Delete' });
    });

    expect(result.current.elements).toHaveLength(0);
  });

  it('잠긴 요소는 Delete 키로 삭제되지 않는다', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });

    act(() => {
      result.current.addText();
    });

    const elId = result.current.elements[0].id;

    // 요소 잠금
    act(() => {
      result.current.handleToggleLock(elId);
    });

    // 잠금 후 selectedId가 null이 되었으므로 다시 설정
    act(() => {
      result.current.setSelectedId(elId);
    });

    act(() => {
      fireEvent.keyDown(window, { key: 'Delete' });
    });

    // locked=true이므로 삭제되지 않음
    expect(result.current.elements).toHaveLength(1);
  });

  it('INPUT 포커스 상태에서는 Delete 키가 무시된다', () => {
    const { result } = renderHook(() => useEditor(), { wrapper });

    act(() => {
      result.current.addText();
    });

    const elId = result.current.elements[0].id;

    act(() => {
      result.current.setSelectedId(elId);
    });

    // INPUT 요소에 포커스를 주고 Delete 키 이벤트 발생
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    act(() => {
      fireEvent.keyDown(window, { key: 'Delete' });
    });

    // INPUT 포커스 상태에서는 삭제 무시
    expect(result.current.elements).toHaveLength(1);

    document.body.removeChild(input);
  });
});
