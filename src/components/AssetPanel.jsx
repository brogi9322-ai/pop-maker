import { useState } from 'react';
import { ASSET_CATEGORIES, getAssetsByCategory } from '../data/assets';

export default function AssetPanel({ onAddAsset }) {
  const [activeCategory, setActiveCategory] = useState(ASSET_CATEGORIES[0].id);

  const assets = getAssetsByCategory(activeCategory);

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
      </div>

      {/* 에셋 그리드 */}
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

      {/* 관리자 업로드 안내 */}
      <div className="asset-admin-notice">
        <p>관리자 에셋 업로드는 Firebase 연동 후 사용 가능합니다.</p>
      </div>
    </div>
  );
}
