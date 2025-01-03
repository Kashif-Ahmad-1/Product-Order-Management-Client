import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_BASE_URL } from "../../../config";

const TransferInventoryModal = ({ onClose, onTransfer }) => {
  const [transferQuantity, setTransferQuantity] = useState(0);
  const [fromWarehouseName, setFromWarehouseName] = useState('');
  const [toWarehouseName, setToWarehouseName] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchWarehouses();
    fetchItems();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/warehouse/get-warehouse/name`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWarehouses(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch warehouses');
    }
  };

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/warehouse/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch inventory items');
    }
  };

  // This function will update both itemCode and itemName when a new item is selected.
  const handleItemCodeChange = (e) => {
    const selectedItemCode = e.target.value;
    setItemCode(selectedItemCode);

    // Find the corresponding item name for the selected item code
    const selectedItem = items.find((item) => item.itemCode === selectedItemCode);
    if (selectedItem) {
      setItemName(selectedItem.itemName); // Update the itemName state
    }
  };

  // Ensure that transferQuantity is passed as a number (not string)
  const handleTransfer = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/warehouse/transfer/warehouse1/warehouse2`,
        {
          transferQuantity: parseInt(transferQuantity),  // Ensure it's a number
          fromWarehouseName,
          toWarehouseName,
          itemCode,
          itemName,  // Ensure itemName is passed along with itemCode
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        toast.success('Transfer successful');
        onTransfer(); // Update parent component's state
        onClose(); // Close modal
      }
    } catch (error) {
      toast.error('Transfer failed');
    }
  };

  return (
    <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
      <div className="modal-content bg-white w-full sm:w-96 md:w-3/5 lg:w-3/5 xl:w-3/5 p-8 rounded-xl shadow-2xl transform transition-all duration-300" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Transfer Inventory</h2>

        <div className="space-y-6">
          {/* From Warehouse and To Warehouse Dropdowns in the Same Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fromWarehouse" className="block text-sm font-medium text-gray-700">From Warehouse</label>
              <select
                id="fromWarehouse"
                value={fromWarehouseName}
                onChange={(e) => setFromWarehouseName(e.target.value)}
                className="mt-2 block w-full p-3 border-2 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse._id} value={warehouse.warehouseName}>
                    {warehouse.warehouseName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="toWarehouse" className="block text-sm font-medium text-gray-700">To Warehouse</label>
              <select
                id="toWarehouse"
                value={toWarehouseName}
                onChange={(e) => setToWarehouseName(e.target.value)}
                className="mt-2 block w-full p-3 border-2 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse._id} value={warehouse.warehouseName}>
                    {warehouse.warehouseName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Item Code Dropdown */}
          <div>
            <label htmlFor="itemCode" className="block text-sm font-medium text-gray-700">Item Code</label>
            <select
              id="itemCode"
              value={itemCode}
              onChange={handleItemCodeChange} // Update itemName when itemCode changes
              className="mt-2 block w-full p-3 border-2 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Item</option>
              {items.map((item) => (
                <option key={item._id} value={item.itemCode}>
                  {item.itemName} ({item.itemCode})
                </option>
              ))}
            </select>
          </div>

          {/* Transfer Quantity Input */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Transfer Quantity</label>
            <input
              type="number"
              id="quantity"
              value={transferQuantity}
              onChange={(e) => setTransferQuantity(parseInt(e.target.value) || 0)} // Ensure it's a number
              className="mt-2 block w-full p-3 border-2 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              min="1"
            />
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-between gap-4">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleTransfer}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
            >
              Transfer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferInventoryModal;
