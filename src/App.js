
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import OrdersPage from './components/Client Components/OrdersPage'; // Orders Page Component
import SalesOrdersPage from './components/Sales Executive/Order Create/SalesOrdersPage';
import Login from './components/Authentication/Login';
import ClientPage from './components/Sales Executive/Create Client/ClientPage';
import CategoriesPage from './components/Sales Executive/Items Master/CategoriesPage';
import Hero from './components/Hero';
import PrivateRoute from './PrivateRoute'; // Import the PrivateRoute component

import UserPage from './components/Authentication/UserPage';
import ResetPasswordPage from './components/Authentication/ResetPasswordPage';
import PurchaseOrderForm from './components/Sales Executive/Purchase Order/PurchaseOrderForm';
import PurchaseOrdersTable from './components/Sales Executive/Purchase Order/PurchaseOrdersTable';
import MaterialInwardRegister from './components/Sales Executive/Purchase Order/MaterialInwardRegister';
import ViewPurchaseOrder from './components/Sales Executive/Purchase Order/ViewPurchaseOrder';
import Layout from './components/Layout/Layout';

import SuppliersTable from './components/Admin/Supplier/SuppliersTable';
import WarehouseInventoryTable from './components/Admin/Warehouse/WarehouseInventoryTable';
import OrderStatusTable from './components/Sales Executive/Order Create/OrderStatusTable';

function App() {
  return (
    <div className="App">
      <Router>
        {/* Define routes for different pages */}
        <Routes>
          {/* Home Route */}
          <Route path="/" element={<Hero />} />
          
          {/* Login Route */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password/:resetToken" element={<ResetPasswordPage />} />
          
          {/* Orders Page Route (client role only) */}
          <Route path="/orders" element={<PrivateRoute allowedRoles={['client']} element={<OrdersPage />} />} />
          <Route path="/admin/users" element={<PrivateRoute allowedRoles={['admin']} element={<UserPage />} />} />
          

          <Route path="/admin/*" element={<PrivateRoute allowedRoles={['admin']} element={<Layout />} />}>
                <Route path="supplier" element={<SuppliersTable />} />
                <Route path="warehouse-inventory" element={<WarehouseInventoryTable />} />
                
          </Route>
          
          <Route path="/sales-executive/*" element={<PrivateRoute allowedRoles={['sales executive']} element={<Layout />} />}>
            <Route path="purchaseOrder" element={<PurchaseOrderForm />} />
            <Route path="purchaseOrder-details" element={<PurchaseOrdersTable />} />
            <Route path="material-inward/:grnId" element={<MaterialInwardRegister />} />
            <Route path="purchase-order/:referenceNo" element={<ViewPurchaseOrder />} />
            <Route path="warehouse-inventory" element={<WarehouseInventoryTable />} />
            <Route path="order/status-details" element={<OrderStatusTable />} />
           
           
          </Route>
          
          {/* Sales Orders Page Route (sales executive role only) */}
          <Route path="/sales-executive/order" element={<PrivateRoute allowedRoles={['sales executive']} element={<SalesOrdersPage />} />} />
          
          {/* Client Management Route (sales executive role only) */}
          <Route path="/sales-executive/clients" element={<PrivateRoute allowedRoles={['sales executive']} element={<ClientPage />} />} />
          
          {/* Categories Management Route (sales executive role only) */}
          <Route path="/sales-executive/items-master" element={<PrivateRoute allowedRoles={['sales executive']} element={<CategoriesPage />} />} />
          
          {/* You can add more protected routes here */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
