import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../config"; // Assuming this is already configured
import AddInventoryModal from "./AddInventoryModal"; // Import the modal
import AddWarehouseModal from "./AddWarehouseModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import axios from "axios";
import EditInventoryModal from "./EditInventoryModal";
import TransferInventoryModal from "./TransferInventoryModal";
const WarehouseInventoryTable = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);
  const [showAddWarehouseModal, setShowAddWarehouseModal] = useState(false);
  const [warehouses, setWarehouses] = useState([]); // For warehouse data
  const [warehouseLoading, setWarehouseLoading] = useState(true); // To track loading state of warehouse data
  const [isEditing, setIsEditing] = useState(false);
  const [warehouseToEdit, setWarehouseToEdit] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isWarehouseTableVisible, setIsWarehouseTableVisible] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const handleTransferClick = () => {
    setShowTransferModal(true); // Open the modal when the button is clicked
  };

  const handleTransfer = () => {
    // Re-fetch items after transfer (or handle state update)
    fetchItems();
  };

  const toggleWarehouseTableVisibility = () => {
    setIsWarehouseTableVisible((prev) => !prev);
  };

  useEffect(() => {
    fetchItems();
    fetchWarehouses();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);

    // Assuming token is stored in localStorage or context or any other place
    const token = localStorage.getItem("token"); // Replace this with your token retrieval logic

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Add token if exists
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/warehouse/inventory`, {
        method: "GET",
        headers: headers, // Attach the headers
      });

      const data = await response.json();
      console.log("Fetched data:", data);

      if (data.data && Array.isArray(data.data)) {
        setItems(data.data); // Only set items if the response contains a data array
      } else {
        setError("Invalid response format. Expected an array.");
      }
    } catch (error) {
      setError("An error occurred while fetching inventory items.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch warehouses from the API
  const fetchWarehouses = async () => {
    setWarehouseLoading(true);
    const token = localStorage.getItem("token"); // Get token from localStorage

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/warehouse/get-warehouse/name`,
        {
          method: "GET",
          headers: headers,
        }
      );

      const data = await response.json();

      if (data.data && Array.isArray(data.data)) {
        setWarehouses(data.data); // Set the warehouse data
      } else {
        setError("Failed to fetch warehouse data.");
      }
    } catch (error) {
      setError("An error occurred while fetching warehouse data.");
    } finally {
      setWarehouseLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter items based on item name, code, category, or warehouse
  const filteredItems = items.filter(
    (item) =>
      item.itemCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.warehouseName &&
        item.warehouseName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleAddInventory = async (newItems) => {
    try {
      if (Array.isArray(newItems)) {
        setItems((prevItems) => [...prevItems, ...newItems]);
      }
      await fetchItems();
    } catch (error) {
      // Error handling without toast or console message
    }
  };

  const handleAddWarehouse = (newWarehouse) => {
    fetchWarehouses();
  };

  // Delete section

  const handleEditInventory = (item) => {
    setItemToEdit(item);
    setShowEditModal(true);
  };

  const handleDeleteInventory = async (item) => {
    const token = localStorage.getItem("token"); // Retrieve the token from localStorage
    const itemId = item._id; // Use the MongoDB _id for the item

    if (!itemId || !token) {
      toast.error("Item ID or token is missing.");
      return;
    }

    try {
      // Make the DELETE request to the API using the _id
      const response = await axios.delete(
        `${API_BASE_URL}/api/warehouse/inventory/${itemId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add the token in the header
          },
        }
      );

      if (response.status === 200 || response.status === 204) {
        toast.success("Item deleted successfully.");

        // Remove the item from the state (update the UI)
        setItems((prevItems) => prevItems.filter((i) => i._id !== itemId));
      } else {
        toast.error("Failed to delete item.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the item.");
      console.error("Delete error:", error);
    }
  };

  const handleEditWarehouse = (warehouse) => {
    setWarehouseToEdit(warehouse);
    setIsEditing(true);
    setShowAddWarehouseModal(true);
  };

  const handleDeleteWarehouse = async (warehouseId) => {
    const token = localStorage.getItem("token");

    if (!warehouseId || !token) return;

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/warehouse/new-warehouse/${warehouseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200 || response.status === 204) {
        toast.success("Warehouse deleted");
        setWarehouses((prev) => prev.filter((w) => w._id !== warehouseId)); // Ensure filtering by _id
      } else {
        toast.error("Failed to delete warehouse");
      }
    } catch (error) {
      toast.error("Error deleting warehouse");
    }
  };

  const handleUpdateWarehouse = async (updatedWarehouse) => {
    setWarehouses((prev) =>
      prev.map((warehouse) =>
        warehouse._id === updatedWarehouse._id ? updatedWarehouse : warehouse
      )
    );
    await fetchItems();
  };

  const handleUpdateInventory = (updatedItem) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.itemCode === updatedItem.itemCode ? updatedItem : item
      )
    );
    setShowEditModal(false);
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Left side: Inventory Table */}
      <div className="flex-1 overflow-x-auto bg-white rounded-lg shadow-lg p-4">
        {/* Search Bar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center sm:space-x-6">
  {/* Search Input */}
  <input
    type="text"
    value={searchTerm}
    onChange={handleSearch}
    placeholder="Search Inventory..."
    className="p-3 border border-gray-300 rounded-lg shadow-sm mb-4 sm:mb-0 sm:w-2/3 lg:w-1/2 xl:w-1/2 transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-500"
  />
  {/* Buttons */}
  <div className="flex flex-col sm:flex-row sm:space-x-4">
  <button
    onClick={() => setShowAddInventoryModal(true)}
    className="px-3 py-0.5 bg-green-500 text-white rounded-md w-[10rem] hover:bg-green-600 transition-all duration-300 ease-in-out"
  >
    Inventory
  </button>
  <button
    onClick={() => setShowAddWarehouseModal(true)}
    className="px-3 py-1.5 bg-blue-500 text-white rounded-md w-[10rem] hover:bg-blue-600 transition-all duration-300 ease-in-out"
  >
    Warehouse
  </button>
  <button
    onClick={handleTransferClick}
    className="px-3 py-1.5 bg-yellow-500 text-white rounded-md w-[10rem] hover:bg-yellow-600 transition-all duration-300 ease-in-out"
  >
    Transfer Inventory
  </button>
</div>

</div>




        {/* Loading/Error State */}
        {loading ? (
          <div className="text-center py-4">
            <p>Loading items...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            <p>No Item Found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Table */}
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Warehouse Name
                  </th>

                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Code
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Warehouse Item Batch
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Opening Stock
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inward Stock
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transfer In
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transfer Out
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales Return
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales Out
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Quantity
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {currentItems.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 border-b border-gray-200"
                  >
                    {item.warehouseName
                      ? item.warehouseName.charAt(0).toUpperCase() +
                        item.warehouseName.slice(1).toLowerCase()
                      : "No Warehouse"}

                    <td className="px-4 py-2 text-sm">{item.itemCategory}</td>
                    <td className="px-4 py-2 text-sm">{item.itemCode}</td>
                    <td className="px-4 py-2 text-sm">{item.itemName}</td>
                    <td className="px-4 py-2 text-sm">
                      {item.inwardReference}
                    </td>
                    <td className="px-4 py-2 text-sm">{item.openingStock}</td>
                    <td className="px-4 py-2 text-sm">{item.inwardStock}</td>
                    <td className="px-4 py-2 text-sm">{item.transferIn}</td>
                    <td className="px-4 py-2 text-sm">{item.transferOut}</td>
                    <td className="px-4 py-2 text-sm">{item.salesReturn}</td>
                    <td className="px-4 py-2 text-sm">{item.salesOut}</td>
                    <td className="px-4 py-2 text-sm">
                      {item.inHandStockQuantity}
                    </td>
                    <td className="px-4 py-2 text-sm flex space-x-2">
                      <button
                        onClick={() => handleEditInventory(item)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <HiOutlinePencil />
                      </button>
                      <button
                        onClick={() => handleDeleteInventory(item)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <HiOutlineTrash />
                      </button>
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
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, items.length)} of {items.length} items
            </span>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 text-gray-600 rounded-lg disabled:bg-gray-400"
            >
              Prev
            </button>
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

      {/* Right side: Warehouse Details Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Warehouse Details</h3>

        {warehouseLoading ? (
          <p>Loading warehouses...</p>
        ) : (
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Warehouse Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {warehouses.map((warehouse, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 border-b border-gray-200"
                >
                  <td className="px-4 py-2 text-sm">
                    {warehouse.warehouseName.charAt(0).toUpperCase() +
                      warehouse.warehouseName.slice(1).toLowerCase()}
                  </td>
                  <td className="px-4 py-2 text-sm">{warehouse.address}</td>
                  <td className="px-4 py-2 text-sm flex space-x-2">
                    <button
                      onClick={() => handleEditWarehouse(warehouse)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <HiOutlinePencil />
                    </button>
                    <button
                      onClick={() => handleDeleteWarehouse(warehouse._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <HiOutlineTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals for Add Inventory and Add Warehouse */}
      {showAddInventoryModal && (
        <AddInventoryModal
          onClose={() => setShowAddInventoryModal(false)}
          onAddInventory={handleAddInventory}
        />
      )}

      {showAddWarehouseModal && (
        <AddWarehouseModal
          onClose={() => setShowAddWarehouseModal(false)}
          onAddWarehouse={handleAddWarehouse}
          onUpdateWarehouse={handleUpdateWarehouse}
          warehouseToEdit={warehouseToEdit}
          isEditing={isEditing}
        />
      )}

      {showTransferModal && (
        <TransferInventoryModal
          onClose={() => setShowTransferModal(false)}
          onTransfer={handleTransfer} // Update table when transfer is complete
        />
      )}

      {showEditModal && (
        <EditInventoryModal
          item={itemToEdit}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdateInventory}
        />
      )}
      <ToastContainer />
    </div>
  );
};

export default WarehouseInventoryTable;
