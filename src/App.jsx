import { useState, useRef } from 'react';
import Header from './components/Header';
import TemplatePanel from './components/TemplatePanel';
import CanvasEditor from './components/CanvasEditor';
import PropsPanel from './components/PropsPanel';
import BanplusModal from './components/BanplusModal';
import SavedTemplatesModal from './components/SavedTemplatesModal';
import { useAuth } from './hooks/useAuth';
import { CANVAS_SIZES } from './data/templates';
import { saveTemplate, updateTemplate } from './utils/storage';
import './App.css';

let nextId = 1;
function genId() { return `el_${nextId++}`; }

export default function App() {
  const { isBanplus, bizNumber, login, logout } = useAuth();

  const [template, setTemplate] = useState(null);
  const [canvasSize, setCanvasSize] = useState(CANVAS_SIZES[0]);
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showBanplusModal, setShowBanplusModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [currentDocId, setCurrentDocId] = useState(null);
  const [saving, setSaving] = useState(false);

  const canvasRef = useRef(null);

  const selectedEl = elements.find((el) => el.id === selectedId) || null;

  function handleSelectTemplate(tpl) {
    setTemplate(tpl);
    setElements([]);
    setSelectedId(null);
    setCurrentDocId(null);
  }

  function addText() {
    const el = {
      id: genId(),
      type: 'text',
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
    };
    setElements((prev) => [...prev, el]);
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
        };
        setElements((prev) => [...prev, el]);
        setSelectedId(el.id);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function handleChangeElement(updated) {
    setElements((prev) => prev.map((el) => (el.id === updated.id ? updated : el)));
  }

  function handleDelete() {
    setElements((prev) => prev.filter((el) => el.id !== selectedId));
    setSelectedId(null);
  }

  function handleDuplicate() {
    const el = elements.find((el) => el.id === selectedId);
    if (!el) return;
    const copy = { ...el, id: genId(), x: el.x + 20, y: el.y + 20, zIndex: elements.length + 1 };
    setElements((prev) => [...prev, copy]);
    setSelectedId(copy.id);
  }

  function handleBringFront() {
    setElements((prev) =>
      prev.map((el) =>
        el.id === selectedId ? { ...el, zIndex: (el.zIndex || 1) + 1 } : el
      )
    );
  }

  function handleSendBack() {
    setElements((prev) =>
      prev.map((el) =>
        el.id === selectedId ? { ...el, zIndex: Math.max(1, (el.zIndex || 1) - 1) } : el
      )
    );
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

  function handleLoadTemplate(tpl) {
    const { template: t, canvasSize: cs, elements: els } = tpl.canvasData;
    setTemplate(t);
    setCanvasSize(cs);
    setElements(els || []);
    setSelectedId(null);
    setCurrentDocId(tpl.id);
    setShowSavedModal(false);
  }

  async function handleSavePng() {
    const canvas = canvasRef.current?.getCanvas();
    if (!canvas) return;
    const { default: html2canvas } = await import('html2canvas');
    const c = await html2canvas(canvas, { scale: 2, useCORS: true });
    const link = document.createElement('a');
    link.download = 'pop.png';
    link.href = c.toDataURL('image/png');
    link.click();
  }

  async function handleSavePdf() {
    const canvas = canvasRef.current?.getCanvas();
    if (!canvas) return;
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
      />

      <div className="app-layout">
        <aside className="sidebar left-sidebar">
          <section className="panel">
            <h2 className="panel-title">📋 템플릿</h2>
            <TemplatePanel onSelect={handleSelectTemplate} />
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
