import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/admin_dashboard';
import Payments from './pages/Payments';
import Packages from './pages/Packages';
import Users from './pages/Users';
import Vouchers from './pages/Vouchers';
import Expenses from './pages/Expenses';
import ActiveUsers from './pages/ActiveUsers';
import Mikrotik from './pages/Mikrotik';
import SMS from './pages/Sms';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import ProtectedRoute from './pages/ProtectedRoute';
import Login from './pages/Login';
import { AuthProvider } from './pages/AuthContext';
import Register from './pages/Register';
import Logout from './pages/Logout';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/payments" element={
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          } />
          
          <Route path="/packages" element={
            <ProtectedRoute>
              <Packages />
            </ProtectedRoute>
          } />
          
          <Route path="/users" element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          } />
          
          <Route path="/active-users" element={
            <ProtectedRoute>
              <ActiveUsers />
            </ProtectedRoute>
          } />
          
          <Route path="/expenses" element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          } />
          
          <Route path="/vouchers" element={
            <ProtectedRoute>
              <Vouchers />
            </ProtectedRoute>
          } />
          
          <Route path="/sms" element={
            <ProtectedRoute>
              <SMS />
            </ProtectedRoute>
          } />
          
          <Route path="/mikrotik" element={
            <ProtectedRoute>
              <Mikrotik />
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  ); 
}

export default App;