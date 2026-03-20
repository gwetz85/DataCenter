import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Registrasi from './pages/Registrasi';
import VerifikasiData from './pages/VerifikasiData';
import DataPengajuan from './pages/DataPengajuan';
import ValidasiData from './pages/ValidasiData';
import MonitoringPekerjaan from './pages/MonitoringPekerjaan';
import Finish from './pages/Finish';
import ManajemenPengguna from './pages/ManajemenPengguna';
import Pengaturan from './pages/Pengaturan';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="registrasi" element={<Registrasi />} />
          <Route path="verifikasi-data" element={<VerifikasiData />} />
          <Route path="data-pengajuan" element={<DataPengajuan />} />
          <Route path="validasi-data" element={<ValidasiData />} />
          <Route path="monitoring-pekerjaan" element={<MonitoringPekerjaan />} />
          <Route path="finish" element={<Finish />} />
          <Route path="manajemen-pengguna" element={<ManajemenPengguna />} />
          <Route path="pengaturan" element={<Pengaturan />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
