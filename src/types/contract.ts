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
  approverLevel: number;
  requiredValue?: number; // Giá trị tối thiểu để cần phê duyệt ở level này
  approverName?: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  approvedAt?: string;
}

export interface RejectionReason {
  id: string;
  reason: string;
  count: number;
  contracts: string[]; // IDs của các hợp đồng bị từ chối với lý do này
}

export interface TimeFilter {
  period: '7days' | '30days' | '90days' | '1year' | 'custom';
  startDate?: string;
  endDate?: string;
  groupBy: 'day' | 'month' | 'year';
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
  parentContractId?: string; // ID của hợp đồng gốc nếu đây là phiên bản mới
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
    numericValue: number; // Giá trị số để so sánh
    duration: string;
    summary: string;
    detailedSummary?: {
      generalInfo: {
        contractName: string;
        contractNumber?: string;
        signDate?: string;
        effectiveDate: string;
        expiryDate: string;
        parties: Array<{
          name: string;
          address: string;
          representative: string;
          role: 'A' | 'B';
        }>;
      };
      purpose: string;
      financialInfo: {
        totalValue: string;
        unitPrice?: string;
        paymentMethod: string;
        paymentSchedule: string;
      };
      timeline: {
        duration: string;
        milestones?: string[];
        terminationConditions?: string;
      };
      obligations: {
        partyA: string[];
        partyB: string[];
      };
      warranties: {
        warranty?: string;
        confidentiality?: string;
        penalties?: string;
      };
      disputeResolution: {
        jurisdiction: string;
        venue: string;
      };
      keyHighlights: {
        contractType: 'internal' | 'commercial'; // Hợp đồng nội bộ hoặc thương mại
        criticalTerms: string[]; // Điều khoản quan trọng
        riskFactors: string[]; // Yếu tố rủi ro
        complianceRequirements: string[]; // Yêu cầu tuân thủ
        deliveryTerms: string; // Điều kiện bàn giao
        acceptanceCriteria: string; // Tiêu chí nghiệm thu
        terminationClause: string; // Điều khoản chấm dứt
        specialProvisions: string[]; // Điều khoản đặc biệt
        signatoryInfo: {
          partyA: { name: string; title: string; authority: string };
          partyB: { name: string; title: string; authority: string };
        };
      };
      attachments?: string[];
      currentStatus?: string;
      notes?: string;
    };
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
  rejectionReasons: RejectionReason[];
  timeSeriesData?: Array<{
    date: string;
    uploads: number;
    approvals: number;
    rejections: number;
  }>;
}