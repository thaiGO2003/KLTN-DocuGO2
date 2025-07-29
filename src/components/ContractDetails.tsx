import React, { useState } from 'react';
import { X, FileText, Calendar, User, DollarSign, AlertTriangle, CheckCircle, Clock, Edit, Send, RefreshCw } from 'lucide-react';
import { Contract } from '../types/contract';
import { User as UserType } from '../types/user';

interface ContractDetailsProps {
  contract: Contract;
  currentUser: UserType;
  onClose: () => void;
  onEdit: (contract: Contract) => void;
  onSendForApproval: (contract: Contract) => void;
  onResubmit: (contractId: string) => void;
}

export const ContractDetails: React.FC<ContractDetailsProps> = ({
  contract,
  currentUser,
  onClose,
  onEdit,
  onSendForApproval,
  onResubmit
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'highlights'>('overview');

  const canEdit = () => {
    if (currentUser.role === 'admin') return true;
    if (contract.status === 'draft' || contract.status === 'rejected') return true;
    return false;
  };

  const canSendForApproval = () => {
    return contract.status === 'draft' && currentUser.permissions.canUpload;
  };

  const canResubmit = () => {
    return contract.status === 'rejected' && currentUser.permissions.canUpload;
  };

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
            <p className="text-gray-900">{new Date(contract.uploadDate).toLocaleDateString('vi-VN')}</p>
          </div>
          {contract.reviewDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày xem xét</label>
              <p className="text-gray-900">{new Date(contract.reviewDate).toLocaleDateString('vi-VN')}</p>
            </div>
          )}
          {contract.expiryDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn</label>
              <p className="text-gray-900">{new Date(contract.expiryDate).toLocaleDateString('vi-VN')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Financial Info */}
      {contract.extractedInfo && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin tài chính</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị hợp đồng</label>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(contract.extractedInfo.numericValue)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
              <p className="text-gray-900">
                {contract.extractedInfo.detailedSummary?.financialInfo.paymentMethod || 'Chưa xác định'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lịch thanh toán</label>
              <p className="text-gray-900">
                {contract.extractedInfo.detailedSummary?.financialInfo.paymentSchedule || 'Chưa xác định'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Parties */}
      {contract.extractedInfo?.detailedSummary?.generalInfo.parties && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Các bên tham gia</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contract.extractedInfo.detailedSummary.generalInfo.parties.map((party, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Bên {party.role}</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Tên:</strong> {party.name}</div>
                  <div><strong>Địa chỉ:</strong> {party.address}</div>
                  <div><strong>Đại diện:</strong> {party.representative}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments for rejected contracts */}
      {contract.status === 'rejected' && contract.comments && (
        <div className="border-t pt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-medium text-red-900">Lý do từ chối</h3>
            </div>
            <p className="text-red-800">{contract.comments}</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderDetails = () => (
    <div className="space-y-6">
      {contract.extractedInfo?.detailedSummary && (
        <>
          {/* General Info */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">1. Thông tin chung</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong>Số hợp đồng:</strong> {contract.extractedInfo.detailedSummary.generalInfo.contractNumber || 'Chưa có'}
                </div>
                <div>
                  <strong>Ngày ký:</strong> {contract.extractedInfo.detailedSummary.generalInfo.signDate || 'Chưa xác định'}
                </div>
                <div>
                  <strong>Hiệu lực từ:</strong> {contract.extractedInfo.detailedSummary.generalInfo.effectiveDate || 'Chưa xác định'}
                </div>
                <div>
                  <strong>Hết hạn:</strong> {contract.extractedInfo.detailedSummary.generalInfo.expiryDate || 'Chưa xác định'}
                </div>
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">2. Mục đích hợp đồng</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p>{contract.extractedInfo.detailedSummary.purpose || 'Chưa có mô tả'}</p>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">4. Thời gian và tiến độ</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div><strong>Thời hạn:</strong> {contract.extractedInfo.detailedSummary.timeline.duration || 'Chưa xác định'}</div>
              {contract.extractedInfo.detailedSummary.timeline.milestones && (
                <div>
                  <strong>Các mốc quan trọng:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {contract.extractedInfo.detailedSummary.timeline.milestones
                      .filter(m => m.trim())
                      .map((milestone, index) => (
                        <li key={index}>{milestone}</li>
                      ))}
                  </ul>
                </div>
              )}
              {contract.extractedInfo.detailedSummary.timeline.terminationConditions && (
                <div><strong>Điều kiện chấm dứt:</strong> {contract.extractedInfo.detailedSummary.timeline.terminationConditions}</div>
              )}
            </div>
          </div>

          {/* Obligations */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">5. Quyền và nghĩa vụ các bên</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Nghĩa vụ Bên A</h4>
                <ul className="list-disc list-inside space-y-1">
                  {contract.extractedInfo.detailedSummary.obligations.partyA
                    .filter(o => o.trim())
                    .map((obligation, index) => (
                      <li key={index} className="text-blue-800">{obligation}</li>
                    ))}
                </ul>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Nghĩa vụ Bên B</h4>
                <ul className="list-disc list-inside space-y-1">
                  {contract.extractedInfo.detailedSummary.obligations.partyB
                    .filter(o => o.trim())
                    .map((obligation, index) => (
                      <li key={index} className="text-green-800">{obligation}</li>
                    ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Warranties */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">6. Điều khoản bảo hành, bảo mật, phạt vi phạm</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {contract.extractedInfo.detailedSummary.warranties.warranty && (
                <div><strong>Bảo hành:</strong> {contract.extractedInfo.detailedSummary.warranties.warranty}</div>
              )}
              {contract.extractedInfo.detailedSummary.warranties.confidentiality && (
                <div><strong>Bảo mật:</strong> {contract.extractedInfo.detailedSummary.warranties.confidentiality}</div>
              )}
              {contract.extractedInfo.detailedSummary.warranties.penalties && (
                <div><strong>Phạt vi phạm:</strong> {contract.extractedInfo.detailedSummary.warranties.penalties}</div>
              )}
            </div>
          </div>

          {/* Dispute Resolution */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">7. Giải quyết tranh chấp</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div><strong>Cơ quan tài phán:</strong> {contract.extractedInfo.detailedSummary.disputeResolution.jurisdiction || 'Chưa xác định'}</div>
              <div><strong>Địa điểm xử lý:</strong> {contract.extractedInfo.detailedSummary.disputeResolution.venue || 'Chưa xác định'}</div>
            </div>
          </div>

          {/* Attachments */}
          {contract.extractedInfo.detailedSummary.attachments && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">8. Phụ lục và tài liệu đính kèm</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="list-disc list-inside">
                  {contract.extractedInfo.detailedSummary.attachments
                    .filter(a => a.trim())
                    .map((attachment, index) => (
                      <li key={index}>{attachment}</li>
                    ))}
                </ul>
              </div>
            </div>
          )}

          {/* Current Status */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">9. Tình trạng hiện tại</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div><strong>Trạng thái:</strong> {getStatusText(contract.status)}</div>
              {contract.extractedInfo.detailedSummary.currentStatus && (
                <div><strong>Ghi chú trạng thái:</strong> {contract.extractedInfo.detailedSummary.currentStatus}</div>
              )}
              {contract.extractedInfo.detailedSummary.notes && (
                <div><strong>Ghi chú thêm:</strong> {contract.extractedInfo.detailedSummary.notes}</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderHighlights = () => (
    <div className="space-y-6">
      {contract.extractedInfo?.detailedSummary?.keyHighlights && (
        <>
          {/* Contract Type */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Loại hợp đồng</h3>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                contract.extractedInfo.detailedSummary.keyHighlights.contractType === 'commercial'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {contract.extractedInfo.detailedSummary.keyHighlights.contractType === 'commercial' 
                  ? 'Hợp đồng thương mại' 
                  : 'Hợp đồng nội bộ'}
              </span>
            </div>
          </div>

          {/* Critical Terms */}
          {contract.extractedInfo.detailedSummary.keyHighlights.criticalTerms.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Điều khoản quan trọng</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <ul className="list-disc list-inside space-y-1">
                  {contract.extractedInfo.detailedSummary.keyHighlights.criticalTerms.map((term, index) => (
                    <li key={index} className="text-amber-800">{term}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Risk Factors */}
          {contract.extractedInfo.detailedSummary.keyHighlights.riskFactors.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Yếu tố rủi ro</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <ul className="list-disc list-inside space-y-1">
                  {contract.extractedInfo.detailedSummary.keyHighlights.riskFactors.map((risk, index) => (
                    <li key={index} className="text-red-800">{risk}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Compliance Requirements */}
          {contract.extractedInfo.detailedSummary.keyHighlights.complianceRequirements.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Yêu cầu tuân thủ</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <ul className="list-disc list-inside space-y-1">
                  {contract.extractedInfo.detailedSummary.keyHighlights.complianceRequirements.map((req, index) => (
                    <li key={index} className="text-blue-800">{req}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Delivery Terms */}
          {contract.extractedInfo.detailedSummary.keyHighlights.deliveryTerms && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Điều kiện bàn giao</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p>{contract.extractedInfo.detailedSummary.keyHighlights.deliveryTerms}</p>
              </div>
            </div>
          )}

          {/* Acceptance Criteria */}
          {contract.extractedInfo.detailedSummary.keyHighlights.acceptanceCriteria && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tiêu chí nghiệm thu</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p>{contract.extractedInfo.detailedSummary.keyHighlights.acceptanceCriteria}</p>
              </div>
            </div>
          )}

          {/* Termination Clause */}
          {contract.extractedInfo.detailedSummary.keyHighlights.terminationClause && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Điều khoản chấm dứt</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p>{contract.extractedInfo.detailedSummary.keyHighlights.terminationClause}</p>
              </div>
            </div>
          )}

          {/* Special Provisions */}
          {contract.extractedInfo.detailedSummary.keyHighlights.specialProvisions.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Điều khoản đặc biệt</h3>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <ul className="list-disc list-inside space-y-1">
                  {contract.extractedInfo.detailedSummary.keyHighlights.specialProvisions.map((provision, index) => (
                    <li key={index} className="text-purple-800">{provision}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Signatory Info */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin người ký</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Bên A</h4>
                <div className="space-y-1 text-sm">
                  <div><strong>Người ký:</strong> {contract.extractedInfo.detailedSummary.keyHighlights.signatoryInfo.partyA.name}</div>
                  <div><strong>Chức danh:</strong> {contract.extractedInfo.detailedSummary.keyHighlights.signatoryInfo.partyA.title}</div>
                  <div><strong>Thẩm quyền:</strong> {contract.extractedInfo.detailedSummary.keyHighlights.signatoryInfo.partyA.authority}</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Bên B</h4>
                <div className="space-y-1 text-sm">
                  <div><strong>Người ký:</strong> {contract.extractedInfo.detailedSummary.keyHighlights.signatoryInfo.partyB.name}</div>
                  <div><strong>Chức danh:</strong> {contract.extractedInfo.detailedSummary.keyHighlights.signatoryInfo.partyB.title}</div>
                  <div><strong>Thẩm quyền:</strong> {contract.extractedInfo.detailedSummary.keyHighlights.signatoryInfo.partyB.authority}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{contract.title}</h2>
                <p className="text-sm text-gray-500">
                  Phiên bản {contract.currentVersion} • {getStatusText(contract.status)}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-4">
            {canEdit() && (
              <button
                onClick={() => onEdit(contract)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Chỉnh sửa</span>
              </button>
            )}
            {canSendForApproval() && (
              <button
                onClick={() => onSendForApproval(contract)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Gửi duyệt</span>
              </button>
            )}
            {canResubmit() && (
              <button
                onClick={() => onResubmit(contract.id)}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Gửi lại duyệt</span>
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'overview'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'details'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Chi tiết
            </button>
            <button
              onClick={() => setActiveTab('highlights')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'highlights'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
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
      </div>
    </div>
  );
};