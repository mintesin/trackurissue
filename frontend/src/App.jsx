import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Context/AuthContext';

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
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// App Routes Component
const AppRoutes = () => {
  const { isAuthenticated, userRole } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to={userRole === 'company' ? '/admin/dashboard' : '/employee/dashboard'} replace /> 
                : <Login />
            } 
          />
          <Route path="/register" element={<CompanyRegister />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['company']}>
                <Routes>
                  <Route path="dashboard" element={<CompanyDashboard />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Protected Employee Routes */}
          <Route
            path="/employee/*"
            element={
              <ProtectedRoute allowedRoles={['employee', 'teamLeader']}>
                <Routes>
                  <Route path="dashboard" element={<TeamDashboard />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route
            path="/"
            element={
              <Navigate
                to={isAuthenticated ? 
                  (userRole === 'company' ? '/admin/dashboard' : '/employee/dashboard')
                  : '/login'
                }
                replace
              />
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
