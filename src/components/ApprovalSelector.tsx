import React, { useState } from 'react';
import { X, User, CheckCircle, AlertTriangle, DollarSign, Scale, FileText } from 'lucide-react';
import { Contract } from '../types/contract';
import { User as UserType } from '../types/user';

interface ApprovalSelectorProps {
  contract: Contract;
  availableApprovers: UserType[];
  onClose: () => void;
  onSubmit: (approvers: { content?: string; finance?: string; legal?: string }) => void;
}

export const ApprovalSelector: React.FC<ApprovalSelectorProps> = ({
  contract,
  availableApprovers,
  onClose,
  onSubmit
}) => {
  const [selectedApprovers, setSelectedApprovers] = useState<{
    content?: string;
    finance?: string;
    legal?: string;
  }>({});

  const contractValue = contract.extractedInfo?.numericValue || 0;

  // AI suggestions based on contract value and type
  const getAISuggestions = () => {
    const suggestions = {
      content: '',
      finance: '',
      legal: '',
      reasons: {
        content: '',
        finance: '',
        legal: ''
      }
    };

    // Content approver suggestion
    if (contractValue > 10000000000) { // > 10 tỷ
      const director = availableApprovers.find(u => u.role === 'director');
      if (director) {
        suggestions.content = director.id;
        suggestions.reasons.content = 'Hợp đồng giá trị cao (>10 tỷ) cần phê duyệt từ Giám đốc';
      }
    } else if (contractValue > 1000000000) { // > 1 tỷ
      const manager = availableApprovers.find(u => u.role === 'manager');
      if (manager) {
        suggestions.content = manager.id;
        suggestions.reasons.content = 'Hợp đồng giá trị trung bình (>1 tỷ) phù hợp với Manager';
      }
    }

    // Finance approver suggestion
    if (contractValue > 500000000) { // > 500 triệu
      const finance = availableApprovers.find(u => u.role === 'finance');
      if (finance) {
        suggestions.finance = finance.id;
        suggestions.reasons.finance = 'Hợp đồng có giá trị tài chính cao cần kiểm tra từ bộ phận Tài chính';
      }
    }

    // Legal approver suggestion
    const contractType = contract.extractedInfo?.detailedSummary?.keyHighlights?.contractType;
    if (contractType === 'commercial' || contractValue > 1000000000) {
      const legal = availableApprovers.find(u => u.role === 'legal');
      if (legal) {
        suggestions.legal = legal.id;
        suggestions.reasons.legal = contractType === 'commercial' 
          ? 'Hợp đồng thương mại cần kiểm tra pháp lý'
          : 'Hợp đồng giá trị cao cần đánh giá rủi ro pháp lý';
      }
    }

    return suggestions;
  };

  const aiSuggestions = getAISuggestions();

  // Initialize with AI suggestions
  React.useEffect(() => {
    setSelectedApprovers({
      content: aiSuggestions.content,
      finance: aiSuggestions.finance,
      legal: aiSuggestions.legal
    });
  }, []);

  const handleSubmit = () => {
    onSubmit(selectedApprovers);
  };

  const getUserById = (id: string) => availableApprovers.find(u => u.id === id);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Chọn người phê duyệt</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Contract Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Thông tin hợp đồng</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Tên:</span>
                <p className="text-blue-700">{contract.title}</p>
              </div>
              <div>
                <span className="font-medium text-blue-800">Giá trị:</span>
                <p className="text-blue-700">{formatCurrency(contractValue)}</p>
              </div>
              <div>
                <span className="font-medium text-blue-800">Loại:</span>
                <p className="text-blue-700">
                  {contract.extractedInfo?.detailedSummary?.keyHighlights?.contractType === 'commercial' 
                    ? 'Thương mại' : 'Nội bộ'}
                </p>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-green-900">Gợi ý từ AI</h3>
            </div>
            <div className="space-y-2 text-sm text-green-800">
              {aiSuggestions.reasons.content && (
                <p>• <strong>Phê duyệt nội dung:</strong> {aiSuggestions.reasons.content}</p>
              )}
              {aiSuggestions.reasons.finance && (
                <p>• <strong>Phê duyệt tài chính:</strong> {aiSuggestions.reasons.finance}</p>
              )}
              {aiSuggestions.reasons.legal && (
                <p>• <strong>Phê duyệt pháp lý:</strong> {aiSuggestions.reasons.legal}</p>
              )}
            </div>
          </div>

          {/* Approver Selection */}
          <div className="space-y-6">
            {/* Content Approver */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-gray-900">Người phê duyệt nội dung</h4>
                <span className="text-red-500">*</span>
              </div>
              <select
                value={selectedApprovers.content || ''}
                onChange={(e) => setSelectedApprovers({
                  ...selectedApprovers,
                  content: e.target.value || undefined
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Chọn người phê duyệt nội dung</option>
                {availableApprovers
                  .filter(u => u.permissions.canApprove && ['manager', 'director', 'admin'].includes(u.role))
                  .map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} - {user.position} ({user.department})
                    </option>
                  ))}
              </select>
              {selectedApprovers.content && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  <strong>Đã chọn:</strong> {getUserById(selectedApprovers.content)?.name}
                </div>
              )}
            </div>

            {/* Finance Approver */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-gray-900">Người phê duyệt tài chính</h4>
                <span className="text-gray-500">(Tùy chọn)</span>
              </div>
              <select
                value={selectedApprovers.finance || ''}
                onChange={(e) => setSelectedApprovers({
                  ...selectedApprovers,
                  finance: e.target.value || undefined
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Không cần phê duyệt tài chính</option>
                {availableApprovers
                  .filter(u => u.permissions.canApprove && ['finance', 'director', 'admin'].includes(u.role))
                  .map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} - {user.position} ({user.department})
                    </option>
                  ))}
              </select>
              {selectedApprovers.finance && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  <strong>Đã chọn:</strong> {getUserById(selectedApprovers.finance)?.name}
                </div>
              )}
            </div>

            {/* Legal Approver */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Scale className="w-5 h-5 text-purple-600" />
                <h4 className="font-medium text-gray-900">Người phê duyệt pháp chế</h4>
                <span className="text-gray-500">(Tùy chọn)</span>
              </div>
              <select
                value={selectedApprovers.legal || ''}
                onChange={(e) => setSelectedApprovers({
                  ...selectedApprovers,
                  legal: e.target.value || undefined
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Không cần phê duyệt pháp chế</option>
                {availableApprovers
                  .filter(u => u.permissions.canApprove && ['legal', 'director', 'admin'].includes(u.role))
                  .map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} - {user.position} ({user.department})
                    </option>
                  ))}
              </select>
              {selectedApprovers.legal && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  <strong>Đã chọn:</strong> {getUserById(selectedApprovers.legal)?.name}
                </div>
              )}
            </div>
          </div>

          {/* Warning for high value contracts */}
          {contractValue > 5000000000 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-800">Lưu ý quan trọng</span>
              </div>
              <p className="text-amber-700 text-sm mt-1">
                Hợp đồng có giá trị cao ({formatCurrency(contractValue)}). 
                Khuyến nghị có đầy đủ phê duyệt từ cả 3 bộ phận: Nội dung, Tài chính và Pháp chế.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedApprovers.content}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Gửi phê duyệt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};