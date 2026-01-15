export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  tag: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BaseCollection {
  id: string;
  description: string;
  dueDate: string;
  bankAccountId: string;
  bankAccount: BankAccount;
  isActive: boolean;
  status: "active" | "inactive"; // Assuming other statuses might exist
  createdAt: string;
  updatedAt: string;
  totalClaimedPaidAmount: string;
  totalPaidAmount: string;
  claimedBalance: string;
  balance: string;
  requiredPaymentAmount: string;
  totalOutstandingParishes: number;
  totalPaidParishes: number;
  totalParishes: number;
  name: string;
  categories: any[]; // Type unknown from example
  version: number;
}

export interface MandatoryCollection extends BaseCollection {
  type: "mandatoryCollection";
  mandatoryCollectionName: string;
}

export interface Levy extends BaseCollection {
  type: "levy";
  levyName: string;
}

export type Collection = MandatoryCollection | Levy;

export interface CollectionsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  from: number;
  to: number;
}

export interface CollectionsResponse<T = Collection> {
  data: T[];
  meta: CollectionsMeta;
  totalRequiredPaymentAmount: number;
}
