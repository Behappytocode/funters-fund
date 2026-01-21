
export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export enum UserStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  profilePic?: string;
}

export interface Deposit {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  paymentDate: string;
  entryDate: string;
  receiptImage?: string;
  notes?: string;
}

export interface Installment {
  id: string;
  dueDate: string;
  amount: number;
  paid: boolean;
  paymentDate?: string;
}

export interface Loan {
  id: string;
  memberId: string;
  memberName: string;
  totalAmount: number;
  recoverableAmount: number; // 70%
  waiverAmount: number; // 30%
  issueDate: string;
  termMonths: number;
  status: 'ACTIVE' | 'COMPLETED';
  installments: Installment[];
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  deposits: Deposit[];
  loans: Loan[];
  developerInfo: {
    name: string;
    title: string;
    bio: string;
    profilePic: string;
    github?: string;
    linkedin?: string;
    email?: string;
  };
}
