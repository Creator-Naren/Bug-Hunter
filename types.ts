export interface Target {
  id: string;
  name: string;
  url: string;
  platform: string; // e.g. HackerOne, Bugcrowd, Private Program
  scope: string; // Assets in scope (multiline)
  out_of_scope: string; // Out of scope assets or rules (multiline)
  status: 'Active' | 'Archived';
  notes: string;
  createdAt: string;
}

export interface BugReport {
  id: string;
  title: string;
  target_id: string; // Linked to Target
  vuln_type: string; // e.g. SQL Injection, XSS, SSRF, IDOR, RCE, CSRF
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  description: string;
  steps_to_reproduce: string;
  impact: string;
  poc: string; // Proof of Concept (text/code)
  status: 'Draft' | 'Submitted' | 'Accepted' | 'Rejected' | 'Duplicate';
  created_date: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface MethodologyChecklist {
  id: string; // targetId + '_' + checklistType
  target_id: string;
  checklist_type: string; // 'OWASP Top 10' | 'Recon Checklist' | 'API Security Checklist' | 'Custom'
  items: ChecklistItem[];
}

export interface Finding {
  type: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  lineNumber: number;
  description: string;
  recommendation: string;
}

export interface CodeAnalysis {
  id: string;
  code_snippet: string;
  language: string;
  findings: Finding[];
  overallSeverity: 'Critical' | 'High' | 'Medium' | 'Low' | 'None';
  summary: string;
  created_date: string;
}
