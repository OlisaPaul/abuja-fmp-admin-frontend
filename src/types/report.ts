export type ReportStatus =
  | "paid"
  | "unpaid"
  | "submitted"
  | "unsubmitted"
  | "processing"
  | "overdue"
  | "draft";

export interface Report {
  id: string;
  parishId: string;
  month?: number;
  year?: number;
  status: ReportStatus;
  submissionDate?: string | null;
  balanceCarriedOver: number;
  balanceBroughtForward: number;
  ictFee: number;
  totalClaimedPaidAmount: number;
  claimedBalance: number;
  totalIncome: number;
  totalExpenditure: number;
  balance: number;
  requiredPaymentAmount: number | null;
  paidAmount: number;
  version: number;
  compliance?: number;
  createdAt: string;
  updatedAt: string;
  parish?: {
    id: string;
    name: string;
    email: string;
    parishName: string | null;
    diocese?: string | null;
    deanery?: string | null;
    acronym?: string;
  };
}

export interface ReportMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  from: number;
  to: number;
}

export interface ReportsResponse {
  data: Report[];
  meta: ReportMeta;
}
