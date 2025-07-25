import React, { useState } from 'react';
import { X, FileText, Calendar, User, DollarSign, AlertTriangle, Shield, Scale, CheckCircle, Edit, Send } from 'lucide-react';
import { Contract } from '../types/contract';
import { User as UserType } from '../types/user';

interface ContractDetailsProps {
  contract: Contract;
  currentUser: UserType;
  onClose: () => void;
  onEdit: (contract: Contract) => void;
  onSendForApproval: (contract: Contract) => void;
  onReapprove: (contractId: string) => void;
}

export const ContractDetails: React.FC<ContractDetailsProps> = ({
  contract,
  currentUser,
  onClose,
  onEdit,
  onSendForApproval,
  onReapprove
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'highlights'>('overview');

  const canEdit = contract.status === 'draft' || 
                  contract.status === 'rejected' || 
                  currentUser.role === 'admin';

  const canSendForApproval = (contract.status === 'draft' || contract.status === 'rejected') &&
                            (currentUser.permissions.canUpload || currentUser.role === 'admin');

  const canReapprove = contract.status === 'rejected' && 
                       (currentUser.permissions.canApprove || currentUser.role === 'admin');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'signed': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Đã duyệt';
      case 'pending': return 'Chờ duyệt';
      case 'rejected': return 'Từ chối';
      case 'signed': return 'Đã ký';
      case 'expired': return 'Hết hạn';
      default: return 'Nháp';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên hợp đồng</label>
            <p className="text-gray-900">{contract.title}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <p className="text-gray-900">{contract.description}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(contract.status)}`}>
              {getStatusText(contract.status)}
            </span>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tải lên</label>
            <p className="text-gray-900">{new Date(contract.uploadDate).toLocaleString('vi-VN')}</p>
          </div>
          {contract.reviewDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày xem xét</label>
              <p className="text-gray-900">{new Date(contract.reviewDate).toLocaleString('vi-VN')}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phiên bản hiện tại</label>
            <p className="text-gray-900">{contract.currentVersion}</p>
          </div>
        </div>
      </div>

      {/* Financial Info */}
      {contract.extractedInfo && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin tài chính</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Giá trị hợp đồng</span>
              </div>
              <p className="text-xl font-semibold text-blue-900 mt-2">
                {formatCurrency(contract.extractedInfo.numericValue || 0)}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Thời hạn</span>
              </div>
              <p className="text-green-900 mt-2">{contract.extractedInfo.duration || 'Chưa xác định'}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-900">Loại hợp đồng</span>
              </div>
              <p className="text-purple-900 mt-2">{contract.extractedInfo.contractType || 'Chưa phân loại'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Parties */}
      {contract.extractedInfo?.parties && contract.extractedInfo.parties.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Các bên tham gia</h3>
          <div className="space-y-2">
            {contract.extractedInfo.parties.map((party, index) => (
              <div key={index} className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{party}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      {contract.comments && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Nhận xét</h3>
          <div className={`p-4 rounded-lg ${
            contract.status === 'rejected' ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
          }`}>
            <p className={contract.status === 'rejected' ? 'text-red-700' : 'text-gray-700'}>
              {contract.comments}
            </p>
            {contract.reviewer && (
              <p className="text-sm text-gray-500 mt-2">
                Bởi: {contract.reviewer} • {contract.reviewDate && new Date(contract.reviewDate).toLocaleString('vi-VN')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderDetails = () => {
    const detailedSummary = contract.extractedInfo?.detailedSummary;
    if (!detailedSummary) {
      return (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Chưa có thông tin chi tiết</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* General Info */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">1. Thông tin chung</h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-700">Tên hợp đồng:</span>
                <p className="text-gray-900">{detailedSummary.generalInfo.contractName}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Số hợp đồng:</span>
                <p className="text-gray-900">{detailedSummary.generalInfo.contractNumber || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Ngày ký:</span>
                <p className="text-gray-900">{detailedSummary.generalInfo.signDate || 'Chưa ký'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Hiệu lực:</span>
                <p className="text-gray-900">
                  {detailedSummary.generalInfo.effectiveDate} - {detailedSummary.generalInfo.expiryDate}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Parties */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">2. Các bên tham gia</h3>
          <div className="space-y-4">
            {detailedSummary.generalInfo.parties.map((party, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Bên {party.role}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Tên:</span>
                    <p className="text-gray-900">{party.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Đại diện:</span>
                    <p className="text-gray-900">{party.representative}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700">Địa chỉ:</span>
                    <p className="text-gray-900">{party.address}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Purpose */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">3. Mục đích hợp đồng</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-900">{detailedSummary.purpose}</p>
          </div>
        </div>

        {/* Financial Info */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">4. Thông tin tài chính</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="font-medium text-gray-700">Tổng giá trị:</span>
              <p className="text-gray-900">{detailedSummary.financialInfo.totalValue}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="font-medium text-gray-700">Phương thức thanh toán:</span>
              <p className="text-gray-900">{detailedSummary.financialInfo.paymentMethod}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="font-medium text-gray-700">Lịch thanh toán:</span>
              <p className="text-gray-900">{detailedSummary.financialInfo.paymentSchedule}</p>
            </div>
            {detailedSummary.financialInfo.unitPrice && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="font-medium text-gray-700">Đơn giá:</span>
                <p className="text-gray-900">{detailedSummary.financialInfo.unitPrice}</p>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">5. Thời gian và tiến độ</h3>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="font-medium text-gray-700">Thời hạn:</span>
              <p className="text-gray-900">{detailedSummary.timeline.duration}</p>
            </div>
            {detailedSummary.timeline.milestones && detailedSummary.timeline.milestones.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="font-medium text-gray-700">Các mốc quan trọng:</span>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {detailedSummary.timeline.milestones.map((milestone, index) => (
                    <li key={index} className="text-gray-900">{milestone}</li>
                  ))}
                </ul>
              </div>
            )}
            {detailedSummary.timeline.terminationConditions && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="font-medium text-gray-700">Điều kiện chấm dứt:</span>
                <p className="text-gray-900">{detailedSummary.timeline.terminationConditions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Obligations */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">6. Quyền và nghĩa vụ các bên</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Bên A</h4>
              <ul className="list-disc list-inside space-y-1">
                {detailedSummary.obligations.partyA.map((obligation, index) => (
                  <li key={index} className="text-gray-700 text-sm">{obligation}</li>
                ))}
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Bên B</h4>
              <ul className="list-disc list-inside space-y-1">
                {detailedSummary.obligations.partyB.map((obligation, index) => (
                  <li key={index} className="text-gray-700 text-sm">{obligation}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Warranties */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">7. Bảo hành, bảo mật, phạt vi phạm</h3>
          <div className="space-y-4">
            {detailedSummary.warranties.warranty && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="font-medium text-gray-700">Bảo hành:</span>
                <p className="text-gray-900">{detailedSummary.warranties.warranty}</p>
              </div>
            )}
            {detailedSummary.warranties.confidentiality && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="font-medium text-gray-700">Bảo mật:</span>
                <p className="text-gray-900">{detailedSummary.warranties.confidentiality}</p>
              </div>
            )}
            {detailedSummary.warranties.penalties && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="font-medium text-gray-700">Phạt vi phạm:</span>
                <p className="text-gray-900">{detailedSummary.warranties.penalties}</p>
              </div>
            )}
          </div>
        </div>

        {/* Dispute Resolution */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">8. Giải quyết tranh chấp</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="font-medium text-gray-700">Cơ quan tài phán:</span>
              <p className="text-gray-900">{detailedSummary.disputeResolution.jurisdiction}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="font-medium text-gray-700">Địa điểm:</span>
              <p className="text-gray-900">{detailedSummary.disputeResolution.venue}</p>
            </div>
          </div>
        </div>

        {/* Attachments */}
        {detailedSummary.attachments && detailedSummary.attachments.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">9. Phụ lục và tài liệu đính kèm</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="list-disc list-inside space-y-1">
                {detailedSummary.attachments.map((attachment, index) => (
                  <li key={index} className="text-gray-900">{attachment}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Current Status */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">10. Tình trạng hiện tại</h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div>
              <span className="font-medium text-gray-700">Trạng thái:</span>
              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contract.status)}`}>
                {getStatusText(contract.status)}
              </span>
            </div>
            {detailedSummary.currentStatus && (
              <div>
                <span className="font-medium text-gray-700">Chi tiết:</span>
                <p className="text-gray-900">{detailedSummary.currentStatus}</p>
              </div>
            )}
            {detailedSummary.notes && (
              <div>
                <span className="font-medium text-gray-700">Ghi chú:</span>
                <p className="text-gray-900">{detailedSummary.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderHighlights = () => {
    const highlights = contract.extractedInfo?.detailedSummary?.keyHighlights;
    if (!highlights) {
      return (
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Chưa có thông tin nổi bật</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Contract Type */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">Loại hợp đồng</h3>
          </div>
          <p className="text-blue-800">
            {highlights.contractType === 'commercial' ? 'Hợp đồng thương mại' : 'Hợp đồng nội bộ'}
          </p>
        </div>

        {/* Critical Terms */}
        {highlights.criticalTerms && highlights.criticalTerms.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-medium text-red-900">Điều khoản quan trọng</h3>
            </div>
            <ul className="list-disc list-inside space-y-1">
              {highlights.criticalTerms.map((term, index) => (
                <li key={index} className="text-red-800">{term}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Risk Factors */}
        {highlights.riskFactors && highlights.riskFactors.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="w-5 h-5 text-amber-600" />
              <h3 className="font-medium text-amber-900">Yếu tố rủi ro</h3>
            </div>
            <ul className="list-disc list-inside space-y-1">
              {highlights.riskFactors.map((risk, index) => (
                <li key={index} className="text-amber-800">{risk}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Compliance Requirements */}
        {highlights.complianceRequirements && highlights.complianceRequirements.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Scale className="w-5 h-5 text-purple-600" />
              <h3 className="font-medium text-purple-900">Yêu cầu tuân thủ</h3>
            </div>
            <ul className="list-disc list-inside space-y-1">
              {highlights.complianceRequirements.map((req, index) => (
                <li key={index} className="text-purple-800">{req}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Delivery & Acceptance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {highlights.deliveryTerms && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">Điều kiện bàn giao</h3>
              <p className="text-green-800">{highlights.deliveryTerms}</p>
            </div>
          )}
          {highlights.acceptanceCriteria && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">Tiêu chí nghiệm thu</h3>
              <p className="text-green-800">{highlights.acceptanceCriteria}</p>
            </div>
          )}
        </div>

        {/* Termination Clause */}
        {highlights.terminationClause && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Điều khoản chấm dứt</h3>
            <p className="text-gray-800">{highlights.terminationClause}</p>
          </div>
        )}

        {/* Special Provisions */}
        {highlights.specialProvisions && highlights.specialProvisions.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className="w-5 h-5 text-indigo-600" />
              <h3 className="font-medium text-indigo-900">Điều khoản đặc biệt</h3>
            </div>
            <ul className="list-disc list-inside space-y-1">
              {highlights.specialProvisions.map((provision, index) => (
                <li key={index} className="text-indigo-800">{provision}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Signatory Information */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Thông tin người ký</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Bên A</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Tên:</span> {highlights.signatoryInfo.partyA.name}</p>
                <p><span className="font-medium">Chức danh:</span> {highlights.signatoryInfo.partyA.title}</p>
                <p><span className="font-medium">Ủy quyền:</span> {highlights.signatoryInfo.partyA.authority}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Bên B</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Tên:</span> {highlights.signatoryInfo.partyB.name}</p>
                <p><span className="font-medium">Chức danh:</span> {highlights.signatoryInfo.partyB.title}</p>
                <p><span className="font-medium">Ủy quyền:</span> {highlights.signatoryInfo.partyB.authority}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{contract.title}</h2>
              <p className="text-gray-600 mt-1">Chi tiết hợp đồng</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-6 mt-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-2 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Chi tiết đầy đủ
            </button>
            <button
              onClick={() => setActiveTab('highlights')}
              className={`pb-2 border-b-2 font-medium text-sm ${
                activeTab === 'highlights'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Điểm nổi bật
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'details' && renderDetails()}
          {activeTab === 'highlights' && renderHighlights()}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            <div className="flex space-x-3">
              {canEdit && (
                <button
                  onClick={() => onEdit(contract)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Chỉnh sửa</span>
                </button>
              )}
              {canSendForApproval && (
                <button
                  onClick={() => onSendForApproval(contract)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi duyệt</span>
                </button>
              )}
              {canReapprove && (
                <button
                  onClick={() => onReapprove(contract.id)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Phê duyệt lại</span>
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};