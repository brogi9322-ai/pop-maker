// POP 템플릿 20개 정의
// background: CSS background 값
// border: CSS border 값
// category: 분류

export const TEMPLATES = [
  // === 세일/할인 ===
  {
    id: 1,
    name: '빨간 세일',
    category: '세일/할인',
    background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
    border: 'none',
    defaultText: '세일',
    textColor: '#ffffff',
    accentColor: '#ffff00',
  },
  {
    id: 2,
    name: '노란 할인',
    category: '세일/할인',
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    border: '6px solid #ff0000',
    defaultText: '특가할인',
    textColor: '#cc0000',
    accentColor: '#cc0000',
  },
  {
    id: 3,
    name: '체크 세일',
    category: '세일/할인',
    background: 'repeating-linear-gradient(45deg, #ff4444, #ff4444 10px, #ff6666 10px, #ff6666 20px)',
    border: '8px solid #ffffff',
    defaultText: 'SALE',
    textColor: '#ffffff',
    accentColor: '#ffff00',
  },
  {
    id: 4,
    name: '블랙 프라이데이',
    category: '세일/할인',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
    border: '4px solid #gold',
    defaultText: 'BLACK FRIDAY',
    textColor: '#FFD700',
    accentColor: '#FFD700',
  },

  // === 신제품 ===
  {
    id: 5,
    name: '신제품 블루',
    category: '신제품',
    background: 'linear-gradient(135deg, #0066cc 0%, #004499 100%)',
    border: 'none',
    defaultText: '신제품',
    textColor: '#ffffff',
    accentColor: '#00ccff',
  },
  {
    id: 6,
    name: '신제품 그린',
    category: '신제품',
    background: 'linear-gradient(135deg, #00aa44 0%, #007733 100%)',
    border: '5px dashed #ffffff',
    defaultText: 'NEW',
    textColor: '#ffffff',
    accentColor: '#ccff00',
  },
  {
    id: 7,
    name: '신제품 핑크',
    category: '신제품',
    background: 'linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)',
    border: 'none',
    defaultText: '신상품',
    textColor: '#ffffff',
    accentColor: '#ffff99',
  },

  // === 이벤트 ===
  {
    id: 8,
    name: '이벤트 파티',
    category: '이벤트',
    background: 'linear-gradient(135deg, #9b59b6 0%, #6c3483 100%)',
    border: '6px solid #f39c12',
    defaultText: '이벤트',
    textColor: '#ffffff',
    accentColor: '#f39c12',
  },
  {
    id: 9,
    name: '이벤트 레인보우',
    category: '이벤트',
    background: 'linear-gradient(135deg, #e74c3c, #e67e22, #f1c40f, #2ecc71, #3498db, #9b59b6)',
    border: 'none',
    defaultText: '특별이벤트',
    textColor: '#ffffff',
    accentColor: '#ffffff',
  },
  {
    id: 10,
    name: '할로윈',
    category: '이벤트',
    background: 'linear-gradient(135deg, #ff6600 0%, #cc4400 100%)',
    border: '5px solid #000000',
    defaultText: '할로윈 특가',
    textColor: '#000000',
    accentColor: '#ffff00',
  },

  // === 공지/안내 ===
  {
    id: 11,
    name: '공지 클린',
    category: '공지/안내',
    background: '#ffffff',
    border: '4px solid #333333',
    defaultText: '공지사항',
    textColor: '#333333',
    accentColor: '#0066cc',
  },
  {
    id: 12,
    name: '공지 파란테두리',
    category: '공지/안내',
    background: '#f0f8ff',
    border: '6px solid #0066cc',
    defaultText: '안내',
    textColor: '#0066cc',
    accentColor: '#0066cc',
  },
  {
    id: 13,
    name: '주의 경고',
    category: '공지/안내',
    background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
    border: '5px solid #f39c12',
    defaultText: '주의',
    textColor: '#856404',
    accentColor: '#f39c12',
  },

  // === 프리미엄 ===
  {
    id: 14,
    name: '골드 프리미엄',
    category: '프리미엄',
    background: 'linear-gradient(135deg, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C)',
    border: 'none',
    defaultText: 'PREMIUM',
    textColor: '#3d2600',
    accentColor: '#3d2600',
  },
  {
    id: 15,
    name: '블랙 골드',
    category: '프리미엄',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    border: '3px solid #FFD700',
    defaultText: 'VIP',
    textColor: '#FFD700',
    accentColor: '#FFD700',
  },

  // === 계절/시즌 ===
  {
    id: 16,
    name: '여름 시원',
    category: '시즌',
    background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
    border: 'none',
    defaultText: '여름특가',
    textColor: '#ffffff',
    accentColor: '#ccffff',
  },
  {
    id: 17,
    name: '겨울 눈',
    category: '시즌',
    background: 'linear-gradient(135deg, #e0e0e0 0%, #ffffff 50%, #c9d6ff 100%)',
    border: '4px solid #99aacc',
    defaultText: '겨울특가',
    textColor: '#334466',
    accentColor: '#334466',
  },
  {
    id: 18,
    name: '봄 플라워',
    category: '시즌',
    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    border: '5px solid #ff9a9e',
    defaultText: '봄맞이',
    textColor: '#cc4466',
    accentColor: '#cc4466',
  },

  // === 심플 ===
  {
    id: 19,
    name: '심플 화이트',
    category: '심플',
    background: '#ffffff',
    border: '2px solid #cccccc',
    defaultText: '텍스트를 입력하세요',
    textColor: '#333333',
    accentColor: '#666666',
  },
  {
    id: 20,
    name: '심플 다크',
    category: '심플',
    background: '#2c2c2c',
    border: 'none',
    defaultText: '텍스트를 입력하세요',
    textColor: '#ffffff',
    accentColor: '#aaaaaa',
  },
];

export const CATEGORIES = [...new Set(TEMPLATES.map((t) => t.category))];

export const CANVAS_SIZES = [
  { label: 'POP (300×300)', width: 300, height: 300 },
  { label: 'A4 세로', width: 794, height: 1123 },
  { label: 'A4 가로', width: 1123, height: 794 },
  { label: 'A5 세로', width: 559, height: 794 },
  { label: 'A3 세로', width: 1123, height: 1587 },
  { label: '정사각형', width: 794, height: 794 },
  { label: '명함', width: 340, height: 200 },
];

export const FONTS = [
  { label: 'Noto Sans KR', value: "'Noto Sans KR', sans-serif" },
  { label: 'Noto Serif KR', value: "'Noto Serif KR', serif" },
  { label: 'Black Han Sans', value: "'Black Han Sans', sans-serif" },
  { label: 'Jua', value: "'Jua', sans-serif" },
  { label: 'Cute Font', value: "'Cute Font', cursive" },
  { label: 'Gaegu', value: "'Gaegu', cursive" },
  { label: 'Do Hyeon', value: "'Do Hyeon', sans-serif" },
  { label: 'Gamja Flower', value: "'Gamja Flower', cursive" },
  { label: 'Gugi', value: "'Gugi', cursive" },
];
