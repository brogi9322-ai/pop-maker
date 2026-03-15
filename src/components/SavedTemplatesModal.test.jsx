import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SavedTemplatesModal from './SavedTemplatesModal';

// storage 전체 목킹
vi.mock('../utils/storage', () => ({
  getMyTemplates: vi.fn(),
  getAllTemplates: vi.fn(),
  getBanplusMyTemplates: vi.fn(),
  deleteTemplate: vi.fn(),
  updateTemplateVisibility: vi.fn(),
  getUserId: vi.fn(() => 'user_me'),
}));

import {
  getMyTemplates,
  getAllTemplates,
  getBanplusMyTemplates,
  deleteTemplate,
} from '../utils/storage';

// 테스트용 템플릿 팩토리
function makeTemplate(overrides = {}) {
  return {
    id: 'tpl-1',
    name: '테스트 템플릿',
    userId: 'user_me',
    isPublic: false,
    isBanplus: false,
    bizNumber: null,
    updatedAt: { toDate: () => new Date('2026-03-15') },
    ...overrides,
  };
}

function renderModal(props = {}) {
  const onLoad = props.onLoad ?? vi.fn();
  const onClose = props.onClose ?? vi.fn();
  return {
    onLoad,
    onClose,
    ...render(
      <SavedTemplatesModal
        isBanplus={props.isBanplus ?? false}
        bizNumber={props.bizNumber ?? ''}
        onLoad={onLoad}
        onClose={onClose}
      />
    ),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(window, 'confirm').mockReturnValue(true);
});

describe('SavedTemplatesModal — 기본 렌더링', () => {
  it('"내 템플릿" 탭이 기본 선택된다', async () => {
    getMyTemplates.mockResolvedValue([]);

    renderModal();

    expect(screen.getByRole('button', { name: '내 템플릿' })).toHaveClass('active');
  });

  it('로딩 중 "불러오는 중..." 텍스트가 표시된다', () => {
    getMyTemplates.mockReturnValue(new Promise(() => {})); // 영원히 pending

    renderModal();

    expect(screen.getByText('불러오는 중...')).toBeInTheDocument();
  });

  it('빈 목록이면 "저장된 템플릿이 없습니다." 표시', async () => {
    getMyTemplates.mockResolvedValue([]);

    renderModal();

    await waitFor(() => {
      expect(screen.getByText('저장된 템플릿이 없습니다.')).toBeInTheDocument();
    });
  });

  it('로딩 완료 후 템플릿 이름이 표시된다', async () => {
    getMyTemplates.mockResolvedValue([makeTemplate({ name: '내 멋진 템플릿' })]);

    renderModal();

    await waitFor(() => {
      expect(screen.getByText('내 멋진 템플릿')).toBeInTheDocument();
    });
  });
});

describe('SavedTemplatesModal — 탭 전환', () => {
  it('일반 사용자에게는 "전체 템플릿" 탭이 표시되지 않는다', async () => {
    getMyTemplates.mockResolvedValue([]);

    renderModal({ isBanplus: false });

    expect(screen.queryByText('🏪 전체 템플릿')).not.toBeInTheDocument();
  });

  it('밴플러스 사용자에게는 "전체 템플릿" 탭이 표시된다', async () => {
    getBanplusMyTemplates.mockResolvedValue([]);

    renderModal({ isBanplus: true, bizNumber: '124-89-02463' });

    expect(screen.getByText('🏪 전체 템플릿')).toBeInTheDocument();
  });

  it('밴플러스 사용자가 "전체 템플릿" 탭 클릭 시 해당 탭이 활성화된다', async () => {
    const user = userEvent.setup();
    getBanplusMyTemplates.mockResolvedValue([]);
    getAllTemplates.mockResolvedValue([]);

    renderModal({ isBanplus: true, bizNumber: '124-89-02463' });

    await user.click(screen.getByText('🏪 전체 템플릿'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '🏪 전체 템플릿' })).toHaveClass('active');
    });
  });
});

describe('SavedTemplatesModal — 에러 상태', () => {
  it('네트워크 에러 시 에러 메시지가 표시된다', async () => {
    const networkError = new Error('network error');
    networkError.code = 'unavailable';
    getMyTemplates.mockRejectedValue(networkError);

    renderModal();

    await waitFor(() => {
      expect(screen.getByText('네트워크 연결을 확인해 주세요.')).toBeInTheDocument();
    });
  });

  it('일반 에러 시 재시도 안내 메시지가 표시된다', async () => {
    getMyTemplates.mockRejectedValue(new Error('unknown error'));

    renderModal();

    await waitFor(() => {
      expect(screen.getByText('템플릿을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')).toBeInTheDocument();
    });
  });
});

describe('SavedTemplatesModal — 소유자 액션', () => {
  it('소유자에게만 공개/비공개 토글 버튼이 표시된다', async () => {
    getMyTemplates.mockResolvedValue([makeTemplate({ userId: 'user_me' })]);

    renderModal();

    await waitFor(() => {
      expect(screen.getByTitle(/공개 중|비공개/)).toBeInTheDocument();
    });
  });

  it('타인 템플릿에는 액션 버튼이 표시되지 않는다', async () => {
    getMyTemplates.mockResolvedValue([makeTemplate({ userId: 'user_other' })]);

    renderModal();

    await waitFor(() => {
      expect(screen.queryByTitle(/공개 중|비공개/)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '삭제' })).not.toBeInTheDocument();
    });
  });

  it('공개 템플릿에만 "링크 복사" 버튼이 표시된다', async () => {
    getMyTemplates.mockResolvedValue([makeTemplate({ isPublic: true })]);

    renderModal();

    await waitFor(() => {
      expect(screen.getByTitle('공유 링크 복사')).toBeInTheDocument();
    });
  });

  it('비공개 템플릿에는 "링크 복사" 버튼이 없다', async () => {
    getMyTemplates.mockResolvedValue([makeTemplate({ isPublic: false })]);

    renderModal();

    await waitFor(() => {
      expect(screen.queryByTitle('공유 링크 복사')).not.toBeInTheDocument();
    });
  });

  it('"링크 복사" 클릭 시 clipboard 실패 시 에러 메시지가 표시된다', async () => {
    const user = userEvent.setup();
    getMyTemplates.mockResolvedValue([makeTemplate({ id: 'tpl-1', isPublic: true })]);

    // clipboard.writeText가 reject되도록 설정 (jsdom은 clipboard API를 HTTPS에서만 허용)
    Object.defineProperty(navigator, 'clipboard', {
      get: () => ({ writeText: () => Promise.reject(new Error('clipboard blocked')) }),
      configurable: true,
    });

    renderModal();

    await waitFor(() => screen.getByTitle('공유 링크 복사'));
    await user.click(screen.getByTitle('공유 링크 복사'));

    await waitFor(() => {
      expect(screen.getByText('링크 복사에 실패했습니다. 수동으로 복사해 주세요.')).toBeInTheDocument();
    });
  });
});

describe('SavedTemplatesModal — 삭제', () => {
  it('삭제 버튼 클릭 → confirm → deleteTemplate 호출', async () => {
    const user = userEvent.setup();
    deleteTemplate.mockResolvedValue(undefined);
    getMyTemplates.mockResolvedValue([makeTemplate()]);

    renderModal();

    await waitFor(() => screen.getByRole('button', { name: '삭제' }));
    await user.click(screen.getByRole('button', { name: '삭제' }));

    expect(window.confirm).toHaveBeenCalledWith('삭제하시겠습니까?');
    expect(deleteTemplate).toHaveBeenCalledWith('tpl-1');
  });

  it('confirm 취소 시 deleteTemplate이 호출되지 않는다', async () => {
    const user = userEvent.setup();
    window.confirm.mockReturnValue(false);
    getMyTemplates.mockResolvedValue([makeTemplate()]);

    renderModal();

    await waitFor(() => screen.getByRole('button', { name: '삭제' }));
    await user.click(screen.getByRole('button', { name: '삭제' }));

    expect(deleteTemplate).not.toHaveBeenCalled();
  });
});

describe('SavedTemplatesModal — 닫기 및 로드', () => {
  it('✕ 버튼 클릭 시 onClose가 호출된다', async () => {
    const user = userEvent.setup();
    getMyTemplates.mockResolvedValue([]);
    const { onClose } = renderModal();

    await waitFor(() => screen.queryByText('불러오는 중...')?.textContent || true);
    await user.click(screen.getByRole('button', { name: '✕' }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('템플릿 클릭 시 onLoad(tpl)이 호출된다', async () => {
    const user = userEvent.setup();
    const tpl = makeTemplate({ name: '클릭할 템플릿' });
    getMyTemplates.mockResolvedValue([tpl]);
    const { onLoad } = renderModal();

    await waitFor(() => screen.getByText('클릭할 템플릿'));
    await user.click(screen.getByText('클릭할 템플릿'));

    expect(onLoad).toHaveBeenCalledWith(tpl);
  });
});
