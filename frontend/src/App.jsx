import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import RouteProtegee from './components/RouteProtegee.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ConnexionPage from './pages/ConnexionPage.jsx';
import InscriptionPage from './pages/InscriptionPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ClientsPage from './pages/ClientsPage.jsx';
import FacturesPage from './pages/FacturesPage.jsx';
import TresoreriePage from './pages/TresoreriePage.jsx';
import DepensesPage from './pages/DepensesPage.jsx';
import RelancesPage from './pages/RelancesPage.jsx';
import AssistantPage from './pages/AssistantPage.jsx';
import EnConstructionPage from './pages/EnConstructionPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/connexion" element={<ConnexionPage />} />
      <Route path="/inscription" element={<InscriptionPage />} />

      <Route path="/app" element={<RouteProtegee />}>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="factures" element={<FacturesPage />} />
          <Route path="tresorerie" element={<TresoreriePage />} />
          <Route path="depenses" element={<DepensesPage />} />
          <Route path="relances" element={<RelancesPage />} />
          <Route path="assistant" element={<AssistantPage />} />
          <Route path="*" element={<EnConstructionPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}