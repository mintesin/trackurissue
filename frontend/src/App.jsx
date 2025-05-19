import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import IssueDetails from './components/Admin/components/IssueDetails';
import AssignIssue from './components/Admin/components/AssignIssue';
import EditIssue from './components/Admin/components/EditIssue';
import EmployeeProfile from './components/Employee/EmployeeProfile';
import CompanyProfile from './components/Admin/components/CompanyProfile';

// Layout Components
import Navigation from './components/Common/Navigation';
import Footer from './components/Common/Footer';

// Auth Components
import Login from './components/Auth/Login';
import CompanyRegister from './components/Auth/CompanyRegister';
import ResetPassword from './components/Auth/ResetPassword';

// Dashboard Components
import CompanyDashboard from './components/Admin/CompanyDashboard';
import TeamDashboard from './components/Dashboard/TeamDashboard';

// Wrapper component for Profile to handle URL parameters
const ProfileWrapper = () => {
  const { id } = useParams();
  const userRole = useSelector(state => state.auth.role);
  
  if (userRole === 'company') {
    return <CompanyProfile companyId={id} />;
  }
  return <EmployeeProfile employeeId={id} />;
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const userRole = useSelector(state => state.auth.role);

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
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const userRole = useSelector(state => state.auth.role);

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
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
                  <Route path="issues/:issueId" element={<IssueDetails />} />
                  <Route path="issues/:issueId/assign" element={<AssignIssue />} />
                  <Route path="issues/:issueId/edit" element={<EditIssue />} />
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

          {/* Profile Route - Accessible to all authenticated users */}
          <Route
            path="/profile/:id"
            element={
              <ProtectedRoute allowedRoles={['company', 'employee', 'teamLeader']}>
                <ProfileWrapper />
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
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
