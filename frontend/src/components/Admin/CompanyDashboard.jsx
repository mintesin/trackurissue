import React, { useState, useEffect } from 'react';
import { companyAPI } from '../../services/api';
import MessageDisplay from './components/MessageDisplay';
import DashboardHeader from './components/DashboardHeader';
import TeamsGrid from './components/TeamsGrid';
import EmployeesGrid from './components/EmployeesGrid';
import CreateTeamModal from './components/CreateTeamModal';
import AddEmployeeModal from './components/AddEmployeeModal';
import CreateIssueModal from './components/CreateIssueModal';
import CreatedIssuesGrid from './components/CreatedIssuesGrid';

const CompanyDashboard = () => {
  // Main data states
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [issues, setIssues] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showTeams, setShowTeams] = useState(true);
  
  // Modal visibility states
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isCreateIssueModalOpen, setIsCreateIssueModalOpen] = useState(false);

  // Function to show error message
  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 10000);
  };

  // Function to show success message
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 5000); // Reduced timeout to 5 seconds for better UX
  };

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await companyAPI.getDashboard();
      console.log('Dashboard response:', response.data);
      
      const transformedTeams = response.data.teams.map(team => ({
        ...team,
        members: team.members?.map(member => ({
          ...member,
          isTeamLeader: member.authorization === 'teamleader'
        })) || []
      }));
      
      console.log('Available employees:', response.data.employees);
      
      setTeams(transformedTeams);
      setEmployees(response.data.employees);
      setIssues(response.data.issues);
      showSuccess('Dashboard data updated successfully');
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      showError(error.message || 'Error fetching dashboard data');
    }
  };

  const handleCreateTeam = async (newTeam) => {
    try {
      console.log('Received team data from modal:', newTeam);
      
      if (!newTeam.teamLeaders || newTeam.teamLeaders.length === 0) {
        showError('Please select at least one team leader');
        return;
      }

      if (!newTeam.teamName?.trim()) {
        showError('Team name is required');
        return;
      }

      const company = JSON.parse(localStorage.getItem('company'));
      if (!company?._id) {
        showError('Company information is missing. Please try logging in again.');
        return;
      }

      const teamData = {
        teamName: newTeam.teamName.trim(),
        description: newTeam.description?.trim() || '',
        teamLeaders: newTeam.teamLeaders,
        company: company._id
      };

      console.log('Submitting team creation with validated data:', teamData);

      await companyAPI.createTeam(teamData);
      setIsCreateTeamModalOpen(false);
      showSuccess('Team created successfully');
      fetchDashboardData();
    } catch (error) {
      showError(error.message || 'Error creating team');
    }
  };

  const handleAddEmployee = async (newEmployee) => {
    try {
      const requiredFields = ['firstName', 'lastName', 'email', 'teamId', 'streetNumber', 'city', 'state', 'zipcode', 'country', 'favoriteWord', 'birthDate'];
      const missingFields = requiredFields.filter(field => !newEmployee[field]);
      
      if (missingFields.length > 0) {
        showError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Map form fields to match backend expectations
      const employeeData = {
        ...newEmployee,
        employeeEmail: newEmployee.email,  // Map email to employeeEmail
        birthDate: newEmployee.birthDate || new Date().toISOString().split('T')[0]  // Ensure birthDate is provided
      };
      
      const response = await companyAPI.registerEmployee(employeeData);
      setIsAddEmployeeModalOpen(false);
      
      console.log('Frontend - Generated Password:', response.data?.generatedPassword);
      
      if (response.data && response.data.generatedPassword) {
        // Show success message with the generated password
        showSuccess(`Employee added successfully! Please securely share these credentials with the employee:
        Email: ${newEmployee.email}
        Password: ${response.data.generatedPassword}
        
        Make sure to save this password as it will only be shown once.`);
      } else {
        showSuccess('Employee added successfully!');
      }
      
      fetchDashboardData();
    } catch (error) {
      showError(error.message || 'Error adding employee');
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await companyAPI.deleteTeam(teamId);
        showSuccess('Team deleted successfully');
        fetchDashboardData();
      } catch (error) {
        showError(error.message || 'Error deleting team');
      }
    }
  };

  const handleDeregisterEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to deregister this employee? This action cannot be undone.')) {
      try {
        await companyAPI.deregisterEmployee(employeeId);
        showSuccess('Employee deregistered successfully');
        fetchDashboardData();
      } catch (error) {
        showError(error.message || 'Error deregistering employee');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <MessageDisplay error={error} successMessage={successMessage} />
        
        <DashboardHeader 
          onCreateTeam={() => {
            setIsCreateTeamModalOpen(true);
            setIsAddEmployeeModalOpen(false);
            setIsCreateIssueModalOpen(false);
          }}
          onAddEmployee={() => {
            setIsAddEmployeeModalOpen(true);
            setIsCreateTeamModalOpen(false);
            setIsCreateIssueModalOpen(false);
          }}
          onCreateIssue={() => {
            setIsCreateIssueModalOpen(true);
            setIsCreateTeamModalOpen(false);
            setIsAddEmployeeModalOpen(false);
          }}
        />

        <div className="flex flex-col md:flex-row gap-8 mt-8">
          {/* Left Section - Issues */}
          <div className="md:w-2/3">
            <CreatedIssuesGrid issues={issues} />
          </div>

          {/* Right Sidebar - Teams/Employees */}
          <div className="md:w-1/3">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setShowTeams(true)}
                  className={`px-4 py-2 rounded ${showTeams ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  Teams
                </button>
                <button
                  onClick={() => setShowTeams(false)}
                  className={`px-4 py-2 rounded ${!showTeams ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  Employees
                </button>
              </div>
              
              {showTeams ? (
                <TeamsGrid 
                  teams={teams}
                  onDeleteTeam={handleDeleteTeam}
                />
              ) : (
                <EmployeesGrid 
                  employees={employees}
                  onDeregisterEmployee={handleDeregisterEmployee}
                />
              )}
            </div>
          </div>
        </div>

        <CreateTeamModal 
          isOpen={isCreateTeamModalOpen}
          onClose={() => setIsCreateTeamModalOpen(false)}
          onSubmit={handleCreateTeam}
          employees={employees} // Show all employees since they can be in multiple teams
        />

        <CreateIssueModal
          isOpen={isCreateIssueModalOpen}
          onClose={() => setIsCreateIssueModalOpen(false)}
          onSubmit={async (newIssue) => {
            try {
              await companyAPI.createIssue(newIssue);
              setIsCreateIssueModalOpen(false);
              setSuccessMessage('Issue created successfully');
              fetchDashboardData();
            } catch (error) {
              setError(error.message || 'Error creating issue');
            }
          }}
        />

        <AddEmployeeModal 
          isOpen={isAddEmployeeModalOpen}
          onClose={() => setIsAddEmployeeModalOpen(false)}
          onSubmit={handleAddEmployee}
          teams={teams}
        />
      </div>
    </div>
  );
};

export default CompanyDashboard;
