import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import Profile from '../pages/Profile';
import ClientList from '../pages/clients/ClientList';
import ClientDetails from '../pages/clients/ClientDetails';
import EquipmentList from '../pages/equipment/EquipmentList';
import EquipmentDetails from '../pages/equipment/EquipmentDetails';
import WorkOrderList from '../pages/workorders/WorkOrderList';
import WorkOrderDetails from '../pages/workorders/WorkOrderDetails';
import InvoiceList from '../pages/invoices/InvoiceList';
import InvoiceDetails from '../pages/invoices/InvoiceDetails';
import InventoryList from '../pages/inventory/InventoryList';
import UserList from '../pages/users/UserList';
import LandingPage from '../pages/LandingPage';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const AppRoutes: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/" element={!currentUser ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
      
      <Route element={!currentUser ? <AuthLayout /> : <Navigate to="/dashboard" replace />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>
      
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/work-orders" element={<WorkOrderList />} />
          <Route path="/work-orders/:id" element={<WorkOrderDetails />} />
          <Route path="/invoices" element={<InvoiceList />} />
          <Route path="/invoices/:id" element={<InvoiceDetails />} />
          <Route path="/clients" element={<ClientList />} />
          <Route path="/clients/:id" element={<ClientDetails />} />
          <Route path="/staff" element={<UserList />} />
          <Route path="/equipment" element={<EquipmentList />} />
          <Route path="/equipment/:id" element={<EquipmentDetails />} />
          <Route path="/inventory" element={<InventoryList />} />
          <Route path="/settings" element={<div>Settings Placeholder</div>} />
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
