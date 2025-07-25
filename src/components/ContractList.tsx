@@ .. @@
 interface ContractListProps {
   contracts: Contract[];
   onEdit: (contract: Contract) => void;
   onDelete: (contractId: string) => void;
   onView: (contract: Contract) => void;
+  onSendForApproval: (contract: Contract) => void;
+  onViewDetails: (contract: Contract) => void;
 }

 export const ContractList: React.FC<ContractListProps> = ({
   contracts,
   onEdit,
   onDelete,
-  onView
+  onView,
+  onSendForApproval,
+  onViewDetails
 }) => {
   const [searchTerm, setSearchTerm] = useState('');
   const [statusFilter, setStatusFilter] = useState<string>('all');
@@ .. @@
                       <div className="flex space-x-2">
                         <button
                           onClick={() => onView(contract)}
                           className="p-2 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50"
                           title="Xem chi tiết"
                         >
                           <Eye className="w-4 h-4" />
                         </button>
+                        <button
+                          onClick={() => onViewDetails(contract)}
+                          className="p-2 text-green-600 hover:text-green-800 rounded-lg hover:bg-green-50"
+                          title="Xem thông tin đầy đủ"
+                        >
+                          <FileText className="w-4 h-4" />
+                        </button>
                         <button
                           onClick={() => onEdit(contract)}
                           className="p-2 text-amber-600 hover:text-amber-800 rounded-lg hover:bg-amber-50"
                           title="Chỉnh sửa"
                         >
                           <Edit className="w-4 h-4" />
                         </button>
+                        {(contract.status === 'draft' || contract.status === 'rejected') && (
+                          <button
+                            onClick={() => onSendForApproval(contract)}
+                            className="p-2 text-purple-600 hover:text-purple-800 rounded-lg hover:bg-purple-50"
+                            title="Gửi duyệt"
+                          >
+                            <Send className="w-4 h-4" />
+                          </button>
+                        )}
                         <button
                           onClick={() => onDelete(contract.id)}
                           className="p-2 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-50"
                           title="Xóa"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         )}
       </div>
     </div>
   );
 };