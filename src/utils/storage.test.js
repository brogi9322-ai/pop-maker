import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getUserId,
  validateBizNumber,
  formatBizNumber,
  saveTemplate,
  getMyTemplates,
  deleteTemplate,
  updateTemplateVisibility,
  getPublicTemplate,
} from './storage';

// Firebase 목킹
vi.mock('../firebase', () => ({ db: {} }));

const mockAddDoc = vi.fn();
const mockGetDocs = vi.fn();
const mockGetDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockDoc = vi.fn(() => 'mock-doc-ref');
const mockCollection = vi.fn(() => 'mock-col-ref');
const mockQuery = vi.fn((q) => q);
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();
const mockServerTimestamp = vi.fn(() => ({ seconds: 0 }));

vi.mock('firebase/firestore', () => ({
  collection: (...args) => mockCollection(...args),
  addDoc: (...args) => mockAddDoc(...args),
  getDocs: (...args) => mockGetDocs(...args),
  getDoc: (...args) => mockGetDoc(...args),
  updateDoc: (...args) => mockUpdateDoc(...args),
  deleteDoc: (...args) => mockDeleteDoc(...args),
  doc: (...args) => mockDoc(...args),
  query: (...args) => mockQuery(...args),
  where: (...args) => mockWhere(...args),
  orderBy: (...args) => mockOrderBy(...args),
  serverTimestamp: () => mockServerTimestamp(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

// ===== 순수 함수 테스트 =====

describe('validateBizNumber', () => {
  // "1248902463" — 국세청 체크섬 알고리즘 통과 (직접 계산 검증)
  const VALID_NUM = '1248902463';
  const VALID_FORMATTED = '124-89-02463';

  it('유효한 10자리 숫자를 통과한다', () => {
    expect(validateBizNumber(VALID_NUM)).toBe(true);
  });

  it('하이픈 포함 포맷도 통과한다', () => {
    expect(validateBizNumber(VALID_FORMATTED)).toBe(true);
  });

  it('9자리는 거부한다', () => {
    expect(validateBizNumber('123456789')).toBe(false);
  });

  it('11자리는 거부한다', () => {
    expect(validateBizNumber('12345678901')).toBe(false);
  });

  it('숫자가 아닌 문자가 포함되면 거부한다', () => {
    expect(validateBizNumber('1234abc890')).toBe(false);
  });

  it('체크섬 불일치 시 거부한다', () => {
    // 마지막 자리만 변경 (체크섬 불일치)
    const invalid = VALID_NUM.slice(0, 9) + '9';
    expect(validateBizNumber(invalid)).toBe(false);
  });

  it('빈 문자열은 거부한다', () => {
    expect(validateBizNumber('')).toBe(false);
  });
});

describe('formatBizNumber', () => {
  it('3자리 이하는 그대로 반환한다', () => {
    expect(formatBizNumber('123')).toBe('123');
  });

  it('4~5자리는 xxx-xx 포맷으로 반환한다', () => {
    expect(formatBizNumber('12345')).toBe('123-45');
  });

  it('10자리는 xxx-xx-xxxxx 포맷으로 반환한다', () => {
    expect(formatBizNumber('1234567890')).toBe('123-45-67890');
  });

  it('비숫자 문자를 제거하고 포맷한다', () => {
    expect(formatBizNumber('123-45-67890')).toBe('123-45-67890');
  });

  it('빈 문자열은 빈 문자열을 반환한다', () => {
    expect(formatBizNumber('')).toBe('');
  });

  it('10자리 초과 시 10자리까지만 포맷한다', () => {
    expect(formatBizNumber('12345678901234')).toBe('123-45-67890');
  });
});

describe('getUserId', () => {
  it('localStorage가 비어있으면 "user_" 접두사 id를 생성한다', () => {
    const id = getUserId();
    expect(id).toMatch(/^user_/);
  });

  it('생성된 id를 localStorage에 저장한다', () => {
    const id = getUserId();
    expect(localStorage.getItem('pop_user_id')).toBe(id);
  });

  it('재호출 시 동일한 id를 반환한다', () => {
    const id1 = getUserId();
    const id2 = getUserId();
    expect(id1).toBe(id2);
  });

  it('localStorage에 이미 값이 있으면 그 값을 반환한다', () => {
    localStorage.setItem('pop_user_id', 'user_existing');
    expect(getUserId()).toBe('user_existing');
  });
});

// ===== Firestore CRUD 테스트 =====

describe('saveTemplate', () => {
  it('addDoc을 호출하고 docRef.id를 반환한다', async () => {
    mockAddDoc.mockResolvedValue({ id: 'new-id' });

    const id = await saveTemplate({
      name: '테스트 템플릿',
      canvasData: {},
      thumbnail: '',
      isBanplus: false,
    });

    expect(mockAddDoc).toHaveBeenCalledOnce();
    expect(id).toBe('new-id');
  });

  it('밴플러스 사용자 저장 시 userId가 "biz_" 접두사를 가진다', async () => {
    mockAddDoc.mockResolvedValue({ id: 'biz-id' });

    await saveTemplate({
      name: '밴플러스 템플릿',
      canvasData: {},
      thumbnail: '',
      isBanplus: true,
      bizNumber: '124-89-02463',
    });

    const calledData = mockAddDoc.mock.calls[0][1];
    expect(calledData.userId).toBe('biz_1248902463');
  });

  it('저장 시 isPublic이 false로 초기화된다', async () => {
    mockAddDoc.mockResolvedValue({ id: 'id' });

    await saveTemplate({ name: '템플릿', canvasData: {}, thumbnail: '', isBanplus: false });

    const calledData = mockAddDoc.mock.calls[0][1];
    expect(calledData.isPublic).toBe(false);
  });
});

describe('getMyTemplates', () => {
  it('getDocs 결과를 { id, ...data } 형태로 매핑한다', async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        { id: 'doc1', data: () => ({ name: '템플릿1', userId: 'user_abc' }) },
        { id: 'doc2', data: () => ({ name: '템플릿2', userId: 'user_abc' }) },
      ],
    });

    const result = await getMyTemplates();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: 'doc1', name: '템플릿1', userId: 'user_abc' });
    expect(result[1]).toEqual({ id: 'doc2', name: '템플릿2', userId: 'user_abc' });
  });

  it('결과가 없으면 빈 배열을 반환한다', async () => {
    mockGetDocs.mockResolvedValue({ docs: [] });
    const result = await getMyTemplates();
    expect(result).toEqual([]);
  });
});

describe('deleteTemplate', () => {
  it('deleteDoc을 올바른 doc 참조로 호출한다', async () => {
    mockDeleteDoc.mockResolvedValue(undefined);

    await deleteTemplate('template-id');

    expect(mockDoc).toHaveBeenCalledWith({}, 'templates', 'template-id');
    expect(mockDeleteDoc).toHaveBeenCalledOnce();
  });
});

describe('updateTemplateVisibility', () => {
  it('updateDoc에 isPublic과 updatedAt을 전달한다', async () => {
    mockUpdateDoc.mockResolvedValue(undefined);

    await updateTemplateVisibility('tpl-id', true);

    expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc-ref', {
      isPublic: true,
      updatedAt: expect.anything(),
    });
  });

  it('isPublic=false로 비공개 처리할 수 있다', async () => {
    mockUpdateDoc.mockResolvedValue(undefined);

    await updateTemplateVisibility('tpl-id', false);

    expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc-ref', {
      isPublic: false,
      updatedAt: expect.anything(),
    });
  });
});

describe('getPublicTemplate', () => {
  it('존재하지 않는 문서면 에러를 throw한다', async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false });

    await expect(getPublicTemplate('no-exist')).rejects.toThrow('템플릿을 찾을 수 없습니다.');
  });

  it('isPublic=false인 문서면 에러를 throw한다', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ isPublic: false, name: '비공개' }),
      id: 'tpl-id',
    });

    await expect(getPublicTemplate('tpl-id')).rejects.toThrow('비공개 템플릿입니다.');
  });

  it('isPublic=true인 문서면 { id, ...data }를 반환한다', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ isPublic: true, name: '공개 템플릿' }),
      id: 'public-id',
    });

    const result = await getPublicTemplate('public-id');

    expect(result).toEqual({ id: 'public-id', isPublic: true, name: '공개 템플릿' });
  });
});
