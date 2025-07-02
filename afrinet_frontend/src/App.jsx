import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Active_Users from './pages/Active_Users';
import Dashboard from './pages/dashboard';
import AdminDashboard from './pages/admin_dashboard';
import Payments from './pages/Payments';
import Packages from './pages/Packages';
import Users from './pages/Users';
import Vouchers from './pages/Vouchers';
import Expenses from './pages/Expenses';
import ActiveUsers from './pages/ActiveUsers';
import Mikrotik from './pages/Mikrotik';
import SMS from './pages/Sms';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/payments" element={<Payments/>} />
        <Route path="/packages" element={<Packages/>} />
        <Route path="/users" element={<Users/>} />
        <Route path="/active-users" element={<ActiveUsers/>} />
        <Route path="/expenses" element={<Expenses/>} />
        <Route path="/vouchers" element={<Vouchers/>} />
        <Route path="/sms" element={<SMS/>} />
        <Route path="/mikrotik" element={<Mikrotik/>} />
      </Routes>
    </BrowserRouter>
  ); 
}

export default App;