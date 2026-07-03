import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Target, BugReport, MethodologyChecklist, CodeAnalysis, ChecklistItem } from '../types';

// Error handling specifications
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Collections
const TARGETS_COLLECTION = 'targets';
const BUG_REPORTS_COLLECTION = 'bug_reports';
const CHECKLISTS_COLLECTION = 'checklists';
const CODE_ANALYSES_COLLECTION = 'code_analyses';

// Target CRUD
export async function getTargets(): Promise<Target[]> {
  try {
    const q = query(collection(db, TARGETS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const targets: Target[] = [];
    querySnapshot.forEach((doc) => {
      targets.push({ id: doc.id, ...doc.data() } as Target);
    });
    return targets;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, TARGETS_COLLECTION);
  }
}

export async function saveTarget(target: Target): Promise<void> {
  try {
    await setDoc(doc(db, TARGETS_COLLECTION, target.id), target);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, TARGETS_COLLECTION);
  }
}

export async function deleteTarget(targetId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, TARGETS_COLLECTION, targetId));
    
    // Also delete associated bug reports & checklists
    const reportsQuery = query(collection(db, BUG_REPORTS_COLLECTION), where('target_id', '==', targetId));
    const reportsSnapshot = await getDocs(reportsQuery);
    reportsSnapshot.forEach(async (reportDoc) => {
      await deleteDoc(doc(db, BUG_REPORTS_COLLECTION, reportDoc.id));
    });

    const checklistQuery = query(collection(db, CHECKLISTS_COLLECTION), where('target_id', '==', targetId));
    const checklistSnapshot = await getDocs(checklistQuery);
    checklistSnapshot.forEach(async (checklistDoc) => {
      await deleteDoc(doc(db, CHECKLISTS_COLLECTION, checklistDoc.id));
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, TARGETS_COLLECTION);
  }
}

// Bug Report CRUD
export async function getBugReports(): Promise<BugReport[]> {
  try {
    const q = query(collection(db, BUG_REPORTS_COLLECTION), orderBy('created_date', 'desc'));
    const querySnapshot = await getDocs(q);
    const reports: BugReport[] = [];
    querySnapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() } as BugReport);
    });
    return reports;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, BUG_REPORTS_COLLECTION);
  }
}

export async function saveBugReport(report: BugReport): Promise<void> {
  try {
    await setDoc(doc(db, BUG_REPORTS_COLLECTION, report.id), report);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, BUG_REPORTS_COLLECTION);
  }
}

export async function deleteBugReport(reportId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, BUG_REPORTS_COLLECTION, reportId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, BUG_REPORTS_COLLECTION);
  }
}

// Checklists CRUD
export async function getChecklists(targetId: string): Promise<MethodologyChecklist[]> {
  try {
    const q = query(collection(db, CHECKLISTS_COLLECTION), where('target_id', '==', targetId));
    const querySnapshot = await getDocs(q);
    const checklists: MethodologyChecklist[] = [];
    querySnapshot.forEach((doc) => {
      checklists.push({ id: doc.id, ...doc.data() } as MethodologyChecklist);
    });
    return checklists;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, CHECKLISTS_COLLECTION);
  }
}

export async function saveChecklist(checklist: MethodologyChecklist): Promise<void> {
  try {
    await setDoc(doc(db, CHECKLISTS_COLLECTION, checklist.id), checklist);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, CHECKLISTS_COLLECTION);
  }
}

// Code Analysis CRUD
export async function getCodeAnalyses(): Promise<CodeAnalysis[]> {
  try {
    const q = query(collection(db, CODE_ANALYSES_COLLECTION), orderBy('created_date', 'desc'));
    const querySnapshot = await getDocs(q);
    const analyses: CodeAnalysis[] = [];
    querySnapshot.forEach((doc) => {
      analyses.push({ id: doc.id, ...doc.data() } as CodeAnalysis);
    });
    return analyses;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, CODE_ANALYSES_COLLECTION);
  }
}

export async function saveCodeAnalysis(analysis: CodeAnalysis): Promise<void> {
  try {
    await setDoc(doc(db, CODE_ANALYSES_COLLECTION, analysis.id), analysis);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, CODE_ANALYSES_COLLECTION);
  }
}

export async function deleteCodeAnalysis(analysisId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, CODE_ANALYSES_COLLECTION, analysisId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, CODE_ANALYSES_COLLECTION);
  }
}
