import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BanplusModal from './BanplusModal';

// "1248902463" — 국세청 체크섬 알고리즘 통과 번호
const VALID_BIZ = '124-89-02463';

function renderModal(props = {}) {
  const onLogin = props.onLogin ?? vi.fn();
  const onClose = props.onClose ?? vi.fn();
  return {
    onLogin,
    onClose,
    ...render(<BanplusModal onLogin={onLogin} onClose={onClose} />),
  };
}

describe('BanplusModal — 렌더링', () => {
  it('사업자번호 입력 필드와 "인증하기" 버튼이 표시된다', () => {
    renderModal();
    expect(screen.getByPlaceholderText('000-00-00000')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '인증하기' })).toBeInTheDocument();
  });

  it('"취소" 버튼이 표시된다', () => {
    renderModal();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });
});

describe('BanplusModal — 입력 포맷팅', () => {
  it('숫자 입력 시 하이픈이 자동 삽입된다 (xxx-xx-xxxxx)', async () => {
    const user = userEvent.setup();
    renderModal();
    const input = screen.getByPlaceholderText('000-00-00000');

    await user.type(input, '1248902463');

    expect(input.value).toBe(VALID_BIZ);
  });
});

describe('BanplusModal — 유효성 검사', () => {
  it('빈 값 제출 시 에러 메시지가 표시되고 onLogin이 호출되지 않는다', async () => {
    const user = userEvent.setup();
    const { onLogin } = renderModal();

    await user.click(screen.getByRole('button', { name: '인증하기' }));

    expect(screen.getByText('유효하지 않은 사업자번호입니다. 다시 확인해주세요.')).toBeInTheDocument();
    expect(onLogin).not.toHaveBeenCalled();
  });

  it('체크섬 오류 번호 제출 시 에러 메시지가 표시된다', async () => {
    const user = userEvent.setup();
    renderModal();
    const input = screen.getByPlaceholderText('000-00-00000');

    await user.type(input, '1234567890'); // 체크섬 불일치
    await user.click(screen.getByRole('button', { name: '인증하기' }));

    expect(screen.getByText('유효하지 않은 사업자번호입니다. 다시 확인해주세요.')).toBeInTheDocument();
  });

  it('새 입력 시 에러 메시지가 사라진다', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: '인증하기' }));
    expect(screen.getByText(/유효하지 않은/)).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('000-00-00000'), '1');
    expect(screen.queryByText(/유효하지 않은/)).not.toBeInTheDocument();
  });
});

describe('BanplusModal — 제출 성공', () => {
  it('유효한 사업자번호 제출 시 onLogin(bizNumber)가 호출된다', async () => {
    const user = userEvent.setup();
    const { onLogin } = renderModal();
    const input = screen.getByPlaceholderText('000-00-00000');

    await user.type(input, '1248902463');
    await user.click(screen.getByRole('button', { name: '인증하기' }));

    expect(onLogin).toHaveBeenCalledWith(VALID_BIZ);
  });
});

describe('BanplusModal — 닫기', () => {
  it('"취소" 버튼 클릭 시 onClose가 호출된다', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    await user.click(screen.getByRole('button', { name: '취소' }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('"✕" 버튼 클릭 시 onClose가 호출된다', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    await user.click(screen.getByRole('button', { name: '✕' }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('오버레이 클릭 시 onClose가 호출된다', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    // modal-overlay를 직접 클릭
    const overlay = document.querySelector('.modal-overlay');
    await user.click(overlay);

    expect(onClose).toHaveBeenCalledOnce();
  });
});
