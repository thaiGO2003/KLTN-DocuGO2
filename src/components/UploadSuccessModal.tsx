import React, { useState } from 'react';
import { CheckCircle, FileText, ArrowRight, Search } from 'lucide-react';
import { Contract } from '../types/contract';

interface UploadSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateVersion: (parentContractId: string) => void;
  onGoToContracts: () => void;
  availableContracts: Contract[];
}

export const UploadSuccessModal: React.FC<UploadSuccessModalProps> = ({
  isOpen,
  onClose,
  onCreateVersion,
  onGoToContracts,
  availableContracts
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContract, setSelectedContract] = useState<string>('');

  if (!isOpen) return null;

  const filteredContracts = availableContracts.filter(contract =>
    contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateVersion = () => {
    if (selectedContract) {
      onCreateVersion(selectedContract);
      onClose();
    }
  };

  const handleGoToContracts = () => {
    onGoToContracts();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Tải lên thành công!</h2>
              <p className="text-gray-600">Hợp đồng đã được tải lên và xử lý thành công.</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-gray-700 mb-4">Bạn muốn làm gì tiếp theo?</p>
          </div>

          {/* Option 1: Create new version */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <h3 className="font-medium text-gray-900">Tạo phiên bản mới của hợp đồng cũ</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Chọn hợp đồng hiện có để tạo phiên bản mới với nội dung vừa tải lên
            </p>
            
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm hợp đồng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredContracts.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {searchTerm ? 'Không tìm thấy hợp đồng phù hợp' : 'Không có hợp đồng nào'}
                  </div>
                ) : (
                  filteredContracts.map(contract => (
                    <label
                      key={contract.id}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <input
                        type="radio"
                        name="parentContract"
                        value={contract.id}
                        checked={selectedContract === contract.id}
                        onChange={(e) => setSelectedContract(e.target.value)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{contract.title}</div>
                        <div className="text-sm text-gray-500">{contract.description}</div>
                        <div className="text-xs text-gray-400">
                          Phiên bản hiện tại: {contract.currentVersion} • 
                          Trạng thái: {contract.status === 'approved' ? 'Đã duyệt' : 
                                     contract.status === 'pending' ? 'Chờ duyệt' : 
                                     contract.status === 'rejected' ? 'Từ chối' : 'Nháp'}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>

              <button
                onClick={handleCreateVersion}
                disabled={!selectedContract}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Tạo phiên bản mới</span>
              </button>
            </div>
          </div>

          {/* Option 2: Go to contracts */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <ArrowRight className="w-6 h-6 text-green-600" />
              <h3 className="font-medium text-gray-900">Vào mục Hợp đồng</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Chuyển đến danh sách hợp đồng để xem và quản lý hợp đồng vừa tải lên
            </p>
            
            <button
              onClick={handleGoToContracts}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Vào mục Hợp đồng</span>
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};