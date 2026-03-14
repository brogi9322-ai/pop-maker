import { FONTS } from '../data/templates';

export default function PropsPanel({ selected, onChange, onDelete, onDuplicate, onBringFront, onSendBack }) {
  if (!selected) {
    return (
      <div className="props-panel">
        <p className="no-select-msg">캔버스에서 요소를 클릭하세요</p>
      </div>
    );
  }

  function update(field, value) {
    onChange({ ...selected, [field]: value });
  }

  const isText = selected.type === 'text';
  const isImage = selected.type === 'image';

  return (
    <div className="props-panel">
      <h3 className="props-title">{isText ? '📝 텍스트 속성' : '🖼 이미지 속성'}</h3>

      {isText && (
        <>
          <PropGroup label="내용">
            <textarea
              className="prop-textarea"
              value={selected.text}
              onChange={(e) => update('text', e.target.value)}
              rows={3}
            />
          </PropGroup>

          <PropGroup label="글씨체">
            <select
              className="prop-select"
              value={selected.fontFamily}
              onChange={(e) => update('fontFamily', e.target.value)}
            >
              {FONTS.map((f) => (
                <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                  {f.label}
                </option>
              ))}
            </select>
          </PropGroup>

          <PropGroup label={`글자 크기: ${selected.fontSize}px`}>
            <input
              type="range" className="prop-range"
              min={8} max={200} value={selected.fontSize}
              onChange={(e) => update('fontSize', Number(e.target.value))}
            />
          </PropGroup>

          <PropGroup label="굵기">
            <div className="btn-group">
              {[['보통', '400'], ['굵게', '700'], ['매우굵게', '900']].map(([label, w]) => (
                <button
                  key={w}
                  className={`toggle-btn ${selected.fontWeight === w ? 'active' : ''}`}
                  onClick={() => update('fontWeight', w)}
                >
                  {label}
                </button>
              ))}
            </div>
          </PropGroup>

          <PropGroup label="정렬">
            <div className="btn-group">
              {[
                [
                  <svg key="left" width="16" height="14" viewBox="0 0 16 14" fill="currentColor"><rect x="0" y="0" width="16" height="2" rx="1"/><rect x="0" y="4" width="11" height="2" rx="1"/><rect x="0" y="8" width="16" height="2" rx="1"/><rect x="0" y="12" width="9" height="2" rx="1"/></svg>,
                  'left',
                ],
                [
                  <svg key="center" width="16" height="14" viewBox="0 0 16 14" fill="currentColor"><rect x="0" y="0" width="16" height="2" rx="1"/><rect x="2.5" y="4" width="11" height="2" rx="1"/><rect x="0" y="8" width="16" height="2" rx="1"/><rect x="3.5" y="12" width="9" height="2" rx="1"/></svg>,
                  'center',
                ],
                [
                  <svg key="right" width="16" height="14" viewBox="0 0 16 14" fill="currentColor"><rect x="0" y="0" width="16" height="2" rx="1"/><rect x="5" y="4" width="11" height="2" rx="1"/><rect x="0" y="8" width="16" height="2" rx="1"/><rect x="7" y="12" width="9" height="2" rx="1"/></svg>,
                  'right',
                ],
              ].map(([icon, align]) => (
                <button
                  key={align}
                  className={`toggle-btn ${selected.textAlign === align ? 'active' : ''}`}
                  onClick={() => update('textAlign', align)}
                >
                  {icon}
                </button>
              ))}
            </div>
          </PropGroup>

          <PropGroup label="글자 색상">
            <input type="color" className="prop-color"
              value={selected.color}
              onChange={(e) => update('color', e.target.value)} />
          </PropGroup>

          <PropGroup label="배경 색상">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" className="prop-color"
                value={selected.bgColor === 'transparent' ? '#ffffff' : selected.bgColor}
                onChange={(e) => update('bgColor', e.target.value)}
                disabled={selected.bgColor === 'transparent'} />
              <label className="checkbox-label">
                <input type="checkbox"
                  checked={selected.bgColor === 'transparent'}
                  onChange={(e) => update('bgColor', e.target.checked ? 'transparent' : '#ffffff')} />
                투명
              </label>
            </div>
          </PropGroup>

          <PropGroup label="테두리">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" className="prop-color"
                value={selected.borderColor || '#000000'}
                onChange={(e) => update('borderColor', e.target.value)} />
              <input type="number" className="prop-number"
                min={0} max={20} value={selected.borderWidth || 0}
                onChange={(e) => update('borderWidth', Number(e.target.value))}
                placeholder="두께" />
              <span style={{ fontSize: 12 }}>px</span>
            </div>
          </PropGroup>

          <PropGroup label={`줄간격: ${selected.lineHeight}`}>
            <input type="range" className="prop-range"
              min={0.8} max={3} step={0.1} value={selected.lineHeight}
              onChange={(e) => update('lineHeight', Number(e.target.value))} />
          </PropGroup>

          <PropGroup label={`자간: ${selected.letterSpacing}px`}>
            <input type="range" className="prop-range"
              min={-5} max={30} step={0.5} value={selected.letterSpacing}
              onChange={(e) => update('letterSpacing', Number(e.target.value))} />
          </PropGroup>
        </>
      )}

      {isImage && (
        <>
          <PropGroup label={`너비: ${selected.width}px`}>
            <input type="range" className="prop-range"
              min={20} max={1500} value={selected.width}
              onChange={(e) => {
                const w = Number(e.target.value);
                if (selected.keepRatio && selected.naturalWidth) {
                  const ratio = selected.naturalHeight / selected.naturalWidth;
                  onChange({ ...selected, width: w, height: Math.round(w * ratio) });
                } else {
                  update('width', w);
                }
              }} />
          </PropGroup>

          <PropGroup label={`높이: ${selected.height}px`}>
            <input type="range" className="prop-range"
              min={20} max={1500} value={selected.height}
              onChange={(e) => {
                const h = Number(e.target.value);
                if (selected.keepRatio && selected.naturalHeight) {
                  const ratio = selected.naturalWidth / selected.naturalHeight;
                  onChange({ ...selected, height: h, width: Math.round(h * ratio) });
                } else {
                  update('height', h);
                }
              }} />
          </PropGroup>

          <PropGroup label="">
            <label className="checkbox-label">
              <input type="checkbox"
                checked={selected.keepRatio !== false}
                onChange={(e) => update('keepRatio', e.target.checked)} />
              비율 유지
            </label>
          </PropGroup>

          <PropGroup label={`투명도: ${selected.opacity}%`}>
            <input type="range" className="prop-range"
              min={10} max={100} value={selected.opacity}
              onChange={(e) => update('opacity', Number(e.target.value))} />
          </PropGroup>
        </>
      )}

      {/* 공통 속성 */}
      <div className="props-divider" />
      <h3 className="props-title">📐 위치/변형</h3>

      <PropGroup label={`X: ${Math.round(selected.x)}px`}>
        <input type="range" className="prop-range"
          min={-200} max={1500} value={selected.x}
          onChange={(e) => update('x', Number(e.target.value))} />
      </PropGroup>

      <PropGroup label={`Y: ${Math.round(selected.y)}px`}>
        <input type="range" className="prop-range"
          min={-200} max={2000} value={selected.y}
          onChange={(e) => update('y', Number(e.target.value))} />
      </PropGroup>

      <PropGroup label={`회전: ${selected.rotate || 0}°`}>
        <input type="range" className="prop-range"
          min={-180} max={180} value={selected.rotate || 0}
          onChange={(e) => update('rotate', Number(e.target.value))} />
      </PropGroup>

      <div className="props-actions">
        <button className="btn btn-sm btn-secondary" onClick={onDuplicate}>복제</button>
        <button className="btn btn-sm btn-secondary" onClick={onBringFront}>앞으로</button>
        <button className="btn btn-sm btn-secondary" onClick={onSendBack}>뒤로</button>
        <button className="btn btn-sm btn-danger" onClick={onDelete}>삭제</button>
      </div>
    </div>
  );
}

function PropGroup({ label, children }) {
  return (
    <div className="prop-group">
      {label && <label className="prop-label">{label}</label>}
      {children}
    </div>
  );
}
