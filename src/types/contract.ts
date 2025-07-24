export interface ContractVersion {
  id: string;
  version: number;
  title: string;
  content: string;
  changes: string;
  createdAt: string;
  createdBy: string;
}

export interface ContractComment {
  id: string;
  contractId: string;
  userId: string;
  userName: string;
  content: string;
  highlightedText?: string;
  position?: { start: number; end: number };
  createdAt: string;
  isResolved: boolean;
}

export interface ContractTag {
  id: string;
  name: string;
  color: string;
  category: string;
}

export interface ApprovalStep {
  id: string;
  stepNumber: number;
  approverRole: string;
  approverName?: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  approvedAt?: string;
}

export interface ContractReminder {
  id: string;
  contractId: string;
  type: 'expiry' | 'renewal' | 'review';
  reminderDate: string;
  message: string;
  isActive: boolean;
}

export interface ESignatureRequest {
  id: string;
  contractId: string;
  signers: Array<{
    email: string;
    name: string;
    role: string;
    signed: boolean;
    signedAt?: string;
  }>;
  provider: 'docusign' | 'adobe' | 'viettel';
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Contract {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'signed' | 'expired';
  uploadDate: string;
  reviewDate?: string;
  expiryDate?: string;
  renewalDate?: string;
  reviewer?: string;
  comments?: string;
  tags: ContractTag[];
  versions: ContractVersion[];
  currentVersion: number;
  approvalSteps: ApprovalStep[];
  currentStep: number;
  reminders: ContractReminder[];
  eSignature?: ESignatureRequest;
  extractedInfo?: {
    contractType: string;
    parties: string[];
    value: string;
    duration: string;
    summary: string;
    fullText: string;
  };
  file?: File;
  finalPdfUrl?: string;
}

export interface DashboardStats {
  totalContracts: number;
  pendingApproval: number;
  approved: number;
  rejected: number;
  expiringSoon: number;
  averageProcessingTime: number;
  approvalRate: number;
  monthlyUploads: number[];
  rejectionReasons: Array<{ reason: string; count: number }>;
}