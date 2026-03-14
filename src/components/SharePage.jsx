import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicTemplate } from '../utils/storage';

/**
 * 공유 링크 접근 시 읽기 전용으로 캔버스를 미리보기하는 페이지
 * URL: /share/:id
 */
export default function SharePage() {
  const { id } = useParams();
  const [tpl, setTpl] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicTemplate(id)
      .then(setTpl)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={styles.center}>
        <p style={styles.msg}>불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.center}>
        <p style={styles.errorMsg}>{error}</p>
        <a href="/" style={styles.link}>← POP 제작기로 돌아가기</a>
      </div>
    );
  }

  const { canvasData, name } = tpl;
  const { template, canvasSize, elements } = canvasData || {};

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.logo}>🏪 POP 제작기</h1>
        <span style={styles.badge}>읽기 전용 미리보기</span>
        <a href="/" style={styles.link}>← 직접 만들어보기</a>
      </header>

      <main style={styles.main}>
        <h2 style={styles.title}>{name}</h2>
        <div style={styles.canvasWrap}>
          <div
            style={{
              width: canvasSize?.width || 300,
              height: canvasSize?.height || 300,
              background: template?.background || '#ffffff',
              border: template?.border || '1px solid #ccc',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            }}
          >
            {(elements || []).map((el) => {
              if (el.hidden) return null;

              if (el.type === 'text') {
                return (
                  <div
                    key={el.id}
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
                      border: `${el.borderWidth || 0}px solid ${el.borderColor || 'transparent'}`,
                      padding: '8px 12px',
                      transform: `rotate(${el.rotate || 0}deg)`,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      zIndex: el.zIndex || 1,
                      boxSizing: 'border-box',
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}
                  >
                    {el.text}
                  </div>
                );
              }

              if (el.type === 'image') {
                return (
                  <div
                    key={el.id}
                    style={{
                      position: 'absolute',
                      left: el.x,
                      top: el.y,
                      width: el.width,
                      height: el.height,
                      transform: `rotate(${el.rotate || 0}deg)`,
                      zIndex: el.zIndex || 1,
                      opacity: (el.opacity || 100) / 100,
                      pointerEvents: 'none',
                    }}
                  >
                    <img
                      src={el.src}
                      alt=""
                      style={{ width: '100%', height: '100%', display: 'block' }}
                      draggable={false}
                    />
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f0f4f8',
    fontFamily: "'Noto Sans KR', sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '0 24px',
    height: 56,
    background: '#1e293b',
    color: '#fff',
  },
  logo: {
    fontSize: 18,
    fontWeight: 700,
    margin: 0,
  },
  badge: {
    fontSize: 12,
    padding: '2px 8px',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
  },
  link: {
    marginLeft: 'auto',
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px 16px',
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1e293b',
    margin: 0,
  },
  canvasWrap: {
    display: 'flex',
    justifyContent: 'center',
    overflow: 'auto',
    maxWidth: '100%',
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: 16,
    fontFamily: "'Noto Sans KR', sans-serif",
  },
  msg: {
    fontSize: 16,
    color: '#64748b',
  },
  errorMsg: {
    fontSize: 16,
    color: '#ef4444',
  },
};
