import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Registrasi from './pages/Registrasi';
import VerifikasiData from './pages/VerifikasiData';
import DataPengajuan from './pages/DataPengajuan';
import ValidasiData from './pages/ValidasiData';
import Finish from './pages/Finish';
import ManajemenPengguna from './pages/ManajemenPengguna';
import Pengaturan from './pages/Pengaturan';
import Login from './pages/Login';
import Register from './pages/Register';
import DataDitolak from './pages/DataDitolak';
import ChatMonitoring from './pages/ChatMonitoring';
import Event from './pages/Event';
import CekHalal from './pages/CekHalal';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/daftar" element={<Register />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="event" element={<Event />} />
              <Route path="registrasi" element={<Registrasi />} />
              <Route path="verifikasi-data" element={<VerifikasiData />} />
              <Route path="data-pengajuan" element={<DataPengajuan />} />
              <Route path="validasi-data" element={<ValidasiData />} />
              <Route path="finish" element={<Finish />} />
              <Route path="data-ditolak" element={<DataDitolak />} />
              <Route path="chat-monitoring" element={<ChatMonitoring />} />
              <Route path="manajemen-pengguna" element={<ManajemenPengguna />} />
              <Route path="cek-halal" element={<CekHalal />} />
              <Route path="pengaturan" element={<Pengaturan />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
