import { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import TemplatePanel from './components/TemplatePanel';
import CanvasEditor from './components/CanvasEditor';
import PropsPanel from './components/PropsPanel';
import LayerPanel from './components/LayerPanel';
import BanplusModal from './components/BanplusModal';
import SavedTemplatesModal from './components/SavedTemplatesModal';
import { useAuth } from './hooks/useAuth';
import { useHistory } from './hooks/useHistory';
import { CANVAS_SIZES } from './data/templates';
import { saveTemplate, updateTemplate } from './utils/storage';
import './App.css';

let nextId = 1;
function genId() { return `el_${nextId++}`; }

export default function App() {
  const { isBanplus, bizNumber, login, logout } = useAuth();

  const [template, setTemplate] = useState(null);
  const [canvasSize, setCanvasSize] = useState(CANVAS_SIZES[0]);
  const [selectedId, setSelectedId] = useState(null);
  const [showBanplusModal, setShowBanplusModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [currentDocId, setCurrentDocId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [leftTab, setLeftTab] = useState('template'); // 'template' | 'layer'

  // 직접 입력 캔버스 크기
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');

  const canvasRef = useRef(null);

  // Undo/Redo 히스토리
  const { elements, setElements, pushSnapshot, startDrag, commitDrag, undo, redo, canUndo, canRedo } = useHistory([]);

  const selectedEl = elements.find((el) => el.id === selectedId) || null;

  // Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y 단축키
  useEffect(() => {
    function handleKeyDown(e) {
      // 텍스트 입력 중에는 단축키 무시
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
        e.preventDefault();
        redo();
      } else if (e.ctrlKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  function handleSelectTemplate(tpl) {
    setTemplate(tpl);
    pushSnapshot([]);
    setSelectedId(null);
    setCurrentDocId(null);
  }

  function addText() {
    const el = {
      id: genId(),
      type: 'text',
      name: '텍스트',
      text: '텍스트 입력',
      x: 100,
      y: 100,
      width: 300,
      fontFamily: "'Noto Sans KR', sans-serif",
      fontSize: 40,
      fontWeight: '700',
      color: template?.textColor || '#333333',
      bgColor: 'transparent',
      textAlign: 'center',
      lineHeight: 1.4,
      letterSpacing: 0,
      borderColor: '#000000',
      borderWidth: 0,
      rotate: 0,
      zIndex: elements.length + 1,
      locked: false,
      hidden: false,
    };
    pushSnapshot([...elements, el]);
    setSelectedId(el.id);
  }

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxW = Math.min(img.naturalWidth, canvasSize.width * 0.6);
        const ratio = img.naturalHeight / img.naturalWidth;
        const el = {
          id: genId(),
          type: 'image',
          name: '이미지',
          src: ev.target.result,
          x: 80,
          y: 80,
          width: maxW,
          height: Math.round(maxW * ratio),
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          keepRatio: true,
          opacity: 100,
          rotate: 0,
          zIndex: elements.length + 1,
          locked: false,
          hidden: false,
        };
        pushSnapshot([...elements, el]);
        setSelectedId(el.id);
      };
      img.onerror = () => alert('이미지를 불러올 수 없습니다. 다른 파일을 선택해주세요.');
      img.src = ev.target.result;
    };
    reader.onerror = () => alert('파일을 읽는 중 오류가 발생했습니다.');
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function handleChangeElement(updated) {
    setElements((prev) => prev.map((el) => (el.id === updated.id ? updated : el)));
  }

  function handleDelete() {
    pushSnapshot(elements.filter((el) => el.id !== selectedId));
    setSelectedId(null);
  }

  function handleDuplicate() {
    const el = elements.find((el) => el.id === selectedId);
    if (!el) return;
    const copy = { ...el, id: genId(), x: el.x + 20, y: el.y + 20, zIndex: elements.length + 1 };
    pushSnapshot([...elements, copy]);
    setSelectedId(copy.id);
  }

  function handleBringFront() {
    pushSnapshot(
      elements.map((el) =>
        el.id === selectedId ? { ...el, zIndex: (el.zIndex || 1) + 1 } : el
      )
    );
  }

  function handleSendBack() {
    pushSnapshot(
      elements.map((el) =>
        el.id === selectedId ? { ...el, zIndex: Math.max(1, (el.zIndex || 1) - 1) } : el
      )
    );
  }

  // 레이어 패널 — 드래그 재정렬
  function handleLayerReorder(sourceId, targetId) {
    const sourceEl = elements.find((el) => el.id === sourceId);
    const targetEl = elements.find((el) => el.id === targetId);
    if (!sourceEl || !targetEl) return;

    // source와 target의 zIndex를 교환
    const newElements = elements.map((el) => {
      if (el.id === sourceId) return { ...el, zIndex: targetEl.zIndex };
      if (el.id === targetId) return { ...el, zIndex: sourceEl.zIndex };
      return el;
    });
    pushSnapshot(newElements);
  }

  // 레이어 패널 — 잠금 토글
  function handleToggleLock(id) {
    pushSnapshot(
      elements.map((el) =>
        el.id === id ? { ...el, locked: !el.locked } : el
      )
    );
    // 잠긴 요소가 선택되어 있으면 선택 해제
    if (selectedId === id) setSelectedId(null);
  }

  // 레이어 패널 — 숨기기 토글
  function handleToggleHide(id) {
    pushSnapshot(
      elements.map((el) =>
        el.id === id ? { ...el, hidden: !el.hidden } : el
      )
    );
    if (selectedId === id) setSelectedId(null);
  }

  // 레이어 패널 — 이름 변경 (히스토리 미기록)
  function handleLayerRename(id, name) {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, name } : el))
    );
  }

  // 직접 입력 캔버스 크기 적용
  function handleApplyCustomSize() {
    const w = parseInt(customWidth, 10);
    const h = parseInt(customHeight, 10);
    if (!w || !h || w < 100 || h < 100 || w > 2000 || h > 2000) {
      alert('너비/높이를 100~2000px 사이로 입력해주세요.');
      return;
    }
    setCanvasSize({ label: '직접 입력', width: w, height: h });
  }

  async function generateThumbnail() {
    const canvas = canvasRef.current?.getCanvas();
    if (!canvas) return null;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const c = await html2canvas(canvas, { scale: 0.3, useCORS: true, logging: false });
      return c.toDataURL('image/jpeg', 0.7);
    } catch {
      return null;
    }
  }

  async function handleSaveTemplate() {
    const name = prompt('템플릿 이름을 입력하세요:', '내 POP 템플릿');
    if (!name) return;
    setSaving(true);
    try {
      const thumbnail = await generateThumbnail();
      const canvasData = { template, canvasSize, elements };

      if (currentDocId) {
        await updateTemplate(currentDocId, { name, canvasData, thumbnail });
        alert('저장되었습니다.');
      } else {
        const id = await saveTemplate({ name, canvasData, thumbnail, isBanplus, bizNumber });
        setCurrentDocId(id);
        alert('저장되었습니다.');
      }
    } catch (e) {
      alert('저장 실패: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  function handleLoadDefaultDesign(design) {
    const { template: t, canvasSize: cs, elements: els } = design.canvasData;
    setTemplate(t);
    setCanvasSize(cs);
    pushSnapshot(els || []);
    setSelectedId(null);
    setCurrentDocId(null);
  }

  function handleLoadTemplate(tpl) {
    const { template: t, canvasSize: cs, elements: els } = tpl.canvasData;
    setTemplate(t);
    setCanvasSize(cs);
    pushSnapshot(els || []);
    setSelectedId(null);
    setCurrentDocId(tpl.id);
    setShowSavedModal(false);
  }

  async function handleSavePng() {
    const canvas = canvasRef.current?.getCanvas();
    if (!canvas) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const c = await html2canvas(canvas, { scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = 'pop.png';
      link.href = c.toDataURL('image/png');
      link.click();
    } catch (e) {
      alert('PNG 저장에 실패했습니다: ' + e.message);
    }
  }

  async function handleSavePdf() {
    const canvas = canvasRef.current?.getCanvas();
    if (!canvas) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');
      const c = await html2canvas(canvas, { scale: 2, useCORS: true });
      const imgData = c.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvasSize.width > canvasSize.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvasSize.width, canvasSize.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvasSize.width, canvasSize.height);
      pdf.save('pop.pdf');
    } catch (e) {
      alert('PDF 저장에 실패했습니다: ' + e.message);
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleBanplusLogin(biz) {
    const ok = login(biz);
    if (ok) {
      setShowBanplusModal(false);
      alert('밴플러스 인증이 완료되었습니다!');
    }
  }

  return (
    <div className="app">
      <Header
        isBanplus={isBanplus}
        bizNumber={bizNumber}
        onBanplusClick={() => setShowBanplusModal(true)}
        onLogout={logout}
        onSavePng={handleSavePng}
        onSavePdf={handleSavePdf}
        onPrint={handlePrint}
        onSaveTemplate={handleSaveTemplate}
        onLoadTemplates={() => setShowSavedModal(true)}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <div className="app-layout">
        <aside className="sidebar left-sidebar">
          {/* 좌측 탭 전환 */}
          <div className="sidebar-tab-bar">
            <button
              className={`sidebar-tab-btn ${leftTab === 'template' ? 'active' : ''}`}
              onClick={() => setLeftTab('template')}
            >
              📋 템플릿
            </button>
            <button
              className={`sidebar-tab-btn ${leftTab === 'layer' ? 'active' : ''}`}
              onClick={() => setLeftTab('layer')}
            >
              🗂 레이어
            </button>
          </div>

          {leftTab === 'template' && (
            <>
              <section className="panel">
                <h2 className="panel-title">📋 템플릿</h2>
                <TemplatePanel onSelect={handleSelectTemplate} onLoadDesign={handleLoadDefaultDesign} />
              </section>

              <section className="panel">
                <h2 className="panel-title">📐 캔버스 크기</h2>
                <div className="size-buttons">
                  {CANVAS_SIZES.map((s) => (
                    <button
                      key={s.label}
                      className={`size-btn ${canvasSize.label === s.label ? 'active' : ''}`}
                      onClick={() => setCanvasSize(s)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                {/* 직접 입력 */}
                <div className="custom-size">
                  <p className="custom-size-label">직접 입력 (px)</p>
                  <div className="custom-size-row">
                    <input
                      type="number"
                      className="custom-size-input"
                      placeholder="너비"
                      min={100}
                      max={2000}
                      value={customWidth}
                      onChange={(e) => setCustomWidth(e.target.value)}
                    />
                    <span className="custom-size-sep">×</span>
                    <input
                      type="number"
                      className="custom-size-input"
                      placeholder="높이"
                      min={100}
                      max={2000}
                      value={customHeight}
                      onChange={(e) => setCustomHeight(e.target.value)}
                    />
                    <button className="custom-size-btn" onClick={handleApplyCustomSize}>
                      적용
                    </button>
                  </div>
                </div>
              </section>

              <section className="panel">
                <h2 className="panel-title">➕ 요소 추가</h2>
                <button className="btn btn-full btn-accent" onClick={addText}>
                  📝 텍스트 추가
                </button>
                <label className="btn btn-full btn-accent" style={{ marginTop: 8, cursor: 'pointer' }}>
                  🖼 이미지 업로드
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                </label>
              </section>
            </>
          )}

          {leftTab === 'layer' && (
            <section className="panel" style={{ flex: 1 }}>
              <h2 className="panel-title">🗂 레이어</h2>
              <LayerPanel
                elements={elements}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                onReorder={handleLayerReorder}
                onToggleLock={handleToggleLock}
                onToggleHide={handleToggleHide}
                onRename={handleLayerRename}
              />
            </section>
          )}
        </aside>

        <main className="canvas-area">
          {saving && <div className="saving-overlay">저장 중...</div>}
          <CanvasEditor
            ref={canvasRef}
            template={template}
            canvasSize={canvasSize}
            elements={elements}
            setElements={setElements}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            startDrag={startDrag}
            commitDrag={commitDrag}
          />
        </main>

        <aside className="sidebar right-sidebar">
          <PropsPanel
            selected={selectedEl}
            onChange={handleChangeElement}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onBringFront={handleBringFront}
            onSendBack={handleSendBack}
          />
        </aside>
      </div>

      {showBanplusModal && (
        <BanplusModal
          onLogin={handleBanplusLogin}
          onClose={() => setShowBanplusModal(false)}
        />
      )}
      {showSavedModal && (
        <SavedTemplatesModal
          isBanplus={isBanplus}
          bizNumber={bizNumber}
          onLoad={handleLoadTemplate}
          onClose={() => setShowSavedModal(false)}
        />
      )}
    </div>
  );
}
