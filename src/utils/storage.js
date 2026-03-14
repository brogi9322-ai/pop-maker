import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

// 일반 사용자 UUID 관리
export function getUserId() {
  let uid = localStorage.getItem('pop_user_id');
  if (!uid) {
    uid = 'user_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('pop_user_id', uid);
  }
  return uid;
}

// 사업자번호 형식 검증 (xxx-xx-xxxxx)
export function validateBizNumber(num) {
  const cleaned = num.replace(/-/g, '');
  if (!/^\d{10}$/.test(cleaned)) return false;

  // 국세청 알고리즘 체크섬 검증
  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * weights[i];
  }
  sum += Math.floor((parseInt(cleaned[8]) * 5) / 10);
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(cleaned[9]);
}

// 사업자번호 포맷팅 (자동 하이픈)
export function formatBizNumber(value) {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 10)}`;
}

// ===== Firestore 작업 =====

// 템플릿 저장
export async function saveTemplate({ name, canvasData, thumbnail, isBanplus, bizNumber }) {
  const userId = isBanplus ? `biz_${bizNumber.replace(/-/g, '')}` : getUserId();

  const docData = {
    name,
    canvasData,
    thumbnail,
    userId,
    isBanplus: !!isBanplus,
    bizNumber: isBanplus ? bizNumber.replace(/-/g, '') : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const colRef = collection(db, 'templates');
  const docRef = await addDoc(colRef, docData);
  return docRef.id;
}

// 내 템플릿 불러오기 (일반 사용자)
export async function getMyTemplates() {
  const userId = getUserId();
  const q = query(
    collection(db, 'templates'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// 밴플러스 사용자 본인 템플릿 불러오기
export async function getBanplusMyTemplates(bizNumber) {
  const userId = `biz_${bizNumber.replace(/-/g, '')}`;
  const q = query(
    collection(db, 'templates'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// 밴플러스 공유 템플릿 전체 불러오기
export async function getBanplusSharedTemplates() {
  const q = query(
    collection(db, 'templates'),
    where('isBanplus', '==', true),
    orderBy('updatedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// 템플릿 업데이트
export async function updateTemplate(id, { name, canvasData, thumbnail }) {
  const docRef = doc(db, 'templates', id);
  await updateDoc(docRef, {
    name,
    canvasData,
    thumbnail,
    updatedAt: serverTimestamp(),
  });
}

// 템플릿 삭제
export async function deleteTemplate(id) {
  await deleteDoc(doc(db, 'templates', id));
}
