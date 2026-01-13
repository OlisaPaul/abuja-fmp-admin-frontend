export interface UserStats {
  averageRequiredPaymentAmount: number;
  averageCompliance: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  parishName: string | null;
  diocese: string | null;
  lga: string | null;
  address: string | null;
  acronym: string | null;
  town: string | null;
  deanery: string | null;
  category: string | null;
  permissionGroup: string | null;
  permissions: string[];
  hasUpdatedBalanceCarriedOver: boolean;
  startNow: boolean;
  createdAt: string;
  updatedAt: string;
  stats: UserStats;
  externalWalletStatus: string;
  hasAccountNumber: boolean;
  phone?: string;
  alternativeEmail?: string;
  alternativePhone?: string;
}

export interface UserMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  from: number;
  to: number;
}

export interface UsersResponse {
  data: User[];
  meta: UserMeta;
}
