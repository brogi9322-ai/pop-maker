// AI 생성 에셋 상태 관리 훅
// localStorage에 영속 저장하여 새로고침 후에도 유지

import { useState } from 'react';
import { genId } from '../utils/id';
import { generateSvgAsset } from '../utils/claudeSvg';

// localStorage 키 — 기존 프로젝트 패턴과 일관성 유지
const STORAGE_KEY = 'pop-maker-ai-assets';

// AI 에셋 최대 저장 개수 (localStorage 5MB 한도 초과 방지)
const MAX_AI_ASSETS = 50;

/**
 * localStorage에서 AI 에셋 목록을 불러온다.
 * @returns {Array} 저장된 AI 에셋 배열 (파싱 실패 시 빈 배열)
 */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * AI 에셋 목록을 localStorage에 저장한다.
 * @param {Array} assets - 저장할 에셋 배열
 */
function saveToStorage(assets) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
  } catch {
    // localStorage 용량 초과 시 무시 (기능 동작은 계속)
  }
}

/**
 * AI 생성 에셋 상태 관리 훅
 * @returns {{ aiAssets, generating, generateAsset, removeAsset }}
 */
export function useAiAssets() {
  // lazy initializer로 컴포넌트 마운트 시 localStorage에서 복원
  const [aiAssets, setAiAssets] = useState(loadFromStorage);
  const [generating, setGenerating] = useState(false);

  /**
   * Claude API를 호출해 SVG를 생성하고 에셋 목록에 추가한다.
   * @param {string} prompt - 생성할 아이콘 설명
   * @param {Function} onError - 에러 발생 시 콜백 (에러 메시지 문자열 전달)
   * @param {Function} onSuccess - 생성 성공 시 콜백
   */
  async function generateAsset(prompt, onError, onSuccess) {
    if (!prompt.trim()) return;

    setGenerating(true);
    try {
      const src = await generateSvgAsset(prompt.trim());
      const newAsset = {
        id: genId(),
        name: prompt.trim().slice(0, 20),
        src,
        isAiGenerated: true,
        createdAt: Date.now(),
      };

      setAiAssets((prev) => {
        // 최대 개수 초과 시 가장 오래된 에셋 제거
        const withNew = [newAsset, ...prev];
        const updated = withNew.slice(0, MAX_AI_ASSETS);
        saveToStorage(updated);
        return updated;
      });

      onSuccess?.();
    } catch (e) {
      onError?.(e.message);
    } finally {
      setGenerating(false);
    }
  }

  /**
   * 특정 AI 에셋을 목록에서 삭제한다.
   * @param {string} id - 삭제할 에셋 ID
   */
  function removeAsset(id) {
    setAiAssets((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }

  return { aiAssets, generating, generateAsset, removeAsset };
}
