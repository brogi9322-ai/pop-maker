import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SharePage from './SharePage';

// react-router-dom useParams 목킹
vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: 'test-doc-id' }),
}));

// storage utils 목킹
vi.mock('../utils/storage', () => ({
  getPublicTemplate: vi.fn(),
}));

// Firebase 목킹 (storage.js 의존성 차단)
vi.mock('../firebase', () => ({ db: {}, auth: {} }));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  serverTimestamp: vi.fn(),
}));

import { getPublicTemplate } from '../utils/storage';

// 테스트용 템플릿 데이터 팩토리
function makeTemplate(overrides = {}) {
  return {
    id: 'test-doc-id',
    name: '테스트 POP',
    canvasData: {
      template: { background: '#ffffff', border: '1px solid #ccc' },
      canvasSize: { width: 300, height: 300 },
      elements: [],
    },
    ...overrides,
  };
}

describe('SharePage — 로딩 상태', () => {
  beforeEach(() => {
    // getPublicTemplate이 절대 resolve되지 않아 로딩 상태 유지
    getPublicTemplate.mockReturnValue(new Promise(() => {}));
  });

  it('로딩 중 텍스트가 표시된다', () => {
    render(<SharePage />);
    expect(screen.getByText('불러오는 중...')).toBeInTheDocument();
  });
});

describe('SharePage — 에러 상태', () => {
  beforeEach(() => {
    getPublicTemplate.mockRejectedValue(new Error('템플릿을 찾을 수 없습니다.'));
  });

  it('에러 메시지가 표시된다', async () => {
    render(<SharePage />);
    await waitFor(() => {
      expect(screen.getByText('템플릿을 찾을 수 없습니다.')).toBeInTheDocument();
    });
  });

  it('POP 제작기로 돌아가는 링크가 표시된다', async () => {
    render(<SharePage />);
    await waitFor(() => {
      expect(screen.getByText(/POP 제작기로 돌아가기/)).toBeInTheDocument();
    });
  });
});

describe('SharePage — 정상 렌더링', () => {
  beforeEach(() => {
    getPublicTemplate.mockResolvedValue(makeTemplate());
  });

  it('템플릿 이름이 표시된다', async () => {
    render(<SharePage />);
    await waitFor(() => {
      expect(screen.getByText('테스트 POP')).toBeInTheDocument();
    });
  });

  it('읽기 전용 미리보기 배지가 표시된다', async () => {
    render(<SharePage />);
    await waitFor(() => {
      expect(screen.getByText('읽기 전용 미리보기')).toBeInTheDocument();
    });
  });

  it('직접 만들어보기 링크가 표시된다', async () => {
    render(<SharePage />);
    await waitFor(() => {
      expect(screen.getByText(/직접 만들어보기/)).toBeInTheDocument();
    });
  });
});

describe('SharePage — 텍스트 요소 렌더링', () => {
  beforeEach(() => {
    getPublicTemplate.mockResolvedValue(
      makeTemplate({
        canvasData: {
          template: { background: '#ffffff', border: 'none' },
          canvasSize: { width: 300, height: 300 },
          elements: [
            {
              id: 'text-1',
              type: 'text',
              text: '할인 중!',
              x: 10, y: 10, width: 200,
              fontSize: 24, fontWeight: '700',
              color: '#333', bgColor: 'transparent',
              textAlign: 'center', lineHeight: 1.4,
              letterSpacing: 0, borderWidth: 0, borderColor: '#000',
              rotate: 0, zIndex: 1, hidden: false,
            },
          ],
        },
      })
    );
  });

  it('텍스트 요소의 텍스트가 화면에 렌더링된다', async () => {
    render(<SharePage />);
    await waitFor(() => {
      expect(screen.getByText('할인 중!')).toBeInTheDocument();
    });
  });
});

describe('SharePage — 이미지 요소 렌더링', () => {
  beforeEach(() => {
    getPublicTemplate.mockResolvedValue(
      makeTemplate({
        canvasData: {
          template: { background: '#ffffff', border: 'none' },
          canvasSize: { width: 300, height: 300 },
          elements: [
            {
              id: 'img-1',
              type: 'image',
              src: 'https://example.com/icon.svg',
              x: 50, y: 50,
              width: 100, height: 100,
              rotate: 0, opacity: 100,
              zIndex: 1, hidden: false,
            },
          ],
        },
      })
    );
  });

  it('이미지 요소가 렌더링된다', async () => {
    render(<SharePage />);
    await waitFor(() => {
      // SharePage의 img는 alt=""(장식용)이므로 querySelector로 조회
      const img = document.querySelector('img[src="https://example.com/icon.svg"]');
      expect(img).toBeInTheDocument();
    });
  });
});

describe('SharePage — 숨김 요소 처리', () => {
  beforeEach(() => {
    getPublicTemplate.mockResolvedValue(
      makeTemplate({
        canvasData: {
          template: { background: '#ffffff', border: 'none' },
          canvasSize: { width: 300, height: 300 },
          elements: [
            {
              id: 'text-visible',
              type: 'text',
              text: '보이는 텍스트',
              x: 10, y: 10, width: 200,
              fontSize: 20, fontWeight: '400',
              color: '#000', bgColor: 'transparent',
              textAlign: 'left', lineHeight: 1.4,
              letterSpacing: 0, borderWidth: 0, borderColor: '#000',
              rotate: 0, zIndex: 1, hidden: false,
            },
            {
              id: 'text-hidden',
              type: 'text',
              text: '숨겨진 텍스트',
              x: 10, y: 50, width: 200,
              fontSize: 20, fontWeight: '400',
              color: '#000', bgColor: 'transparent',
              textAlign: 'left', lineHeight: 1.4,
              letterSpacing: 0, borderWidth: 0, borderColor: '#000',
              rotate: 0, zIndex: 2, hidden: true,
            },
          ],
        },
      })
    );
  });

  it('hidden=true인 요소는 렌더링되지 않는다', async () => {
    render(<SharePage />);
    await waitFor(() => {
      expect(screen.getByText('보이는 텍스트')).toBeInTheDocument();
      expect(screen.queryByText('숨겨진 텍스트')).not.toBeInTheDocument();
    });
  });
});
