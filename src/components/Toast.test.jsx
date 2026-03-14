import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Toast from './Toast';

// 테스트용 토스트 팩토리
function makeToast(overrides = {}) {
  return {
    id: 1,
    message: '테스트 메시지',
    type: 'success',
    duration: 60000, // 테스트 중 자동 사라지지 않도록 긴 시간 설정
    ...overrides,
  };
}

describe('Toast — 렌더링', () => {
  it('toasts가 빈 배열이면 아무것도 렌더링하지 않는다', () => {
    const { container } = render(<Toast toasts={[]} onDismiss={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('토스트 메시지가 화면에 표시된다', () => {
    const toasts = [makeToast({ message: '저장이 완료되었습니다.' })];
    render(<Toast toasts={toasts} onDismiss={vi.fn()} />);

    expect(screen.getByText('저장이 완료되었습니다.')).toBeInTheDocument();
  });

  it('여러 토스트를 동시에 렌더링한다', () => {
    const toasts = [
      makeToast({ id: 1, message: '첫 번째' }),
      makeToast({ id: 2, message: '두 번째' }),
      makeToast({ id: 3, message: '세 번째' }),
    ];
    render(<Toast toasts={toasts} onDismiss={vi.fn()} />);

    expect(screen.getByText('첫 번째')).toBeInTheDocument();
    expect(screen.getByText('두 번째')).toBeInTheDocument();
    expect(screen.getByText('세 번째')).toBeInTheDocument();
  });
});

describe('Toast — 타입별 CSS 클래스', () => {
  it.each([
    ['success', 'toast--success'],
    ['error', 'toast--error'],
    ['warning', 'toast--warning'],
    ['info', 'toast--info'],
  ])('type=%s 일 때 .%s 클래스가 적용된다', (type, expectedClass) => {
    const toasts = [makeToast({ type })];
    render(<Toast toasts={toasts} onDismiss={vi.fn()} />);

    const toastEl = screen.getByRole('alert');
    expect(toastEl).toHaveClass(expectedClass);
  });
});

describe('Toast — 닫기 버튼', () => {
  it('닫기 버튼 클릭 시 onDismiss(id)가 호출된다', async () => {
    const onDismiss = vi.fn();
    const toasts = [makeToast({ id: 42 })];
    render(<Toast toasts={toasts} onDismiss={onDismiss} />);

    await userEvent.click(screen.getByRole('button', { name: '닫기' }));

    expect(onDismiss).toHaveBeenCalledWith(42);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('여러 토스트 각각에 닫기 버튼이 있다', () => {
    const toasts = [
      makeToast({ id: 1, message: '첫 번째' }),
      makeToast({ id: 2, message: '두 번째' }),
    ];
    render(<Toast toasts={toasts} onDismiss={vi.fn()} />);

    const closeButtons = screen.getAllByRole('button', { name: '닫기' });
    expect(closeButtons).toHaveLength(2);
  });

  it('여러 토스트 중 두 번째 닫기 버튼 클릭 시 해당 id가 전달된다', async () => {
    const onDismiss = vi.fn();
    const toasts = [
      makeToast({ id: 10, message: '첫 번째' }),
      makeToast({ id: 20, message: '두 번째' }),
    ];
    render(<Toast toasts={toasts} onDismiss={onDismiss} />);

    const closeButtons = screen.getAllByRole('button', { name: '닫기' });
    await userEvent.click(closeButtons[1]);

    expect(onDismiss).toHaveBeenCalledWith(20);
  });
});

describe('Toast — 접근성', () => {
  it('토스트 요소에 role="alert" 속성이 있다', () => {
    const toasts = [makeToast()];
    render(<Toast toasts={toasts} onDismiss={vi.fn()} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('토스트 컨테이너에 aria-label이 있다', () => {
    const toasts = [makeToast()];
    render(<Toast toasts={toasts} onDismiss={vi.fn()} />);

    expect(screen.getByLabelText('알림 메시지')).toBeInTheDocument();
  });
});
