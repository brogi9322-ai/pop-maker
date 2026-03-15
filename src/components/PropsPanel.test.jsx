import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import PropsPanel from './PropsPanel';

// 텍스트 요소 팩토리
function makeTextEl(overrides = {}) {
  return {
    id: 'el-text-1',
    type: 'text',
    name: '텍스트',
    text: '안녕하세요',
    x: 100, y: 100,
    width: 300,
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 40,
    fontWeight: '700',
    color: '#333333',
    bgColor: 'transparent',
    textAlign: 'center',
    lineHeight: 1.4,
    letterSpacing: 0,
    borderColor: '#000000',
    borderWidth: 0,
    rotate: 0,
    zIndex: 1,
    locked: false,
    hidden: false,
    ...overrides,
  };
}

// 이미지 요소 팩토리
function makeImageEl(overrides = {}) {
  return {
    id: 'el-image-1',
    type: 'image',
    name: '이미지',
    src: 'https://example.com/img.png',
    x: 50, y: 50,
    width: 200,
    height: 150,
    rotate: 0,
    opacity: 100,
    zIndex: 1,
    locked: false,
    hidden: false,
    keepRatio: true,
    naturalWidth: 400,
    naturalHeight: 300,
    ...overrides,
  };
}

describe('PropsPanel — selected가 null인 경우', () => {
  it('안내 메시지가 표시된다', () => {
    render(
      <PropsPanel
        selected={null}
        onChange={vi.fn()}
        onDelete={vi.fn()}
        onDuplicate={vi.fn()}
        onBringFront={vi.fn()}
        onSendBack={vi.fn()}
      />
    );
    expect(screen.getByText('캔버스에서 요소를 클릭하세요')).toBeInTheDocument();
  });

  it('액션 버튼이 표시되지 않는다', () => {
    render(
      <PropsPanel
        selected={null}
        onChange={vi.fn()}
        onDelete={vi.fn()}
        onDuplicate={vi.fn()}
        onBringFront={vi.fn()}
        onSendBack={vi.fn()}
      />
    );
    expect(screen.queryByRole('button', { name: '삭제' })).not.toBeInTheDocument();
  });
});

describe('PropsPanel — 텍스트 요소 선택 시', () => {
  it('텍스트 속성 제목이 표시된다', () => {
    render(
      <PropsPanel
        selected={makeTextEl()}
        onChange={vi.fn()}
        onDelete={vi.fn()}
        onDuplicate={vi.fn()}
        onBringFront={vi.fn()}
        onSendBack={vi.fn()}
      />
    );
    // 텍스트 속성 UI 확인 (label 텍스트 포함)
    expect(screen.getByText(/텍스트 속성/)).toBeInTheDocument();
  });

  it('텍스트 입력 영역(textarea)이 렌더링된다', () => {
    render(
      <PropsPanel
        selected={makeTextEl()}
        onChange={vi.fn()}
        onDelete={vi.fn()}
        onDuplicate={vi.fn()}
        onBringFront={vi.fn()}
        onSendBack={vi.fn()}
      />
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('textarea에 현재 텍스트 값이 표시된다', () => {
    render(
      <PropsPanel
        selected={makeTextEl({ text: '안녕하세요' })}
        onChange={vi.fn()}
        onDelete={vi.fn()}
        onDuplicate={vi.fn()}
        onBringFront={vi.fn()}
        onSendBack={vi.fn()}
      />
    );
    expect(screen.getByRole('textbox')).toHaveValue('안녕하세요');
  });

  it('글씨체 선택 드롭다운이 렌더링된다', () => {
    render(
      <PropsPanel
        selected={makeTextEl()}
        onChange={vi.fn()}
        onDelete={vi.fn()}
        onDuplicate={vi.fn()}
        onBringFront={vi.fn()}
        onSendBack={vi.fn()}
      />
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('textarea 변경 시 onChange가 호출된다', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <PropsPanel
        selected={makeTextEl({ text: '기존 텍스트' })}
        onChange={onChange}
        onDelete={vi.fn()}
        onDuplicate={vi.fn()}
        onBringFront={vi.fn()}
        onSendBack={vi.fn()}
      />
    );

    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, '새 텍스트');

    expect(onChange).toHaveBeenCalled();
  });
});

describe('PropsPanel — 이미지 요소 선택 시', () => {
  it('이미지 속성 제목이 표시된다', () => {
    render(
      <PropsPanel
        selected={makeImageEl()}
        onChange={vi.fn()}
        onDelete={vi.fn()}
        onDuplicate={vi.fn()}
        onBringFront={vi.fn()}
        onSendBack={vi.fn()}
      />
    );
    expect(screen.getByText(/이미지 속성/)).toBeInTheDocument();
  });

  it('비율 유지 체크박스가 렌더링된다', () => {
    render(
      <PropsPanel
        selected={makeImageEl()}
        onChange={vi.fn()}
        onDelete={vi.fn()}
        onDuplicate={vi.fn()}
        onBringFront={vi.fn()}
        onSendBack={vi.fn()}
      />
    );
    expect(screen.getByLabelText(/비율 유지/)).toBeInTheDocument();
  });

  it('텍스트 전용 textarea가 렌더링되지 않는다', () => {
    render(
      <PropsPanel
        selected={makeImageEl()}
        onChange={vi.fn()}
        onDelete={vi.fn()}
        onDuplicate={vi.fn()}
        onBringFront={vi.fn()}
        onSendBack={vi.fn()}
      />
    );
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});

describe('PropsPanel — 공통 액션 버튼', () => {
  it('복제 버튼이 렌더링된다', () => {
    render(
      <PropsPanel
        selected={makeTextEl()}
        onChange={vi.fn()}
        onDelete={vi.fn()}
        onDuplicate={vi.fn()}
        onBringFront={vi.fn()}
        onSendBack={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: '복제' })).toBeInTheDocument();
  });

  it('삭제 버튼 클릭 시 onDelete가 호출된다', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <PropsPanel
        selected={makeTextEl()}
        onChange={vi.fn()}
        onDelete={onDelete}
        onDuplicate={vi.fn()}
        onBringFront={vi.fn()}
        onSendBack={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: '삭제' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('복제 버튼 클릭 시 onDuplicate가 호출된다', async () => {
    const user = userEvent.setup();
    const onDuplicate = vi.fn();
    render(
      <PropsPanel
        selected={makeTextEl()}
        onChange={vi.fn()}
        onDelete={vi.fn()}
        onDuplicate={onDuplicate}
        onBringFront={vi.fn()}
        onSendBack={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: '복제' }));
    expect(onDuplicate).toHaveBeenCalledTimes(1);
  });

  it('앞으로 버튼 클릭 시 onBringFront가 호출된다', async () => {
    const user = userEvent.setup();
    const onBringFront = vi.fn();
    render(
      <PropsPanel
        selected={makeTextEl()}
        onChange={vi.fn()}
        onDelete={vi.fn()}
        onDuplicate={vi.fn()}
        onBringFront={onBringFront}
        onSendBack={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: '앞으로' }));
    expect(onBringFront).toHaveBeenCalledTimes(1);
  });

  it('뒤로 버튼 클릭 시 onSendBack이 호출된다', async () => {
    const user = userEvent.setup();
    const onSendBack = vi.fn();
    render(
      <PropsPanel
        selected={makeTextEl()}
        onChange={vi.fn()}
        onDelete={vi.fn()}
        onDuplicate={vi.fn()}
        onBringFront={vi.fn()}
        onSendBack={onSendBack}
      />
    );

    await user.click(screen.getByRole('button', { name: '뒤로' }));
    expect(onSendBack).toHaveBeenCalledTimes(1);
  });
});
