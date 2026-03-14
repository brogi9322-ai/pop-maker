import { createContext, useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useHistory } from '../hooks/useHistory';
import { useToast } from '../hooks/useToast';
import { CANVAS_SIZES } from '../data/templates';
import { saveTemplate, updateTemplate } from '../utils/storage';
import { genId } from '../utils/id';

// eslint-disable-next-line react-refresh/only-export-components
export const EditorContext = createContext(null);

export function EditorProvider({ children }) {
  const { isBanplus, bizNumber, login, logout } = useAuth();

  const [template, setTemplate] = useState(null);
  const [canvasSize, setCanvasSize] = useState(CANVAS_SIZES[0]);
  const [selectedId, setSelectedId] = useState(null);
  const [showBanplusModal, setShowBanplusModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [currentDocId, setCurrentDocId] = useState(null);
  const [currentDocName, setCurrentDocName] = useState('내 POP 템플릿');
  const [saving, setSaving] = useState(false);
  const [leftTab, setLeftTab] = useState('template');
  const [mobileTab, setMobileTab] = useState('canvas');
  const [customWidth, setCustomWidth] = useState(String(CANVAS_SIZES[0].width));
  const [customHeight, setCustomHeight] = useState(String(CANVAS_SIZES[0].height));
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const canvasRef = useRef(null);
  const clipboardEl = useRef(null);

  const { elements, setElements, pushSnapshot, startDrag, commitDrag, undo, redo, canUndo, canRedo } = useHistory([]);
  const { toasts, toast, dismissToast } = useToast();

  const selectedEl = elements.find((el) => el.id === selectedId) || null;

  // 다크모드 적용
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // 키보드 단축키
  useEffect(() => {
    function handleKeyDown(e) {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (document.activeElement?.isContentEditable) return;

      if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
        e.preventDefault(); redo();
      } else if (e.ctrlKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault(); undo();
      } else if (e.ctrlKey && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault(); redo();
      } else if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
        if (!selectedId) return;
        const el = elements.find((el) => el.id === selectedId);
        if (el) clipboardEl.current = el;
      } else if (e.ctrlKey && (e.key === 'v' || e.key === 'V')) {
        if (!clipboardEl.current) return;
        e.preventDefault();
        const el = clipboardEl.current;
        const elW = el.width || 60;
        const elH = el.height || (el.type === 'text' ? Math.round(el.fontSize * el.lineHeight + 16) : 30);
        const newEl = {
          ...el,
          id: genId(),
          x: Math.min(el.x + 10, canvasSize.width - elW),
          y: Math.min(el.y + 10, canvasSize.height - elH),
          zIndex: elements.length + 1,
        };
        pushSnapshot([...elements, newEl]);
        setSelectedId(newEl.id);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!selectedId) return;
        const el = elements.find((el) => el.id === selectedId);
        if (!el || el.locked) return;
        e.preventDefault();
        pushSnapshot(elements.filter((el) => el.id !== selectedId));
        setSelectedId(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, elements, selectedId, canvasSize, pushSnapshot, setSelectedId]);

  // ─── 핸들러 ───────────────────────────────────

  function handleSelectTemplate(tpl) {
    setTemplate(tpl);
    const fontSize = 48;
    const lineHeight = 1.4;
    const elHeight = fontSize * lineHeight + 16;
    const defaultEl = {
      id: genId(), type: 'text', name: '텍스트',
      text: tpl.defaultText || '텍스트 입력',
      x: 0, y: Math.round(canvasSize.height / 2 - elHeight / 2),
      width: canvasSize.width,
      fontFamily: "'Noto Sans KR', sans-serif",
      fontSize, fontWeight: '700',
      color: tpl.textColor || '#333333',
      bgColor: 'transparent', textAlign: 'center',
      lineHeight, letterSpacing: 0,
      borderColor: '#000000', borderWidth: 0,
      rotate: 0, zIndex: 1, locked: false, hidden: false,
    };
    pushSnapshot([defaultEl]);
    setSelectedId(null);
    setCurrentDocId(null);
  }

  function addText() {
    const el = {
      id: genId(), type: 'text', name: '텍스트',
      text: '텍스트 입력', x: 100, y: 100, width: 300,
      fontFamily: "'Noto Sans KR', sans-serif",
      fontSize: 40, fontWeight: '700',
      color: template?.textColor || '#333333',
      bgColor: 'transparent', textAlign: 'center',
      lineHeight: 1.4, letterSpacing: 0,
      borderColor: '#000000', borderWidth: 0,
      rotate: 0, zIndex: elements.length + 1,
      locked: false, hidden: false,
    };
    pushSnapshot([...elements, el]);
    setSelectedId(el.id);
  }

  function handleAddAsset(asset) {
    const size = Math.min(canvasSize.width, canvasSize.height) * 0.35;
    const el = {
      id: genId(), type: 'image', name: asset.name, src: asset.src,
      x: Math.round(canvasSize.width / 2 - size / 2),
      y: Math.round(canvasSize.height / 2 - size / 2),
      width: Math.round(size), height: Math.round(size),
      rotate: 0, opacity: 100, zIndex: elements.length + 1,
      locked: false, hidden: false,
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
          id: genId(), type: 'image', name: '이미지', src: ev.target.result,
          x: 80, y: 80, width: maxW, height: Math.round(maxW * ratio),
          naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight,
          keepRatio: true, opacity: 100, rotate: 0,
          zIndex: elements.length + 1, locked: false, hidden: false,
        };
        pushSnapshot([...elements, el]);
        setSelectedId(el.id);
      };
      img.onerror = () => toast.error('이미지를 불러올 수 없습니다.');
      img.src = ev.target.result;
    };
    reader.onerror = () => toast.error('파일을 읽는 중 오류가 발생했습니다.');
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
    pushSnapshot(elements.map((el) =>
      el.id === selectedId ? { ...el, zIndex: (el.zIndex || 1) + 1 } : el
    ));
  }

  function handleSendBack() {
    pushSnapshot(elements.map((el) =>
      el.id === selectedId ? { ...el, zIndex: Math.max(1, (el.zIndex || 1) - 1) } : el
    ));
  }

  function handleLayerReorder(sourceId, targetId) {
    const sourceEl = elements.find((el) => el.id === sourceId);
    const targetEl = elements.find((el) => el.id === targetId);
    if (!sourceEl || !targetEl) return;
    pushSnapshot(elements.map((el) => {
      if (el.id === sourceId) return { ...el, zIndex: targetEl.zIndex };
      if (el.id === targetId) return { ...el, zIndex: sourceEl.zIndex };
      return el;
    }));
  }

  function handleToggleLock(id) {
    pushSnapshot(elements.map((el) => el.id === id ? { ...el, locked: !el.locked } : el));
    if (selectedId === id) setSelectedId(null);
  }

  function handleToggleHide(id) {
    pushSnapshot(elements.map((el) => el.id === id ? { ...el, hidden: !el.hidden } : el));
    if (selectedId === id) setSelectedId(null);
  }

  function handleLayerRename(id, name) {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, name } : el)));
  }

  function scaleElementsToNewSize(newWidth, newHeight) {
    const ratioX = newWidth / canvasSize.width;
    const ratioY = newHeight / canvasSize.height;
    return elements.map((el) => ({
      ...el,
      x: Math.round(el.x * ratioX),
      y: Math.round(el.y * ratioY),
      width: el.width ? Math.round(el.width * ratioX) : el.width,
      height: el.height ? Math.round(el.height * ratioY) : el.height,
    }));
  }

  function handleApplyCustomSize() {
    const w = parseInt(customWidth, 10);
    const h = parseInt(customHeight, 10);
    if (!w || !h || w < 100 || h < 100 || w > 2000 || h > 2000) {
      toast.warning('너비/높이를 100~2000px 사이로 입력해주세요.');
      return;
    }
    pushSnapshot(scaleElementsToNewSize(w, h));
    setCanvasSize({ label: '직접 입력', width: w, height: h });
    toast.success(`캔버스 크기를 ${w}×${h}px로 변경했습니다.`);
  }

  async function generateThumbnail() {
    const canvas = canvasRef.current?.getCanvas();
    if (!canvas) return null;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const c = await html2canvas(canvas, { scale: 0.3, useCORS: true, logging: false });
      return c.toDataURL('image/jpeg', 0.7);
    } catch { return null; }
  }

  async function handleSaveTemplate() {
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (!projectId || projectId.startsWith('your_')) {
      toast.error('저장 기능을 사용하려면 Firebase 설정이 필요합니다.', 5000);
      return;
    }
    const name = prompt('작업물 이름을 입력하세요:', currentDocName);
    if (!name) return;
    setSaving(true);
    try {
      const thumbnail = await generateThumbnail();
      const canvasData = { template, canvasSize, elements };
      if (currentDocId) {
        await updateTemplate(currentDocId, { name, canvasData, thumbnail });
        setCurrentDocName(name);
        toast.success('저장되었습니다.');
      } else {
        const id = await saveTemplate({ name, canvasData, thumbnail, isBanplus, bizNumber });
        setCurrentDocId(id);
        setCurrentDocName(name);
        toast.success('저장되었습니다.');
      }
    } catch (e) {
      toast.error('저장 실패: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  function handleLoadDefaultDesign(design) {
    const { template: t, canvasSize: cs, elements: els } = design.canvasData;
    setTemplate(t); setCanvasSize(cs);
    pushSnapshot(els || []);
    setSelectedId(null); setCurrentDocId(null);
  }

  function handleLoadTemplate(tpl) {
    const { template: t, canvasSize: cs, elements: els } = tpl.canvasData;
    setTemplate(t); setCanvasSize(cs);
    pushSnapshot(els || []);
    setSelectedId(null);
    setCurrentDocId(tpl.id);
    setCurrentDocName(tpl.name || '내 POP 템플릿');
    setShowSavedModal(false);
  }

  async function captureCanvas(scale = 2) {
    const canvas = canvasRef.current?.getCanvas();
    if (!canvas) throw new Error('캔버스를 찾을 수 없습니다.');
    const { default: html2canvas } = await import('html2canvas');
    return html2canvas(canvas, { scale, useCORS: true, logging: false, backgroundColor: null });
  }

  async function handleSavePng() {
    setSaving(true);
    try {
      const c = await captureCanvas(2);
      const link = document.createElement('a');
      link.download = `pop_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = c.toDataURL('image/png');
      link.click();
      toast.success('PNG로 저장했습니다.');
    } catch (e) {
      toast.error('PNG 저장에 실패했습니다: ' + e.message);
    } finally { setSaving(false); }
  }

  async function handleSavePdf() {
    setSaving(true);
    try {
      const c = await captureCanvas(2);
      const imgData = c.toDataURL('image/png');
      const { jsPDF } = await import('jspdf');
      const pxToMm = (px) => px * 25.4 / 96;
      const wMm = pxToMm(canvasSize.width);
      const hMm = pxToMm(canvasSize.height);
      const pdf = new jsPDF({
        orientation: canvasSize.width > canvasSize.height ? 'landscape' : 'portrait',
        unit: 'mm', format: [wMm, hMm],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, wMm, hMm);
      pdf.save(`pop_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success('PDF로 저장했습니다.');
    } catch (e) {
      toast.error('PDF 저장에 실패했습니다: ' + e.message);
    } finally { setSaving(false); }
  }

  function handleExportJson() {
    const json = JSON.stringify({ template, canvasSize, elements }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `pop_${new Date().toISOString().slice(0, 10)}.json`;
    link.href = url; link.click();
    URL.revokeObjectURL(url);
    toast.success('JSON으로 내보냈습니다.');
  }

  function handleImportJson(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.warning('파일이 너무 큽니다. 10MB 이하 파일을 선택해주세요.');
      e.target.value = ''; return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.canvasSize || !Array.isArray(data.elements)) {
          throw new Error('올바른 POP JSON 파일이 아닙니다.');
        }
        const remappedEls = data.elements.map((el) => ({ ...el, id: genId() }));
        setTemplate(data.template || null);
        setCanvasSize(data.canvasSize);
        setCustomWidth(String(data.canvasSize.width));
        setCustomHeight(String(data.canvasSize.height));
        pushSnapshot(remappedEls);
        setSelectedId(null); setCurrentDocId(null);
        toast.success('JSON 파일을 불러왔습니다.');
      } catch (err) {
        toast.error('가져오기 실패: ' + err.message);
      }
    };
    reader.onerror = () => toast.error('파일을 읽을 수 없습니다.');
    reader.readAsText(file);
    e.target.value = '';
  }

  function handlePrint() { window.print(); }

  function handleBanplusLogin(biz) {
    const ok = login(biz);
    if (ok) {
      setShowBanplusModal(false);
      toast.success('밴플러스 인증이 완료되었습니다!');
    }
  }

  const value = {
    // 상태
    template, canvasSize, setCanvasSize, selectedId, setSelectedId,
    showBanplusModal, setShowBanplusModal,
    showSavedModal, setShowSavedModal,
    saving, leftTab, setLeftTab, mobileTab, setMobileTab,
    darkMode, setDarkMode,
    customWidth, setCustomWidth, customHeight, setCustomHeight,
    canvasRef,
    // 히스토리
    elements, setElements, pushSnapshot, startDrag, commitDrag,
    undo, redo, canUndo, canRedo,
    // 토스트
    toasts, dismissToast,
    // 파생 값
    selectedEl,
    // 인증
    isBanplus, bizNumber, logout,
    // 핸들러
    handleSelectTemplate, addText, handleAddAsset, handleImageUpload,
    handleChangeElement, handleDelete, handleDuplicate,
    handleBringFront, handleSendBack,
    handleLayerReorder, handleToggleLock, handleToggleHide, handleLayerRename,
    handleApplyCustomSize, scaleElementsToNewSize,
    handleSaveTemplate, handleLoadDefaultDesign, handleLoadTemplate,
    handleSavePng, handleSavePdf, handleExportJson, handleImportJson,
    handlePrint, handleBanplusLogin,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}
