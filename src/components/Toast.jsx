import { useEffect, useState } from 'react';

const ICONS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

function ToastItem({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false);

  // 마운트 시 애니메이션 시작
  useEffect(() => {
    const showTimer = requestAnimationFrame(() => setVisible(true));
    const hideTimer = setTimeout(() => {
      setVisible(false);
      // 슬라이드 아웃 후 제거
      setTimeout(() => onDismiss(toast.id), 300);
    }, toast.duration ?? 3000);

    return () => {
      cancelAnimationFrame(showTimer);
      clearTimeout(hideTimer);
    };
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      className={`toast toast--${toast.type} ${visible ? 'toast--visible' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <span className="toast-icon" aria-hidden="true">{ICONS[toast.type]}</span>
      <span className="toast-message">{toast.message}</span>
      <button
        className="toast-close"
        onClick={() => onDismiss(toast.id)}
        aria-label="닫기"
        title="닫기"
      >
        ✕
      </button>
    </div>
  );
}

export default function Toast({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-label="알림 메시지">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
