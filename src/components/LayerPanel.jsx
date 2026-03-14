import { useState, useRef } from 'react';

/**
 * 레이어 패널 컴포넌트
 * - elements를 zIndex 역순(높→낮)으로 표시
 * - 이름 더블클릭 편집
 * - 잠금/숨기기 토글
 * - HTML5 드래그로 순서 재정렬
 * - 클릭 시 선택 연동
 */
export default function LayerPanel({ elements, selectedId, setSelectedId, onReorder, onToggleLock, onToggleHide, onRename }) {
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const dragOverId = useRef(null);

  // zIndex 역순 정렬 (높은 레이어가 위에)
  const sorted = [...elements].sort((a, b) => (b.zIndex || 1) - (a.zIndex || 1));

  function handleDragStart(e, id) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  }

  function handleDragOver(e, id) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dragOverId.current = id;
  }

  function handleDrop(e, targetId) {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (sourceId === targetId) return;
    onReorder(sourceId, targetId);
    dragOverId.current = null;
  }

  function handleDoubleClick(el) {
    setEditingId(el.id);
    setEditingName(el.name || (el.type === 'text' ? '텍스트' : '이미지'));
  }

  function handleRenameBlur(id) {
    if (editingName.trim()) {
      onRename(id, editingName.trim());
    }
    setEditingId(null);
  }

  function handleRenameKeyDown(e, id) {
    if (e.key === 'Enter') handleRenameBlur(id);
    if (e.key === 'Escape') setEditingId(null);
  }

  if (elements.length === 0) {
    return (
      <div className="layer-panel">
        <p className="no-select-msg" style={{ paddingTop: 12 }}>요소가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="layer-panel">
      {sorted.map((el) => {
        const isSelected = el.id === selectedId;
        const name = el.name || (el.type === 'text' ? '텍스트' : '이미지');
        const icon = el.type === 'text' ? '📝' : '🖼';

        return (
          <div
            key={el.id}
            className={`layer-item ${isSelected ? 'layer-item--selected' : ''} ${el.locked ? 'layer-item--locked' : ''} ${el.hidden ? 'layer-item--hidden' : ''}`}
            draggable
            onClick={() => !el.locked && setSelectedId(el.id)}
            onDragStart={(e) => handleDragStart(e, el.id)}
            onDragOver={(e) => handleDragOver(e, el.id)}
            onDrop={(e) => handleDrop(e, el.id)}
          >
            <span className="layer-icon">{icon}</span>

            {editingId === el.id ? (
              <input
                className="layer-name-input"
                value={editingName}
                autoFocus
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleRenameBlur(el.id)}
                onKeyDown={(e) => handleRenameKeyDown(e, el.id)}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                className="layer-name"
                onDoubleClick={(e) => { e.stopPropagation(); handleDoubleClick(el); }}
                title="더블클릭으로 이름 변경"
              >
                {name}
              </span>
            )}

            <div className="layer-actions" onClick={(e) => e.stopPropagation()}>
              <button
                className={`layer-action-btn ${el.locked ? 'active' : ''}`}
                title={el.locked ? '잠금 해제' : '잠금'}
                onClick={() => onToggleLock(el.id)}
              >
                {el.locked ? '🔒' : '🔓'}
              </button>
              <button
                className={`layer-action-btn ${el.hidden ? 'active' : ''}`}
                title={el.hidden ? '표시' : '숨기기'}
                onClick={() => onToggleHide(el.id)}
              >
                {el.hidden ? '🙈' : '👁'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
