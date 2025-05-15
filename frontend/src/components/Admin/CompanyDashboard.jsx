import React, { useState, useEffect } from 'react';
import { companyAPI } from '../../services/api';
import MessageDisplay from './components/MessageDisplay';
import DashboardHeader from './components/DashboardHeader';
import TeamsGrid from './components/TeamsGrid';
import EmployeesGrid from './components/EmployeesGrid';
import CreateTeamModal from './components/CreateTeamModal';
import AddEmployeeModal from './components/AddEmployeeModal';
import CreateIssueModal from './components/CreateIssueModal';

const CompanyDashboard = () => {
  // Main data states
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Modal visibility states
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isCreateIssueModalOpen, setIsCreateIssueModalOpen] = useState(false);


  // Function to show error message
  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  // Function to show success message
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await companyAPI.getDashboard();
      // Transform team data to ensure members have isTeamLeader property for future team dashboard use
      const transformedTeams = response.data.teams.map(team => ({
        ...team,
        members: team.members?.map(member => ({
          ...member,
          isTeamLeader: member.authorization === 'teamleader'
        })) || []
      }));
      setTeams(transformedTeams);
      setEmployees(response.data.employees);
      showSuccess('Dashboard data updated successfully');
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      showError(error.message || 'Error fetching dashboard data');
    }
  };

  const handleCreateTeam = async (newTeam) => {
    try {
      await companyAPI.createTeam(newTeam);
      setIsCreateTeamModalOpen(false);
      showSuccess('Team created successfully');
      fetchDashboardData();
    } catch (error) {
      showError(error.message || 'Error creating team');
    }
  };

  const handleAddEmployee = async (newEmployee) => {
    try {
      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'email', 'teamId', 'streetNumber', 'city', 'state', 'zipcode', 'country', 'favoriteWord'];
      const missingFields = requiredFields.filter(field => !newEmployee[field]);
      
      if (missingFields.length > 0) {
        showError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      await companyAPI.registerEmployee(newEmployee);
      setIsAddEmployeeModalOpen(false);
      showSuccess('Employee added successfully');
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TeamsGrid 
          teams={teams}
          onDeleteTeam={handleDeleteTeam}
        />
        <EmployeesGrid 
          employees={employees}
          onDeregisterEmployee={handleDeregisterEmployee}
        />
      </div>

      <CreateTeamModal 
        isOpen={isCreateTeamModalOpen}
        onClose={() => setIsCreateTeamModalOpen(false)}
        onSubmit={handleCreateTeam}
      />

      <CreateIssueModal
        isOpen={isCreateIssueModalOpen}
        onClose={() => setIsCreateIssueModalOpen(false)}
        onSubmit={async (newIssue) => {
          try {
            // Call backend API to create issue
            await companyAPI.createIssue(newIssue);
            setIsCreateIssueModalOpen(false);
            setSuccessMessage('Issue created successfully');
            // Refresh dashboard data or issues list if needed
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
  );
};

export default CompanyDashboard;
