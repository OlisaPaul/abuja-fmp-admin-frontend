export type PaymentStatus = "pending" | "confirmed";
export type PayableType = "report" | "levy" | "mandatoryCollection";

export interface Payer {
  id: string;
  email: string;
  name: string;
  parishName: string;
  deanery: string;
  category: string;
}

export interface Allocation {
  id: string;
  paymentId: string;
  payableType: PayableType;
  payableId: string;
  parentPayableId: string | null;
  amount: string;
  paymentType: string;
  payableEntityCreatedAt: string;
  payableEntityName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  amount: string;
  totalAllocationAmount: string;
  receiptUrl: string | null;
  receiptUrl2: string | null;
  paidFromWallet: boolean;
  paymentDate: string;
  confirmedBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  payerId: string;
  confirmedByUser: null; // specific type unknown from example
  payer: Payer;
  confirmationDate: string | null;
  confirmationComment: string | null;
  comment: string | null;
  processingTimeMinutes: number | null;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  allocations: Allocation[];
}

export interface PaymentMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  from: number;
  to: number;
}

export interface PaymentsResponse {
  data: Payment[];
  meta: PaymentMeta;
  averageTime: number;
}
