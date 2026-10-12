import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import RouteProtegee from './components/RouteProtegee.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ConnexionPage from './pages/ConnexionPage.jsx';
import InscriptionPage from './pages/InscriptionPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import EnConstructionPage from './pages/EnConstructionPage.jsx';

export default function App() {
  return (
    <Routes>
      {/* Pages publiques */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/connexion" element={<ConnexionPage />} />
      <Route path="/inscription" element={<InscriptionPage />} />

      {/* L'application : réservée aux personnes connectées */}
      <Route path="/app" element={<RouteProtegee />}>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="*" element={<EnConstructionPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}