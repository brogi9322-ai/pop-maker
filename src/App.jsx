import { Routes, Route } from 'react-router-dom';
import { EditorProvider } from './context/EditorContext';
import { useEditor } from './hooks/useEditor';
import Header from './components/Header';
import TemplatePanel from './components/TemplatePanel';
import CanvasEditor from './components/CanvasEditor';
import PropsPanel from './components/PropsPanel';
import LayerPanel from './components/LayerPanel';
import AssetPanel from './components/AssetPanel';
import Toast from './components/Toast';
import BanplusModal from './components/BanplusModal';
import SavedTemplatesModal from './components/SavedTemplatesModal';
import SharePage from './components/SharePage';
import { CANVAS_SIZES } from './data/templates';
import './App.css';

export default function App() {
  return (
    <Routes>
      <Route path="/share/:id" element={<SharePage />} />
      <Route path="*" element={<EditorProvider><AppLayout /></EditorProvider>} />
    </Routes>
  );
}

function AppLayout() {
  const {
    // 상태
    template, canvasSize, setCanvasSize, selectedId, setSelectedId,
    showBanplusModal, setShowBanplusModal,
    showSavedModal, setShowSavedModal,
    saving, savingOp, showOnboarding,
    leftTab, setLeftTab, mobileTab, setMobileTab,
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
    // AI 에셋
    aiAssets, aiGenerating, handleGenerateAsset, handleRemoveAiAsset,
  } = useEditor();

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
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((v) => !v)}
        saving={saving}
        savingOp={savingOp}
      />

      <div className="app-layout">
        {/* 좌측 사이드바 */}
        <aside className={`sidebar left-sidebar ${mobileTab === 'left' ? 'mobile-active' : ''}`}>
          <div className="sidebar-tab-bar">
            <button className={`sidebar-tab-btn ${leftTab === 'template' ? 'active' : ''}`} onClick={() => setLeftTab('template')}>📋 템플릿</button>
            <button className={`sidebar-tab-btn ${leftTab === 'asset' ? 'active' : ''}`} onClick={() => setLeftTab('asset')}>🖼 에셋</button>
            <button className={`sidebar-tab-btn ${leftTab === 'layer' ? 'active' : ''}`} onClick={() => setLeftTab('layer')}>🗂 레이어</button>
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
                      onClick={() => { pushSnapshot(scaleElementsToNewSize(s.width, s.height)); setCanvasSize(s); setCustomWidth(String(s.width)); setCustomHeight(String(s.height)); }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <div className="custom-size">
                  <p className="custom-size-label">직접 입력 (px)</p>
                  <div className="custom-size-row">
                    <input type="number" className="custom-size-input" placeholder="너비" min={100} max={2000} value={customWidth} onChange={(e) => setCustomWidth(e.target.value)} />
                    <span className="custom-size-sep">×</span>
                    <input type="number" className="custom-size-input" placeholder="높이" min={100} max={2000} value={customHeight} onChange={(e) => setCustomHeight(e.target.value)} />
                    <button className="custom-size-btn" onClick={handleApplyCustomSize}>적용</button>
                  </div>
                </div>
              </section>
              <section className="panel">
                <h2 className="panel-title">➕ 요소 추가</h2>
                <button className="btn btn-full btn-accent" onClick={addText}>📝 텍스트 추가</button>
                <label className="btn btn-full btn-accent" style={{ marginTop: 8, cursor: 'pointer' }}>
                  🖼 이미지 업로드
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                </label>
              </section>
            </>
          )}

          {leftTab === 'asset' && (
            <section className="panel" style={{ flex: 1 }}>
              <h2 className="panel-title">🖼 에셋</h2>
              <AssetPanel
                onAddAsset={handleAddAsset}
                aiAssets={aiAssets}
                generating={aiGenerating}
                onGenerateAsset={handleGenerateAsset}
                onRemoveAiAsset={handleRemoveAiAsset}
              />
            </section>
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

        {/* 캔버스 */}
        <main className={`canvas-area ${mobileTab === 'canvas' ? 'mobile-active' : ''}`}>
          {saving && (
            <div className="saving-overlay">
              {savingOp === 'png' ? 'PNG 변환 중...' : savingOp === 'pdf' ? 'PDF 변환 중...' : '저장 중...'}
            </div>
          )}
          {showOnboarding && (
            <div className="onboarding-hint">
              <div className="onboarding-hint-box">
                <p className="onboarding-hint-title">시작하는 방법</p>
                <p className="onboarding-hint-desc">
                  왼쪽 패널에서 <strong>템플릿</strong>을 선택하거나,<br />
                  <strong>텍스트 추가 / 이미지 업로드</strong>로 직접 시작하세요.
                </p>
              </div>
            </div>
          )}
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
            pushSnapshot={pushSnapshot}
          />
        </main>

        {/* 우측 사이드바 */}
        <aside className={`sidebar right-sidebar ${mobileTab === 'right' ? 'mobile-active' : ''}`}>
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

      {/* 모바일 하단 네비게이션 */}
      <nav className="mobile-nav">
        <button className={`mobile-nav-btn ${mobileTab === 'left' ? 'active' : ''}`} onClick={() => setMobileTab('left')}>
          <span className="mobile-nav-icon">📋</span>
          <span className="mobile-nav-label">패널</span>
        </button>
        <button className={`mobile-nav-btn ${mobileTab === 'canvas' ? 'active' : ''}`} onClick={() => setMobileTab('canvas')}>
          <span className="mobile-nav-icon">🎨</span>
          <span className="mobile-nav-label">캔버스</span>
        </button>
        <button className={`mobile-nav-btn ${mobileTab === 'right' ? 'active' : ''}`} onClick={() => setMobileTab('right')}>
          <span className="mobile-nav-icon">⚙️</span>
          <span className="mobile-nav-label">속성</span>
        </button>
      </nav>

      {showBanplusModal && (
        <BanplusModal onLogin={handleBanplusLogin} onClose={() => setShowBanplusModal(false)} />
      )}
      {showSavedModal && (
        <SavedTemplatesModal
          isBanplus={isBanplus}
          bizNumber={bizNumber}
          onLoad={handleLoadTemplate}
          onClose={() => setShowSavedModal(false)}
        />
      )}

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
