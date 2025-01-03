import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify"; // Import toast
import "react-toastify/dist/ReactToastify.css";

const ForClientOrderModal = ({ isOpen, closeModal }) => {
  const [items, setItems] = useState([
    { categoryName: "", itemName: "", qty: 1, price: 0, wareHouseName: "", inwardReference: "", inwardShipmentMark: "" },
  ]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryItems, setSelectedCategoryItems] = useState([]);
  const [clients, setClients] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      gst: 0, // Set default value for gst here
    },
  });

  const token = localStorage.getItem("token");

  // Watch GST value from the form
  const gst = watch("gst", 0); // Default to 0 if not provided

  // Fetch warehouse data when the component mounts
  useEffect(() => {
    const fetchWarehouseData = async () => {
      try {
        const warehouseResponse = await axios.get(
          "http://localhost:5000/api/warehouse/inventory/warehouse-details",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setWarehouses(warehouseResponse.data.data);
      } catch (error) {
        console.error("Error fetching warehouse data:", error.message);
      }
    };

    fetchWarehouseData();
  }, [token]);

  // Fetch client and category data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientResponse = await axios.get(
          "http://localhost:5000/api/clients",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setClients(clientResponse.data);

        const categoryResponse = await axios.get(
          "http://localhost:5000/api/categories/all-categories",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCategories(categoryResponse.data.categories);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchData();
  }, [token]);

  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const orderData = {
        clientId: data.clientId,
        items,
        gst: data.gst,
      };

      // Send the data to the API
      const response = await axios.post(
        "http://localhost:5000/api/orderItem/create-on-behalf",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Order created successfully!");
      closeModal();
      window.location.reload();
    } catch (error) {
      console.error("Error creating order:", error.message);
      toast.error("Error creating order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add a new item field
  const addItem = () => {
    setItems([
      ...items,
      { categoryName: "", itemName: "", qty: 1, price: 0, wareHouseName: "", inwardReference: "", inwardShipmentMark: "" },
    ]);
  };

  // Remove an item field
  const removeItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  // Handle item input changes
  const handleItemChange = (index, event) => {
    const updatedItems = [...items];
    updatedItems[index][event.target.name] = event.target.value;
    setItems(updatedItems);
  };

  // Update items based on selected category
  const handleCategoryChange = (index, event) => {
    const selectedCategory = event.target.value;
    const category = categories.find(
      (cat) => cat.categoryName === selectedCategory
    );
    const itemsForCategory = category ? category.items : [];

    const updatedItems = [...items];
    updatedItems[index].categoryName = selectedCategory;
    updatedItems[index].itemName = ""; // Reset itemName when category changes
    updatedItems[index].itemCode = "";
    setItems(updatedItems);

    const updatedCategoryItems = [...selectedCategoryItems];
    updatedCategoryItems[index] = itemsForCategory;
    setSelectedCategoryItems(updatedCategoryItems);
  };

  const handleItemNameChange = (index, event) => {
    const selectedItemName = event.target.value;

    const selectedItem = (selectedCategoryItems[index] || []).find(
      (item) => item.itemName === selectedItemName
    );

    const updatedItems = [...items];
    updatedItems[index].itemName = selectedItemName;
    updatedItems[index].itemCode = selectedItem ? selectedItem.itemCode : "";

    setItems(updatedItems);
  };

  const handleWarehouseChange = (index, warehouseId, inwardReference, inwardShipmentMark) => {
    const updatedItems = [...items];
    updatedItems[index].wareHouseName = warehouseId;
    updatedItems[index].inwardReference = inwardReference;
    updatedItems[index].inwardShipmentMark = inwardShipmentMark;
    setItems(updatedItems);
  };

  // Helper functions to calculate totals
  function calculateTotalBeforeGST() {
    return items
      .reduce((total, item) => total + item.qty * item.price, 0)
      .toFixed(2);
  }

  function calculateGSTAmount() {
    const totalBeforeGST = calculateTotalBeforeGST();
    const gstPercentage = parseFloat(gst);
    return ((totalBeforeGST * gstPercentage) / 100).toFixed(2);
  }

  function calculateTotalWithGST() {
    const totalBeforeGST = parseFloat(calculateTotalBeforeGST());
    const gstAmount = parseFloat(calculateGSTAmount());
    return (totalBeforeGST + gstAmount).toFixed(2);
  }

  const handleCloseModal = () => {
    reset({ gst: 0, clientId: "" });
    setItems([{
      categoryName: "", itemName: "", qty: 1, price: 0, wareHouseName: "", inwardReference: "", inwardShipmentMark: ""
    }]);
    closeModal();
  };

  // Get available warehouses for the selected item
  const getAvailableWarehouses = (item) => {
    return warehouses.reduce((availableWarehouses, warehouse) => {
      const warehouseItems = warehouse.items.filter(
        (warehouseItem) => warehouseItem.itemCode === item.itemCode
      );

      warehouseItems.forEach((warehouseItem) => {
        availableWarehouses.push({
          warehouseId: warehouse._id,
          inwardReference: warehouseItem.inwardReference,
          inwardShipmentMark: warehouseItem.inwardShipmentMark,
          quantity: warehouseItem.quantity,
        });
      });

      return availableWarehouses;
    }, []);
  };

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div
          className="bg-white p-6 rounded-lg shadow-lg w-full max-w-6xl overflow-y-auto"
          style={{ maxHeight: "90vh" }}
        >
          <h2 className="text-2xl font-bold mb-4">Create Order</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Client</label>
              <select
                {...register("clientId", { required: "Client is required" })}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select Client</option>
                {clients.map((client) => (
                  <option key={client._id} value={client.user}>
                    {client.firmName} - {client.contactPerson}
                  </option>
                ))}
              </select>
            </div>

            {/* Item Fields */}
            {items.map((item, index) => (
              <div key={index} className="mb-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-gray-700">Category</label>
                    <select
                      name="categoryName"
                      value={item.categoryName}
                      onChange={(e) => handleCategoryChange(index, e)}
                      className="w-full p-2 border border-gray-300 rounded"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.categoryName} value={category.categoryName}>
                          {category.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-gray-700">Item Name</label>
                    <select
                      name="itemName"
                      value={item.itemName}
                      onChange={(e) => handleItemNameChange(index, e)}
                      className="w-full p-2 border border-gray-300 rounded"
                    >
                      <option value="">Select Item</option>
                      {(Array.isArray(selectedCategoryItems[index]) ? selectedCategoryItems[index] : []).map((itemOption) => (
                        <option key={itemOption.itemCode} value={itemOption.itemName}>
                          {itemOption.itemName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-gray-700">Quantity</label>
                    <input
                      type="number"
                      name="qty"
                      value={item.qty}
                      onChange={(e) => handleItemChange(index, e)}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-gray-700">Price</label>
                    <input
                      type="number"
                      name="price"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, e)}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>

                  {/* Warehouse Selection */}
                
                  <div className="flex-1">
                    <label className="block text-gray-700">Warehouse</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded"
                      onChange={(e) =>
                        handleWarehouseChange(
                          index,
                          e.target.value,
                          e.target.selectedOptions[0].getAttribute("data-inward-reference"),
                          e.target.selectedOptions[0].getAttribute("data-inward-shipment-mark")
                        )
                      }
                    >
                      <option value="">Select Warehouse</option>
                      {getAvailableWarehouses(item).map((warehouse) => (
                        <option
                          key={warehouse.warehouseId}
                          value={warehouse.warehouseId}
                          data-inward-reference={warehouse.inwardReference}
                          data-inward-shipment-mark={warehouse.inwardShipmentMark}
                        >
                          {warehouse.warehouseId} - {warehouse.quantity} - {warehouse.inwardReference} available
                        </option>
                      ))}
                    </select>
                  </div>
                  

                </div>

               

                

                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="mt-2 text-red-500"
                >
                  Remove Item
                </button>
              </div>
            ))}

            {/* Add Item Button */}
            <button
              type="button"
              onClick={addItem}
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
            >
              Add Item
            </button>

            {/* GST and Total Calculations */}
            <div className="mt-4">
              <label className="block text-gray-700">GST (%)</label>
              <input
                type="number"
                value={gst}
                onChange={(e) => setValue("gst", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div className="mt-4">
              <div className="flex justify-between">
                <span>Total Before GST:</span>
                <span>{calculateTotalBeforeGST()}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Amount:</span>
                <span>{calculateGSTAmount()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total With GST:</span>
                <span>{calculateTotalWithGST()}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={handleCloseModal}
                className="bg-gray-500 text-white py-2 px-4 rounded"
              >
                Close
              </button>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white py-2 px-4 rounded"
              >
                {loading ? "Processing..." : "Create Order"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default ForClientOrderModal;
