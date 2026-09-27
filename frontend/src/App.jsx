import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Operations from './pages/Operations';
import ReportsHub from './pages/ReportsHub';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="/operations" element={<Operations />} />
        <Route path="/reports" element={<ReportsHub />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
