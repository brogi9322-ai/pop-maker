import { useState } from 'react';
import { ASSET_CATEGORIES, getAssetsByCategory } from '../data/assets';

// AI 생성 탭 전용 카테고리 ID
const AI_TAB_ID = 'ai-generated';

export default function AssetPanel({
  onAddAsset,
  aiAssets = [],
  generating = false,
  onGenerateAsset,
  onRemoveAiAsset,
}) {
  const [activeCategory, setActiveCategory] = useState(ASSET_CATEGORIES[0].id);
  const [aiPrompt, setAiPrompt] = useState('');

  // Claude API 키 설정 여부 확인 (미설정 시 AI 탭 비활성화)
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
  const isApiKeySet = apiKey && !apiKey.startsWith('your_');

  const isAiTab = activeCategory === AI_TAB_ID;
  const assets = isAiTab ? [] : getAssetsByCategory(activeCategory);

  /**
   * AI 에셋 생성 버튼 클릭 핸들러
   */
  function handleGenerateClick() {
    if (!aiPrompt.trim() || generating) return;
    onGenerateAsset?.(aiPrompt);
    setAiPrompt('');
  }

  /**
   * 입력창에서 Enter 키 입력 시 생성 실행
   */
  function handlePromptKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerateClick();
    }
  }

  return (
    <div className="asset-panel">
      {/* 카테고리 탭 */}
      <div className="category-tabs">
        {ASSET_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`cat-tab ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
        {/* AI 생성 탭 — 기존 카테고리 탭 목록 끝에 추가 */}
        <button
          className={`cat-tab cat-tab--ai ${activeCategory === AI_TAB_ID ? 'active' : ''}`}
          onClick={() => setActiveCategory(AI_TAB_ID)}
        >
          ✨ AI 생성
        </button>
      </div>

      {/* AI 생성 탭 전용 UI */}
      {isAiTab && (
        <div className="ai-asset-section">
          {isApiKeySet ? (
            <>
              {/* 프롬프트 입력 영역 */}
              <div className="ai-prompt-area">
                <input
                  type="text"
                  className="ai-prompt-input"
                  placeholder="그릴 아이콘을 설명하세요: 빨간 하트, 약국 로고 등"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={handlePromptKeyDown}
                  disabled={generating}
                />
                <button
                  className="btn btn-accent ai-generate-btn"
                  onClick={handleGenerateClick}
                  disabled={generating || !aiPrompt.trim()}
                >
                  {generating ? 'AI가 그리는 중...' : '생성'}
                </button>
              </div>

              {/* 생성된 AI 에셋 그리드 */}
              {aiAssets.length > 0 ? (
                <div className="asset-grid">
                  {aiAssets.map((asset) => (
                    <div key={asset.id} className="asset-item-wrapper">
                      <button
                        className="asset-item"
                        onClick={() => onAddAsset(asset)}
                        title={asset.name}
                      >
                        <img
                          src={asset.src}
                          alt={asset.name}
                          className="asset-preview"
                          draggable={false}
                        />
                        <span className="asset-name">{asset.name}</span>
                      </button>
                      {/* 개별 삭제 버튼 */}
                      <button
                        className="ai-asset-delete-btn"
                        onClick={() => onRemoveAiAsset?.(asset.id)}
                        title={`${asset.name} 삭제`}
                        aria-label={`${asset.name} 삭제`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="ai-empty-hint">
                  위 입력창에 설명을 입력하고 생성 버튼을 눌러보세요.
                </p>
              )}
            </>
          ) : (
            /* API 키 미설정 시 안내 메시지 */
            <div className="ai-api-key-notice">
              <p>API 키가 설정되지 않았습니다.</p>
              <p className="ai-api-key-notice-detail">
                .env 파일에 <code>VITE_CLAUDE_API_KEY</code>를 추가하세요.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 기존 카테고리 에셋 그리드 */}
      {!isAiTab && (
        <div className="asset-grid">
          {assets.map((asset) => (
            <button
              key={asset.id}
              className="asset-item"
              onClick={() => onAddAsset(asset)}
              title={asset.name}
            >
              <img src={asset.src} alt={asset.name} className="asset-preview" draggable={false} />
              <span className="asset-name">{asset.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* 관리자 업로드 안내 */}
      <div className="asset-admin-notice">
        <p>관리자 에셋 업로드는 Firebase 연동 후 사용 가능합니다.</p>
      </div>
    </div>
  );
}
