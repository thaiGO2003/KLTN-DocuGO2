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
            <h3 className="font-medium text-green-900 mb-3 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Gợi ý từ AI
            </h3>
            <div className="space-y-2 text-sm">
              {aiSuggestions.reasons.content && (
                <div className="flex items-start space-x-2">
                  <FileText className="w-4 h-4 text-green-600 mt-0.5" />
                  <span className="text-green-700">{aiSuggestions.reasons.content}</span>
                </div>
              )}
              {aiSuggestions.reasons.finance && (
                <div className="flex items-start space-x-2">
                  <DollarSign className="w-4 h-4 text-green-600 mt-0.5" />
                  <span className="text-green-700">{aiSuggestions.reasons.finance}</span>
                </div>
              )}
              {aiSuggestions.reasons.legal && (
                <div className="flex items-start space-x-2">
                  <Scale className="w-4 h-4 text-green-600 mt-0.5" />
                  <span className="text-green-700">{aiSuggestions.reasons.legal}</span>
                </div>
              )}
            </div>
          </div>

          {/* Approver Selection */}
          <div className="space-y-6">
            {/* Content Approver */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Người phê duyệt nội dung *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableApprovers
                  .filter(u => ['manager', 'director', 'admin'].includes(u.role))
                  .map(user => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedApprovers({ ...selectedApprovers, content: user.id })}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedApprovers.content === user.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.position}</p>
                          <p className="text-xs text-gray-400">
                            Phê duyệt đến: {formatCurrency(user.maxContractValue)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Finance Approver */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Người phê duyệt tài chính (tùy chọn)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div
                  onClick={() => setSelectedApprovers({ ...selectedApprovers, finance: undefined })}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    !selectedApprovers.finance
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">Bỏ qua</p>
                  <p className="text-sm text-gray-500">Không cần phê duyệt tài chính</p>
                </div>
                {availableApprovers
                  .filter(u => u.role === 'finance')
                  .map(user => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedApprovers({ ...selectedApprovers, finance: user.id })}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedApprovers.finance === user.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.position}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Legal Approver */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Người phê duyệt pháp chế (tùy chọn)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div
                  onClick={() => setSelectedApprovers({ ...selectedApprovers, legal: undefined })}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    !selectedApprovers.legal
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">Bỏ qua</p>
                  <p className="text-sm text-gray-500">Không cần phê duyệt pháp chế</p>
                </div>
                {availableApprovers
                  .filter(u => u.role === 'legal')
                  .map(user => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedApprovers({ ...selectedApprovers, legal: user.id })}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedApprovers.legal === user.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Scale className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.position}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
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