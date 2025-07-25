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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Tải lên thành công!</h2>
              <p className="text-gray-600">Hợp đồng đã được xử lý và lưu trữ</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              Bạn muốn làm gì tiếp theo?
            </p>
          </div>

          {/* Option 1: Create new version */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Tạo phiên bản mới của hợp đồng cũ</h3>
                <p className="text-sm text-gray-600">Liên kết với hợp đồng hiện có để tạo phiên bản mới</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm hợp đồng cũ..."
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
                    <div
                      key={contract.id}
                      onClick={() => setSelectedContract(contract.id)}
                      className={`p-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                        selectedContract === contract.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          checked={selectedContract === contract.id}
                          onChange={() => setSelectedContract(contract.id)}
                          className="text-blue-600"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{contract.title}</p>
                          <p className="text-sm text-gray-500">{contract.description}</p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                            <span>Phiên bản: {contract.currentVersion}</span>
                            <span>Trạng thái: {
                              contract.status === 'approved' ? 'Đã duyệt' :
                              contract.status === 'pending' ? 'Chờ duyệt' :
                              contract.status === 'rejected' ? 'Từ chối' : 'Nháp'
                            }</span>
                          </div>
                        </div>
                      </div>
                    </div>
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
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">2</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Vào mục Hợp đồng</h3>
                <p className="text-sm text-gray-600">Xem và quản lý tất cả hợp đồng</p>
              </div>
            </div>

            <button
              onClick={handleGoToContracts}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Đi đến Hợp đồng</span>
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