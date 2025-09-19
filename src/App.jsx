// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import BusinessDashboard from './pages/BusinessDashboard ';
import Products from './pages/Products';
import Movements from './pages/Movements';
import Warehouses from './pages/Warehouses ';
import Parties from './pages/Parties';
import InventoryValuation from './pages/InventoryValuation';
import ReorderSuggestions from './pages/ReorderSuggestions';
import WorkOrders from './pages/WorkOrders';
import ProductionEntries from './pages/ProductionEntries';
import Employees from './pages/Employees';
import EquipmentManagement from './pages/EquipmentManagement';
import GLJournals from './pages/GLJournals';
import CostCenters from './pages/CostCenters';
import FinancialReports from './pages/FinancialReports';
import ProductionAnalytics from './pages/ProductionAnalytics';
import AIAssistant from './pages/AIAssistant';
import HomePage from './pages/HomePage';
import RequestSubscription from './pages/RequestSubscription';
import Solutions from './pages/SolutionsPage';
import AboutUs from './pages/AboutUs';
import FeaturesPage from './pages/FeaturesPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/request-subscription" element={<RequestSubscription />} />
        <Route path="/dashboard" element={<BusinessDashboard />} />
        <Route path="/inventory/products" element={<Products />} />
        <Route path="/inventory/movements" element={<Movements />} />
        <Route path="/inventory/warehouses" element={<Warehouses />} />
        <Route path="/inventory/parties" element={<Parties />} />
        <Route path="/inventory/valuation" element={<InventoryValuation />} />
        <Route path="/inventory/reorder-suggestions" element={<ReorderSuggestions />} />

        <Route path="/production/work-orders" element={<WorkOrders />} />
        <Route path="/production/entries" element={<ProductionEntries />} />
        <Route path="/production/employees" element={<Employees />} />
        <Route path="/production/equipment" element={<EquipmentManagement />} />
        <Route path="/production/analysis" element={<ProductionAnalytics />} />

        <Route path="/finance/journals" element={<GLJournals />} />
        <Route path="/finance/cost-centers" element={<CostCenters />} />
        <Route path="/finance/reports" element={<FinancialReports />} />

        <Route path="/ai/query" element={<AIAssistant />} />

       
        {/* Add more routes later, e.g., <Route path="/dashboard" element={<Dashboard />} /> */}
      </Routes>
    </Router>
  );
}

export default App;