import React, { useState } from 'react';
import { Search, Filter, Plus, FileText, Calendar, User, DollarSign, Eye, Edit, Send, RefreshCw } from 'lucide-react';
import { Contract, ContractTag } from '../types/contract';
import { User as UserType } from '../types/user';

interface ContractListProps {
  contracts: Contract[];
  currentUser: UserType;
  onContractClick: (contract: Contract) => void;
  onContractDetails: (contract: Contract) => void;
  onSendForApproval: (contract: Contract) => void;
  availableTags: ContractTag[];
}

export const ContractList: React.FC<ContractListProps> = ({
  contracts,
  currentUser,
  onContractClick,
  onContractDetails,
  onSendForApproval,
  availableTags
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'value'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const filteredAndSortedContracts = contracts
    .filter(contract => {
      const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contract.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
      const matchesTag = tagFilter === 'all' || contract.tags.some(tag => tag.id === tagFilter);
      return matchesSearch && matchesStatus && matchesTag;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'value':
          comparison = (a.extractedInfo?.numericValue || 0) - (b.extractedInfo?.numericValue || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const canEdit = (contract: Contract) => {
    if (currentUser.role === 'admin') return true;
    if (contract.status === 'draft' || contract.status === 'rejected') return true;
    return false;
  };

  const canSendForApproval = (contract: Contract) => {
    return contract.status === 'draft' && currentUser.permissions.canUpload;
  };

  const canResubmit = (contract: Contract) => {
    return contract.status === 'rejected' && currentUser.permissions.canUpload;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm hợp đồng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="draft">Nháp</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
            <option value="signed">Đã ký</option>
            <option value="expired">Hết hạn</option>
          </select>

          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả tags</option>
            {availableTags.map(tag => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as 'date' | 'title' | 'value');
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date-desc">Mới nhất</option>
            <option value="date-asc">Cũ nhất</option>
            <option value="title-asc">Tên A-Z</option>
            <option value="title-desc">Tên Z-A</option>
            <option value="value-desc">Giá trị cao</option>
            <option value="value-asc">Giá trị thấp</option>
          </select>
        </div>
      </div>

      {/* Contract List */}
      <div className="space-y-4">
        {filteredAndSortedContracts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không có hợp đồng nào</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || tagFilter !== 'all'
                ? 'Không tìm thấy hợp đồng phù hợp với bộ lọc'
                : 'Chưa có hợp đồng nào được tải lên'}
            </p>
          </div>
        ) : (
          filteredAndSortedContracts.map((contract) => (
            <div
              key={contract.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{contract.title}</h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(contract.status)}`}>
                      {getStatusText(contract.status)}
                    </span>
                    {contract.parentContractId && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        Phiên bản {contract.currentVersion}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{contract.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Tải lên: {new Date(contract.uploadDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    
                    {contract.extractedInfo?.numericValue && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatCurrency(contract.extractedInfo.numericValue)}</span>
                      </div>
                    )}
                    
                    {contract.reviewer && (
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>Duyệt bởi: {contract.reviewer}</span>
                      </div>
                    )}
                  </div>
                  
                  {contract.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {contract.tags.map(tag => (
                        <span
                          key={tag.id}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {contract.status === 'rejected' && contract.comments && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>Lý do từ chối:</strong> {contract.comments}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => onContractDetails(contract)}
                    className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Xem</span>
                  </button>
                  
                  {canEdit(contract) && (
                    <button
                      onClick={() => onContractClick(contract)}
                      className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Sửa</span>
                    </button>
                  )}
                  
                  {canSendForApproval(contract) && (
                    <button
                      onClick={() => onSendForApproval(contract)}
                      className="flex items-center space-x-2 px-3 py-2 text-green-600 hover:text-green-800 border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      <span>Gửi duyệt</span>
                    </button>
                  )}
                  
                  {canResubmit(contract) && (
                    <button
                      onClick={() => onSendForApproval(contract)}
                      className="flex items-center space-x-2 px-3 py-2 text-orange-600 hover:text-orange-800 border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Gửi lại</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};