import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';

const CanvasEditor = forwardRef(function CanvasEditor(
  { template, canvasSize, elements, setElements, selectedId, setSelectedId, startDrag, commitDrag, pushSnapshot },
  ref
) {
  const canvasRef = useRef(null);
  const dragState = useRef(null);
  const resizeState = useRef(null);
  const editRef = useRef(null);
  const [editingId, setEditingId] = useState(null);

  // 편집 모드 진입 시 포커스 및 커서를 끝으로 이동
  useEffect(() => {
    if (!editingId || !editRef.current) return;
    const el = elements.find((e) => e.id === editingId);
    if (!el) return;
    editRef.current.innerText = el.text;
    editRef.current.focus();
    const range = document.createRange();
    range.selectNodeContents(editRef.current);
    range.collapse(false);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
  }, [editingId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 외부에서 캔버스 DOM 접근용
  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
  }));

  // 편집 내용 커밋
  function commitEdit(el) {
    if (!editRef.current) return;
    const newText = editRef.current.innerText;
    // React가 children을 렌더링하기 전에 DOM 내용을 비워 중복 출력 방지
    editRef.current.textContent = '';
    setEditingId(null);
    if (newText !== el.text) {
      pushSnapshot(elements.map((item) => item.id === el.id ? { ...item, text: newText } : item));
    }
  }

  // 텍스트 더블클릭 → 편집 모드
  function handleTextDoubleClick(e, el) {
    e.stopPropagation();
    if (el.locked) return;
    setSelectedId(el.id);
    setEditingId(el.id);
  }

  // 편집 중 키 입력
  function handleEditKeyDown(e) {
    e.stopPropagation(); // Ctrl+Z 등 단축키 충돌 방지
    if (e.key === 'Escape') {
      editRef.current.textContent = ''; // React children 렌더링 전 DOM 클리어
      setEditingId(null);
    } else if (e.key === 'Enter') {
      // 기본 동작(<div> 삽입 + 캔버스 자동 스크롤) 차단 후 \n 문자만 삽입
      // white-space: pre-wrap 이므로 \n 이 줄바꿈으로 렌더링됨
      e.preventDefault();
      document.execCommand('insertText', false, '\n');
    }
  }

  // 캔버스 클릭 (선택 해제)
  function handleCanvasClick(e) {
    if (e.target === canvasRef.current || e.target.classList.contains('canvas-bg')) {
      setSelectedId(null);
    }
  }

  // 드래그 공통 시작 로직
  function startDragElement(clientX, clientY, id) {
    const el = elements.find((el) => el.id === id);
    if (el?.locked) return false;
    setSelectedId(id);
    startDrag?.();
    // 캔버스의 현재 뷰포트 위치를 기준으로 오프셋 계산
    // (단순히 clientX - el.x 방식은 캔버스가 스크롤된 경우 좌표가 어긋남)
    const canvasRect = canvasRef.current.getBoundingClientRect();
    dragState.current = {
      id,
      offsetX: clientX - canvasRect.left - el.x, // 요소 내 클릭 지점 오프셋
      offsetY: clientY - canvasRect.top - el.y,
    };
    return true;
  }

  // 드래그 공통 이동 로직
  function moveDragElement(clientX, clientY) {
    if (!dragState.current) return;
    const { id, offsetX, offsetY } = dragState.current;
    // 매 이동마다 캔버스 현재 위치를 다시 읽어 정확한 캔버스 좌표 계산
    const canvasRect = canvasRef.current.getBoundingClientRect();
    setElements((prev) =>
      prev.map((el) => {
        if (el.id !== id) return el;
        const elW = el.width || 60;
        const elH = el.height || (el.type === 'text' ? Math.round(el.fontSize * el.lineHeight + 16) : 30);
        const newX = Math.max(0, Math.min(canvasSize.width - elW, clientX - canvasRect.left - offsetX));
        const newY = Math.max(0, Math.min(canvasSize.height - elH, clientY - canvasRect.top - offsetY));
        return { ...el, x: newX, y: newY };
      })
    );
  }

  // 드래그 공통 종료 로직
  function endDragElement() {
    if (dragState.current) commitDrag?.();
    dragState.current = null;
  }

  // 마우스 드래그
  function handleMouseDown(e, id) {
    e.stopPropagation();
    if (!startDragElement(e.clientX, e.clientY, id)) return;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  function handleMouseMove(e) {
    moveDragElement(e.clientX, e.clientY);
  }

  function handleMouseUp() {
    endDragElement();
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }

  // 터치 드래그
  function handleTouchStart(e, id) {
    if (e.touches.length !== 1) return;
    e.stopPropagation();
    const touch = e.touches[0];
    if (!startDragElement(touch.clientX, touch.clientY, id)) return;
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
  }

  function handleTouchMove(e) {
    if (e.touches.length !== 1) return;
    e.preventDefault(); // 드래그 중 스크롤 방지
    const touch = e.touches[0];
    moveDragElement(touch.clientX, touch.clientY);
  }

  function handleTouchEnd() {
    endDragElement();
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
  }

  // 리사이즈 핸들 드래그
  function handleResizeMouseDown(e, id, direction) {
    e.stopPropagation();
    e.preventDefault();
    const el = elements.find((el) => el.id === id);
    // 리사이즈 시작 전 state를 히스토리에 임시 보관
    startDrag?.();
    resizeState.current = {
      id,
      direction,
      startX: e.clientX,
      startY: e.clientY,
      startW: el.width || 200,
      startH: el.height || 200,
      startElX: el.x,
      startElY: el.y,
    };
    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeUp);
  }

  function handleResizeMove(e) {
    if (!resizeState.current) return;
    const { id, direction, startX, startY, startW, startH, startElX, startElY } = resizeState.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    setElements((prev) =>
      prev.map((el) => {
        if (el.id !== id) return el;
        let newW = startW, newH = startH, newX = startElX, newY = startElY;

        if (direction.includes('e')) newW = Math.max(50, startW + dx);
        if (direction.includes('s')) newH = Math.max(30, startH + dy);
        if (direction.includes('w')) {
          newW = Math.max(50, startW - dx);
          newX = startElX + (startW - newW);
        }
        if (direction.includes('n')) {
          newH = Math.max(30, startH - dy);
          newY = startElY + (startH - newH);
        }

        return { ...el, width: newW, height: newH, x: newX, y: newY };
      })
    );
  }

  function handleResizeUp() {
    if (resizeState.current) {
      // 리사이즈 완료 시 히스토리 기록
      commitDrag?.();
    }
    resizeState.current = null;
    window.removeEventListener('mousemove', handleResizeMove);
    window.removeEventListener('mouseup', handleResizeUp);
  }

  return (
    <div className="canvas-scroll-area">
      <div
        ref={canvasRef}
        id="pop-canvas"
        className="pop-canvas"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          background: template ? template.background : '#ffffff',
          border: template ? template.border : '1px solid #ccc',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
        onClick={handleCanvasClick}
      >
        {elements.map((el) => {
          // 숨긴 요소는 렌더링 스킵
          if (el.hidden) return null;

          const isSelected = el.id === selectedId;

          if (el.type === 'text') {
            const isEditing = editingId === el.id;
            return (
              <div
                key={el.id}
                ref={isEditing ? editRef : null}
                className={`canvas-element text-element ${isSelected ? 'selected' : ''}`}
                contentEditable={isEditing || undefined}
                suppressContentEditableWarning
                style={{
                  position: 'absolute',
                  left: el.x,
                  top: el.y,
                  width: el.width || 'auto',
                  minWidth: 60,
                  fontFamily: el.fontFamily,
                  fontSize: el.fontSize,
                  fontWeight: el.fontWeight,
                  color: el.color,
                  backgroundColor: el.bgColor,
                  textAlign: el.textAlign,
                  lineHeight: el.lineHeight,
                  letterSpacing: `${el.letterSpacing}px`,
                  border: isSelected
                    ? '2px dashed #0066ff'
                    : `${el.borderWidth || 0}px solid ${el.borderColor || 'transparent'}`,
                  padding: '8px 12px',
                  cursor: isEditing ? 'text' : 'move',
                  userSelect: isEditing ? 'text' : 'none',
                  outline: 'none',
                  transform: `rotate(${el.rotate || 0}deg)`,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  zIndex: el.zIndex || 1,
                  boxSizing: 'border-box',
                }}
                onMouseDown={isEditing ? (e) => e.stopPropagation() : (e) => handleMouseDown(e, el.id)}
                onTouchStart={isEditing ? undefined : (e) => handleTouchStart(e, el.id)}
                onDoubleClick={(e) => handleTextDoubleClick(e, el)}
                onBlur={isEditing ? () => commitEdit(el) : undefined}
                onKeyDown={isEditing ? handleEditKeyDown : undefined}
              >
                {/* 편집 모드에서는 useEffect로 innerText 직접 설정하므로 children 렌더링 안 함 */}
                {!isEditing && el.text}
                {isSelected && !el.locked && !isEditing && <ResizeHandles id={el.id} onResizeMouseDown={handleResizeMouseDown} />}
              </div>
            );
          }

          if (el.type === 'image') {
            return (
              <div
                key={el.id}
                className={`canvas-element ${isSelected ? 'selected' : ''}`}
                style={{
                  position: 'absolute',
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  cursor: 'move',
                  transform: `rotate(${el.rotate || 0}deg)`,
                  zIndex: el.zIndex || 1,
                  border: isSelected ? '2px dashed #0066ff' : 'none',
                  boxSizing: 'border-box',
                  opacity: (el.opacity || 100) / 100,
                }}
                onMouseDown={(e) => handleMouseDown(e, el.id)}
                onTouchStart={(e) => handleTouchStart(e, el.id)}
              >
                <img
                  src={el.src}
                  alt=""
                  style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }}
                  draggable={false}
                />
                {isSelected && !el.locked && <ResizeHandles id={el.id} onResizeMouseDown={handleResizeMouseDown} />}
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
});

function ResizeHandles({ id, onResizeMouseDown }) {
  const handles = [
    { dir: 'n', style: { top: -5, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' } },
    { dir: 's', style: { bottom: -5, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' } },
    { dir: 'e', style: { right: -5, top: '50%', transform: 'translateY(-50%)', cursor: 'e-resize' } },
    { dir: 'w', style: { left: -5, top: '50%', transform: 'translateY(-50%)', cursor: 'w-resize' } },
    { dir: 'ne', style: { top: -5, right: -5, cursor: 'ne-resize' } },
    { dir: 'nw', style: { top: -5, left: -5, cursor: 'nw-resize' } },
    { dir: 'se', style: { bottom: -5, right: -5, cursor: 'se-resize' } },
    { dir: 'sw', style: { bottom: -5, left: -5, cursor: 'sw-resize' } },
  ];

  return (
    <>
      {handles.map(({ dir, style }) => (
        <div
          key={dir}
          style={{
            position: 'absolute',
            width: 10,
            height: 10,
            background: '#0066ff',
            border: '1px solid #fff',
            borderRadius: 2,
            ...style,
          }}
          onMouseDown={(e) => onResizeMouseDown(e, id, dir)}
        />
      ))}
    </>
  );
}

export default CanvasEditor;
