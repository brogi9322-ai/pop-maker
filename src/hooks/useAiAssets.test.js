import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAiAssets } from './useAiAssets';

// generateSvgAsset 목킹
vi.mock('../utils/claudeSvg', () => ({
  generateSvgAsset: vi.fn(),
}));

import { generateSvgAsset } from '../utils/claudeSvg';

const STORAGE_KEY = 'pop-maker-ai-assets';

describe('useAiAssets', () => {
  beforeEach(() => {
    // 각 테스트 전 localStorage 초기화
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('localStorage가 비어있을 때 aiAssets는 빈 배열이다', () => {
    const { result } = renderHook(() => useAiAssets());
    expect(result.current.aiAssets).toEqual([]);
  });

  it('localStorage에 저장된 AI 에셋이 있으면 초기 상태로 복원한다', () => {
    const stored = [
      { id: 'test-id-1', name: '하트', src: 'data:image/svg+xml;base64,abc', isAiGenerated: true, createdAt: 1000 },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    const { result } = renderHook(() => useAiAssets());
    expect(result.current.aiAssets).toEqual(stored);
  });

  it('localStorage JSON이 손상되어 있을 때 빈 배열을 반환한다', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid-json{');

    const { result } = renderHook(() => useAiAssets());
    expect(result.current.aiAssets).toEqual([]);
  });

  it('초기 generating 상태는 false이다', () => {
    const { result } = renderHook(() => useAiAssets());
    expect(result.current.generating).toBe(false);
  });

  describe('generateAsset', () => {
    it('성공 시 aiAssets에 새 에셋이 추가된다', async () => {
      const mockSrc = 'data:image/svg+xml;base64,abc123';
      generateSvgAsset.mockResolvedValue(mockSrc);

      const { result } = renderHook(() => useAiAssets());

      await act(async () => {
        await result.current.generateAsset('빨간 하트', vi.fn(), vi.fn());
      });

      expect(result.current.aiAssets).toHaveLength(1);
      expect(result.current.aiAssets[0]).toMatchObject({
        name: '빨간 하트',
        src: mockSrc,
        isAiGenerated: true,
      });
      expect(result.current.aiAssets[0].id).toBeDefined();
    });

    it('성공 시 localStorage에 에셋이 저장된다', async () => {
      const mockSrc = 'data:image/svg+xml;base64,saved';
      generateSvgAsset.mockResolvedValue(mockSrc);

      const { result } = renderHook(() => useAiAssets());

      await act(async () => {
        await result.current.generateAsset('약국', vi.fn(), vi.fn());
      });

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe('약국');
      expect(stored[0].src).toBe(mockSrc);
    });

    it('성공 시 onSuccess 콜백이 호출된다', async () => {
      generateSvgAsset.mockResolvedValue('data:image/svg+xml;base64,ok');

      const { result } = renderHook(() => useAiAssets());
      const onSuccess = vi.fn();

      await act(async () => {
        await result.current.generateAsset('아이콘', vi.fn(), onSuccess);
      });

      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it('실패 시 onError 콜백이 에러 메시지와 함께 호출된다', async () => {
      generateSvgAsset.mockRejectedValue(new Error('API 키가 없습니다'));

      const { result } = renderHook(() => useAiAssets());
      const onError = vi.fn();

      await act(async () => {
        await result.current.generateAsset('아이콘', onError, vi.fn());
      });

      expect(onError).toHaveBeenCalledWith('API 키가 없습니다');
    });

    it('실패 시 aiAssets에 추가되지 않는다', async () => {
      generateSvgAsset.mockRejectedValue(new Error('실패'));

      const { result } = renderHook(() => useAiAssets());

      await act(async () => {
        await result.current.generateAsset('아이콘', vi.fn(), vi.fn());
      });

      expect(result.current.aiAssets).toHaveLength(0);
    });

    it('빈 프롬프트 입력 시 generateSvgAsset을 호출하지 않는다', async () => {
      const { result } = renderHook(() => useAiAssets());

      await act(async () => {
        await result.current.generateAsset('   ', vi.fn(), vi.fn());
      });

      expect(generateSvgAsset).not.toHaveBeenCalled();
    });

    it('생성 중 generating 상태가 true가 된다', async () => {
      let resolvePromise;
      generateSvgAsset.mockImplementation(
        () => new Promise((resolve) => { resolvePromise = resolve; })
      );

      const { result } = renderHook(() => useAiAssets());

      act(() => {
        result.current.generateAsset('아이콘', vi.fn(), vi.fn());
      });

      // 비동기 완료 전 generating이 true여야 함
      expect(result.current.generating).toBe(true);

      await act(async () => {
        resolvePromise('data:image/svg+xml;base64,done');
      });

      expect(result.current.generating).toBe(false);
    });

    it('에셋 이름은 프롬프트 앞 20자로 잘린다', async () => {
      generateSvgAsset.mockResolvedValue('data:image/svg+xml;base64,abc');

      const { result } = renderHook(() => useAiAssets());
      const longPrompt = '이것은 매우 긴 프롬프트로 20자를 초과합니다요';

      await act(async () => {
        await result.current.generateAsset(longPrompt, vi.fn(), vi.fn());
      });

      expect(result.current.aiAssets[0].name).toBe(longPrompt.slice(0, 20));
    });
  });

  describe('removeAsset', () => {
    it('특정 id의 에셋을 목록에서 제거한다', async () => {
      generateSvgAsset.mockResolvedValue('data:image/svg+xml;base64,r1');
      const { result } = renderHook(() => useAiAssets());

      // 에셋 2개 추가
      await act(async () => {
        await result.current.generateAsset('에셋1', vi.fn(), vi.fn());
      });
      generateSvgAsset.mockResolvedValue('data:image/svg+xml;base64,r2');
      await act(async () => {
        await result.current.generateAsset('에셋2', vi.fn(), vi.fn());
      });

      expect(result.current.aiAssets).toHaveLength(2);

      const idToRemove = result.current.aiAssets[1].id;

      act(() => {
        result.current.removeAsset(idToRemove);
      });

      expect(result.current.aiAssets).toHaveLength(1);
      expect(result.current.aiAssets.find((a) => a.id === idToRemove)).toBeUndefined();
    });

    it('제거 후 localStorage가 갱신된다', async () => {
      generateSvgAsset.mockResolvedValue('data:image/svg+xml;base64,rm');
      const { result } = renderHook(() => useAiAssets());

      await act(async () => {
        await result.current.generateAsset('삭제될 에셋', vi.fn(), vi.fn());
      });

      const id = result.current.aiAssets[0].id;

      act(() => {
        result.current.removeAsset(id);
      });

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(stored).toHaveLength(0);
    });

    it('존재하지 않는 id 삭제 시 기존 에셋 목록이 유지된다', async () => {
      generateSvgAsset.mockResolvedValue('data:image/svg+xml;base64,keep');
      const { result } = renderHook(() => useAiAssets());

      await act(async () => {
        await result.current.generateAsset('유지될 에셋', vi.fn(), vi.fn());
      });

      act(() => {
        result.current.removeAsset('non-existent-id');
      });

      expect(result.current.aiAssets).toHaveLength(1);
    });
  });
});
