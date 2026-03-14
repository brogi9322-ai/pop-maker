import { useState } from 'react';
import { TEMPLATES, CATEGORIES } from '../data/templates';

export default function TemplatePanel({ onSelect }) {
  const [activeCategory, setActiveCategory] = useState('전체');

  const filtered =
    activeCategory === '전체'
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === activeCategory);

  return (
    <div className="template-panel">
      <div className="category-tabs">
        <button
          className={`cat-tab ${activeCategory === '전체' ? 'active' : ''}`}
          onClick={() => setActiveCategory('전체')}
        >
          전체
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`cat-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="template-grid">
        {filtered.map((tpl) => (
          <button
            key={tpl.id}
            className="template-item"
            onClick={() => onSelect(tpl)}
            title={tpl.name}
          >
            <div
              className="template-preview"
              style={{
                background: tpl.background,
                border: tpl.border,
              }}
            >
              <span
                className="template-preview-text"
                style={{ color: tpl.textColor }}
              >
                {tpl.defaultText.slice(0, 4)}
              </span>
            </div>
            <span className="template-name">{tpl.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
