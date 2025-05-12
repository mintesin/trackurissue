import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectRole } from './store/slices/authSlice';

// Layout Components
import Header from './components/Common/Header';
import Footer from './components/Common/Footer';

// Auth Components
import Login from './components/Auth/Login';
import CompanyRegister from './components/Auth/CompanyRegister';
import ResetPassword from './components/Auth/ResetPassword';

// Dashboard Components
import CompanyDashboard from './components/Admin/CompanyDashboard';
import TeamDashboard from './components/Dashboard/TeamDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectRole);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<CompanyRegister />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected Company Routes */}
              <Route
                path="/company-dashboard/*"
                element={
                  <ProtectedRoute allowedRoles={['company']}>
                    <CompanyDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Team Routes */}
              <Route
                path="/team-dashboard/*"
                element={
                  <ProtectedRoute allowedRoles={['company', 'teamLeader', 'employee']}>
                    <TeamDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Default Route */}
              <Route
                path="/"
                element={
                  <Navigate
                    to="/team-dashboard"
                    replace
                  />
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
