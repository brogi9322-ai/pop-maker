import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Header from './Header';

// 기본 props — 모든 핸들러를 vi.fn()으로 채운다
function defaultProps(overrides = {}) {
  return {
    isBanplus: false,
    bizNumber: null,
    onBanplusClick: vi.fn(),
    onLogout: vi.fn(),
    onSavePng: vi.fn(),
    onSavePdf: vi.fn(),
    onPrint: vi.fn(),
    onSaveTemplate: vi.fn(),
    onLoadTemplates: vi.fn(),
    onUndo: vi.fn(),
    onRedo: vi.fn(),
    canUndo: false,
    canRedo: false,
    darkMode: false,
    onToggleDarkMode: vi.fn(),
    ...overrides,
  };
}

describe('Header — 기본 렌더링', () => {
  it('로고가 표시된다', () => {
    render(<Header {...defaultProps()} />);
    expect(screen.getByText(/POP 제작기/)).toBeInTheDocument();
  });

  it('밴플러스 미인증 시 "밴플러스 인증" 버튼이 표시된다', () => {
    render(<Header {...defaultProps({ isBanplus: false })} />);
    expect(screen.getByText(/밴플러스 인증/)).toBeInTheDocument();
  });

  it('밴플러스 인증 시 배지와 로그아웃 버튼이 표시된다', () => {
    render(<Header {...defaultProps({ isBanplus: true, bizNumber: '1234567890' })} />);
    expect(screen.getByText(/밴플러스/)).toBeInTheDocument();
    expect(screen.getByText('로그아웃')).toBeInTheDocument();
  });

  it('사업자번호가 포맷팅되어 표시된다 (123-45-67890)', () => {
    render(<Header {...defaultProps({ isBanplus: true, bizNumber: '1234567890' })} />);
    expect(screen.getByText('123-45-67890')).toBeInTheDocument();
  });
});

describe('Header — Undo/Redo 버튼 상태', () => {
  it('canUndo=false 일 때 "실행 취소" 버튼이 비활성화된다', () => {
    render(<Header {...defaultProps({ canUndo: false })} />);
    expect(screen.getByTitle('실행 취소 (Ctrl+Z)')).toBeDisabled();
  });

  it('canUndo=true 일 때 "실행 취소" 버튼이 활성화된다', () => {
    render(<Header {...defaultProps({ canUndo: true })} />);
    expect(screen.getByTitle('실행 취소 (Ctrl+Z)')).toBeEnabled();
  });

  it('canRedo=false 일 때 "다시 실행" 버튼이 비활성화된다', () => {
    render(<Header {...defaultProps({ canRedo: false })} />);
    expect(screen.getByTitle('다시 실행 (Ctrl+Shift+Z)')).toBeDisabled();
  });

  it('canRedo=true 일 때 "다시 실행" 버튼이 활성화된다', () => {
    render(<Header {...defaultProps({ canRedo: true })} />);
    expect(screen.getByTitle('다시 실행 (Ctrl+Shift+Z)')).toBeEnabled();
  });
});

describe('Header — 버튼 클릭 이벤트', () => {
  it('실행 취소 버튼 클릭 시 onUndo가 호출된다', async () => {
    const onUndo = vi.fn();
    render(<Header {...defaultProps({ canUndo: true, onUndo })} />);
    await userEvent.click(screen.getByTitle('실행 취소 (Ctrl+Z)'));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('다시 실행 버튼 클릭 시 onRedo가 호출된다', async () => {
    const onRedo = vi.fn();
    render(<Header {...defaultProps({ canRedo: true, onRedo })} />);
    await userEvent.click(screen.getByTitle('다시 실행 (Ctrl+Shift+Z)'));
    expect(onRedo).toHaveBeenCalledTimes(1);
  });

  it('저장 버튼 클릭 시 onSaveTemplate이 호출된다', async () => {
    const onSaveTemplate = vi.fn();
    render(<Header {...defaultProps({ onSaveTemplate })} />);
    await userEvent.click(screen.getByText(/저장/));
    expect(onSaveTemplate).toHaveBeenCalledTimes(1);
  });

  it('PNG 버튼 클릭 시 onSavePng가 호출된다', async () => {
    const onSavePng = vi.fn();
    render(<Header {...defaultProps({ onSavePng })} />);
    await userEvent.click(screen.getByText(/PNG/));
    expect(onSavePng).toHaveBeenCalledTimes(1);
  });

  it('밴플러스 인증 버튼 클릭 시 onBanplusClick이 호출된다', async () => {
    const onBanplusClick = vi.fn();
    render(<Header {...defaultProps({ isBanplus: false, onBanplusClick })} />);
    await userEvent.click(screen.getByText(/밴플러스 인증/));
    expect(onBanplusClick).toHaveBeenCalledTimes(1);
  });

  it('로그아웃 버튼 클릭 시 onLogout이 호출된다', async () => {
    const onLogout = vi.fn();
    render(<Header {...defaultProps({ isBanplus: true, bizNumber: '1234567890', onLogout })} />);
    await userEvent.click(screen.getByText('로그아웃'));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});

describe('Header — 다크모드 토글', () => {
  it('darkMode=false 일 때 🌙 버튼이 표시된다', () => {
    render(<Header {...defaultProps({ darkMode: false })} />);
    expect(screen.getByTitle('다크 모드로 전환')).toBeInTheDocument();
  });

  it('darkMode=true 일 때 ☀️ 버튼이 표시된다', () => {
    render(<Header {...defaultProps({ darkMode: true })} />);
    expect(screen.getByTitle('라이트 모드로 전환')).toBeInTheDocument();
  });

  it('다크모드 토글 버튼 클릭 시 onToggleDarkMode가 호출된다', async () => {
    const onToggleDarkMode = vi.fn();
    render(<Header {...defaultProps({ onToggleDarkMode })} />);
    await userEvent.click(screen.getByTitle('다크 모드로 전환'));
    expect(onToggleDarkMode).toHaveBeenCalledTimes(1);
  });
});
