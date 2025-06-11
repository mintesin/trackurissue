/**
 * @fileoverview Main Application Component
 * 
 * This is the root component of the application that handles routing and authentication.
 * It sets up protected routes for different user roles (company admin, employee, team leader)
 * and manages the overall layout structure with navigation and footer components.
 * 
 * Features:
 * - Role-based route protection
 * - Authentication state management
 * - Centralized routing configuration
 * - Responsive layout structure
 */

import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { loginSuccess } from './store/slices/authSlice';
import IssueDetails from './components/Admin/components/IssueDetails';
import AssignIssue from './components/Admin/components/AssignIssue';
import EditIssue from './components/Admin/components/EditIssue';
import EmployeeProfile from './components/Employee/EmployeeProfile';
import CompanyProfile from './components/Admin/components/CompanyProfile';
import AssignedIssueSolve from './components/Dashboard/components/AssignedIssueSolve';

// Layout Components
import Navigation from './components/Common/Navigation';
import Footer from './components/Common/Footer';

// Auth Components
import Login from './components/Auth/Login';
import CompanyRegister from './components/Auth/CompanyRegister';
import ResetPassword from './components/Auth/ResetPassword';
import Documentation from './components/Common/Documentation';

// Dashboard Components
import CompanyDashboard from './components/Admin/CompanyDashboard';
import TeamDashboard from './components/Dashboard/TeamDashboard';

// Legal Components
import PrivacyPolicy from './components/Common/PrivacyPolicy';
import TermsOfService from './components/Common/TermsOfService';

// Wrapper component for Profile to handle URL parameters
const ProfileWrapper = () => {
  const { id } = useParams();
  const userRole = useSelector(state => state.auth.role);
  const currentUser = useSelector(state => state.auth.user);
  
  console.log('ProfileWrapper - params:', { id, userRole, currentUser });
  
  if (!id) {
    return <Navigate to="/login" replace />;
  }

  if (userRole === 'company') {
    return <CompanyProfile companyId={id} />;
  }

  // For employee profiles, ensure the ID is valid
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-red-900 text-red-200 p-4 rounded-lg">
            Invalid profile ID
          </div>
        </div>
      </div>
    );
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
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

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
                  <Route path="assigned-issues/:id/solve" element={<AssignedIssueSolve />} />
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
  const dispatch = useDispatch();
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const role = localStorage.getItem('role');
    if (token && user && role) {
      dispatch(loginSuccess({
        user: JSON.parse(user),
        token,
        role
      }));
    }
  }, [dispatch]);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
