// ReturnModal.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";

const ReturnModal = ({ isOpen, onClose, onSubmit, orderId, items }) => {
  const [itemQuantities, setItemQuantities] = useState(
    items.map((item) => ({
      itemId: item.itemId, 
      defectiveQuantities: 0, 
      okayQuantities: item.quantity
    }))
  );

  const handleDefectiveChange = (itemId, value) => {
    setItemQuantities((prevState) =>
      prevState.map((item) =>
        item.itemId === itemId
          ? { ...item, defectiveQuantities: parseInt(value, 10) }
          : item
      )
    );
  };

  const handleOkayChange = (itemId, value) => {
    setItemQuantities((prevState) =>
      prevState.map((item) =>
        item.itemId === itemId
          ? { ...item, okayQuantities: parseInt(value, 10) }
          : item
      )
    );
  };

  const handleSubmit = () => {
    if (itemQuantities.some((item) => item.defectiveQuantities + item.okayQuantities !== item.quantity)) {
      toast.error("Defective and okay quantities should sum up to the total quantity.");
      return;
    }
    const returnData = {
      orderDeliveredStatus: "Return",
      items: itemQuantities,
    };
    onSubmit(orderId, returnData);
    onClose();
  };

  return (
    isOpen && (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
          <h2 className="text-xl font-semibold mb-4">Return Order</h2>
          <div>
            {items.map((item) => (
              <div key={item.itemId} className="mb-4">
                <div className="flex justify-between">
                  <span>{item.itemName}</span>
                  <span>Total Quantity: {item.quantity}</span>
                </div>
                <div className="flex space-x-2 mt-2">
                  <input
                    type="number"
                    value={itemQuantities.find((i) => i.itemId === item.itemId).defectiveQuantities}
                    onChange={(e) => handleDefectiveChange(item.itemId, e.target.value)}
                    min="0"
                    className="px-2 py-1 border border-gray-300 rounded-md"
                    placeholder="Defective"
                  />
                  <input
                    type="number"
                    value={itemQuantities.find((i) => i.itemId === item.itemId).okayQuantities}
                    onChange={(e) => handleOkayChange(item.itemId, e.target.value)}
                    min="0"
                    className="px-2 py-1 border border-gray-300 rounded-md"
                    placeholder="Okay"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-4 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Submit Return
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default ReturnModal;
