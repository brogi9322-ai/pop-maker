import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LayerPanel from './LayerPanel';

function makeEl(id, overrides = {}) {
  return {
    id,
    type: 'text',
    name: `레이어${id}`,
    zIndex: 1,
    locked: false,
    hidden: false,
    ...overrides,
  };
}

function renderPanel(elements = [], props = {}) {
  const setSelectedId = props.setSelectedId ?? vi.fn();
  const onReorder = props.onReorder ?? vi.fn();
  const onToggleLock = props.onToggleLock ?? vi.fn();
  const onToggleHide = props.onToggleHide ?? vi.fn();
  const onRename = props.onRename ?? vi.fn();

  return {
    setSelectedId,
    onReorder,
    onToggleLock,
    onToggleHide,
    onRename,
    ...render(
      <LayerPanel
        elements={elements}
        selectedId={props.selectedId ?? null}
        setSelectedId={setSelectedId}
        onReorder={onReorder}
        onToggleLock={onToggleLock}
        onToggleHide={onToggleHide}
        onRename={onRename}
      />
    ),
  };
}

describe('LayerPanel — 빈 상태', () => {
  it('elements가 비어있으면 "요소가 없습니다." 표시', () => {
    renderPanel([]);
    expect(screen.getByText('요소가 없습니다.')).toBeInTheDocument();
  });
});

describe('LayerPanel — 렌더링', () => {
  it('요소 이름이 표시된다', () => {
    renderPanel([makeEl('a', { name: '텍스트A' }), makeEl('b', { name: '이미지B', type: 'image' })]);
    expect(screen.getByText('텍스트A')).toBeInTheDocument();
    expect(screen.getByText('이미지B')).toBeInTheDocument();
  });

  it('텍스트 요소에는 📝 아이콘, 이미지 요소에는 🖼 아이콘이 표시된다', () => {
    renderPanel([makeEl('t', { type: 'text' }), makeEl('i', { type: 'image' })]);
    expect(screen.getAllByText('📝')).toHaveLength(1);
    expect(screen.getAllByText('🖼')).toHaveLength(1);
  });

  it('zIndex 역순으로 렌더링된다 (높은 zIndex가 위)', () => {
    renderPanel([
      makeEl('low', { name: '낮은레이어', zIndex: 1 }),
      makeEl('high', { name: '높은레이어', zIndex: 10 }),
    ]);

    const items = screen.getAllByText(/레이어/);
    expect(items[0]).toHaveTextContent('높은레이어');
    expect(items[1]).toHaveTextContent('낮은레이어');
  });

  it('선택된 요소에 layer-item--selected 클래스가 적용된다', () => {
    renderPanel([makeEl('sel')], { selectedId: 'sel' });
    const item = screen.getByText('레이어sel').closest('.layer-item');
    expect(item).toHaveClass('layer-item--selected');
  });
});

describe('LayerPanel — 선택', () => {
  it('요소 클릭 시 setSelectedId가 호출된다', async () => {
    const user = userEvent.setup();
    const { setSelectedId } = renderPanel([makeEl('click')]);

    await user.click(screen.getByText('레이어click'));

    expect(setSelectedId).toHaveBeenCalledWith('click');
  });

  it('잠긴 요소 클릭 시 setSelectedId가 호출되지 않는다', async () => {
    const user = userEvent.setup();
    const { setSelectedId } = renderPanel([makeEl('locked', { locked: true })]);

    await user.click(screen.getByText('레이어locked'));

    expect(setSelectedId).not.toHaveBeenCalled();
  });
});

describe('LayerPanel — 잠금/숨기기', () => {
  it('잠금 버튼 클릭 시 onToggleLock(id)가 호출된다', async () => {
    const user = userEvent.setup();
    const { onToggleLock } = renderPanel([makeEl('lock-me')]);

    await user.click(screen.getByTitle('잠금'));

    expect(onToggleLock).toHaveBeenCalledWith('lock-me');
  });

  it('잠긴 요소의 잠금 버튼에는 "잠금 해제" title이 있다', () => {
    renderPanel([makeEl('locked', { locked: true })]);
    expect(screen.getByTitle('잠금 해제')).toBeInTheDocument();
  });

  it('숨기기 버튼 클릭 시 onToggleHide(id)가 호출된다', async () => {
    const user = userEvent.setup();
    const { onToggleHide } = renderPanel([makeEl('hide-me')]);

    await user.click(screen.getByTitle('숨기기'));

    expect(onToggleHide).toHaveBeenCalledWith('hide-me');
  });

  it('숨겨진 요소의 숨기기 버튼에는 "표시" title이 있다', () => {
    renderPanel([makeEl('hidden', { hidden: true })]);
    expect(screen.getByTitle('표시')).toBeInTheDocument();
  });
});

describe('LayerPanel — 이름 변경', () => {
  it('이름 더블클릭 시 인풋 필드로 전환된다', async () => {
    const user = userEvent.setup();
    renderPanel([makeEl('rename-me', { name: '원래이름' })]);

    await user.dblClick(screen.getByText('원래이름'));

    expect(screen.getByDisplayValue('원래이름')).toBeInTheDocument();
  });

  it('인풋에서 Enter 키 입력 시 onRename(id, newName)이 호출된다', async () => {
    const user = userEvent.setup();
    const { onRename } = renderPanel([makeEl('r', { name: '기존이름' })]);

    await user.dblClick(screen.getByText('기존이름'));
    const input = screen.getByDisplayValue('기존이름');
    await user.clear(input);
    await user.type(input, '새이름{Enter}');

    expect(onRename).toHaveBeenCalledWith('r', '새이름');
  });

  it('인풋에서 Escape 키 입력 시 편집이 취소된다', async () => {
    const user = userEvent.setup();
    const { onRename } = renderPanel([makeEl('esc', { name: '원본이름' })]);

    await user.dblClick(screen.getByText('원본이름'));
    const input = screen.getByDisplayValue('원본이름');
    await user.type(input, '{Escape}');

    expect(onRename).not.toHaveBeenCalled();
    expect(screen.getByText('원본이름')).toBeInTheDocument();
  });
});

describe('LayerPanel — 드래그 재정렬', () => {
  it('드래그 앤 드롭 시 onReorder(sourceId, targetId)가 호출된다', () => {
    const { onReorder } = renderPanel([
      makeEl('a', { zIndex: 2 }),
      makeEl('b', { zIndex: 1 }),
    ]);

    const items = document.querySelectorAll('.layer-item');
    fireEvent.dragStart(items[0], { dataTransfer: { setData: vi.fn(), effectAllowed: '' } });
    fireEvent.drop(items[1], {
      dataTransfer: { getData: () => 'a', dropEffect: '' },
    });

    expect(onReorder).toHaveBeenCalledWith('a', 'b');
  });
});
