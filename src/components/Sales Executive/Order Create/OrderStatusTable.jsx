import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../../../config"; // Assuming this is already configured

const OrderStatusTable = () => {
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnData, setReturnData] = useState({ items: [{ defectiveQuantities: '', okayQuantities: '' }] });

  const orderDeliveredStatusEnum = ['Pending', 'Dispatched', 'Fully Delivered', 'Return'];

  // Colors for different statuses
  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Dispatched: 'bg-blue-100 text-blue-800',
    'Fully Delivered': 'bg-green-100 text-green-800',
    Return: 'bg-red-100 text-red-800',
  };

  useEffect(() => {
    fetchOrderStatuses();
  }, []);

  const fetchOrderStatuses = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/orderItem/order-status/details`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setOrderStatuses(data);
      } else {
        setError("Invalid response format. Expected an array.");
      }
    } catch (error) {
      setError("An error occurred while fetching order statuses.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter order statuses based on multiple fields
  const filteredOrderStatuses = orderStatuses.filter((order) =>
    order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderStatus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrderStatuses.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredOrderStatuses.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleReturnStatus = async (order) => {
    setSelectedOrder(order);
    setLoading(true);
  
    const token = localStorage.getItem("token");
    try {
      // Fetch the order details from the API
      const response = await fetch(`${API_BASE_URL}/api/orderItem/orderforstatus/${order.orderId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      if (data?.order?.items) {
        // Set the return data with the items from the fetched order details
        setReturnData({
          items: data.order.items.map((item) => ({
            categoryName: item.categoryName,
            itemCode: item.itemCode,
            itemName: item.itemName,
            defectiveQuantities: item.defectiveQuantities || '',
            okayQuantities: item.okayQuantities || '',
          })),
        });
      } else {
        toast.error("Failed to load order details.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching order details.");
    } finally {
      setLoading(false);
      setShowModal(true);
    }
  };

  const updateOrderDeliveryStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem("token");
    const data = {
      orderDeliveredStatus: newStatus,
    };
  
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/orderItem/${orderId}/delivery-status`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        // Update the local state after successful status update
        setOrderStatuses((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === orderId ? { ...order, orderDeliveredStatus: newStatus } : order
          )
        );
        toast.success(`Order status updated to ${newStatus}`);
      } else {
        toast.error("Failed to update order status. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred while updating the status.");
    } finally {
      setLoading(false);
    }
  };

  const handleReturnSubmit = async () => {
    if (!returnData.items || returnData.items.length === 0) {
      toast.error("Please provide return details.");
      return;
    }
  
    // Convert defective and okay quantities to numbers if they are not already numbers
    const updatedItems = returnData.items.map((item) => ({
      ...item,
      defectiveQuantities: Number(item.defectiveQuantities),
      okayQuantities: Number(item.okayQuantities),
    }));
  
    const token = localStorage.getItem("token");
    const data = {
      orderDeliveredStatus: "Return",
      items: updatedItems,
    };
  
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/orderItem/${selectedOrder.orderId}/delivery-status`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        // Update the local state after successful return
        setOrderStatuses((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === selectedOrder.orderId ? { ...order, orderDeliveredStatus: "Return" } : order
          )
        );
        toast.success("Order marked for return successfully!");
        setShowModal(false);
        setReturnData({ items: [{ defectiveQuantities: '', okayQuantities: '' }] }); // Reset state after submission
      } else {
        toast.error("Failed to process return. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred while processing the return.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleModalClose = () => {
    setShowModal(false);
    setReturnData({ items: [{ defectiveQuantities: '', okayQuantities: '' }] }); // Reset data when modal is closed
  };

  const handleDefectiveQuantityChange = (e) => {
    const updatedDefectiveQuantity = e.target.value;
    setReturnData((prevReturnData) => ({
      ...prevReturnData,
      items: prevReturnData.items.map((item, index) => index === 0 ? {
        ...item,
        defectiveQuantities: updatedDefectiveQuantity, // Ensure this is a string here
      } : item)
    }));
  };
  
  const handleOkayQuantityChange = (e) => {
    const updatedOkayQuantity = e.target.value;
    setReturnData((prevReturnData) => ({
      ...prevReturnData,
      items: prevReturnData.items.map((item, index) => index === 0 ? {
        ...item,
        okayQuantities: updatedOkayQuantity, // Ensure this is a string here
      } : item)
    }));
  };
  

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
      <div className="p-4">
        {/* Action section: Search */}
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search Orders..."
            className="p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Loading/Error State */}
        {loading ? (
          <div className="text-center py-4">
            <p>Loading order statuses...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Table */}
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Product Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Delivered Status</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {/* Loop through the order status data */}
                {currentItems.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50 border-b border-gray-200">
                    <td className="px-4 py-2 text-sm">{order.orderId}</td>
                    <td className="px-4 py-2 text-sm">{order.clientName}</td>
                    <td className="px-4 py-2 text-sm">{order.totalProductAmount}</td>
                    <td className="px-4 py-2 text-sm">{order.orderStatus}</td>
                    <td className="px-4 py-2 text-sm">{order.createdBy}</td>
                    <td className="px-4 py-2 text-sm">{order.assignedTo}</td>
                    <td className="px-4 py-2 text-sm">
                      {/* Delivery Status Dropdown */}
                      <select
                        value={order.orderDeliveredStatus}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          if (newStatus === 'Return') {
                            handleReturnStatus(order); // Open return modal if selected
                          } else {
                            updateOrderDeliveryStatus(order.orderId, newStatus);
                          }
                        }}
                        className={`px-2 py-1 border border-gray-300 rounded-md ${statusColors[order.orderDeliveredStatus]}`}
                      >
                        {orderDeliveredStatusEnum.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4 flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, orderStatuses.length)} of {orderStatuses.length} orders
            </span>
          </div>

          <div className="flex space-x-2">
            {/* Previous Page Button */}
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 text-gray-600 rounded-lg disabled:bg-gray-400"
            >
              Prev
            </button>
            {/* Next Page Button */}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 text-gray-600 rounded-lg disabled:bg-gray-400"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal for Return */}
      {showModal && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-128">
      <h3 className="text-xl mb-4">Return Details</h3>

      {returnData.items.map((item, index) => (
        <div key={index} className="mb-4"> {/* Reduced margin from mb-6 to mb-4 */}
          {/* Label for Item (e.g., Item 1, Item 2, etc.) */}
          <h4 className="text-lg font-semibold mb-4">Item {index + 1}</h4>

          {/* Row for all inputs of the current item */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block mb-2">Category</label>
              <input
                type="text"
                value={item.categoryName}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-md mb-2"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2">Item Code</label>
              <input
                type="text"
                value={item.itemCode}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-md mb-2"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2">Item Name</label>
              <input
                type="text"
                value={item.itemName}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-md mb-2"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2">Defective Quantity</label>
              <input
                type="number"
                value={item.defectiveQuantities}
                onChange={(e) => {
                  const updatedItems = [...returnData.items];
                  updatedItems[index].defectiveQuantities = e.target.value;
                  setReturnData({ items: updatedItems });
                }}
                className="w-full p-2 border border-gray-300 rounded-md mb-2"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2">Okay Quantity</label>
              <input
                type="number"
                value={item.okayQuantities}
                onChange={(e) => {
                  const updatedItems = [...returnData.items];
                  updatedItems[index].okayQuantities = e.target.value;
                  setReturnData({ items: updatedItems });
                }}
                className="w-full p-2 border border-gray-300 rounded-md mb-2"
              />
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-between mt-6">
        <button onClick={handleModalClose} className="px-4 py-2 bg-gray-500 text-white rounded-md">Cancel</button>
        <button onClick={handleReturnSubmit} className="px-4 py-2 bg-red-500 text-white rounded-md">Return</button>
      </div>
    </div>
  </div>
)}


      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
};

export default OrderStatusTable;
