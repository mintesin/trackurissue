import React, { useState, useEffect } from 'react';
import { companyAPI, teamAPI } from '../../services/api';

const CompanyDashboard = () => {
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    teamId: '',
    isTeamLeader: false
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await companyAPI.getDashboard();
      setTeams(response.data.teams);
      setEmployees(response.data.employees);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await companyAPI.createTeam(newTeam);
      setIsCreateTeamModalOpen(false);
      setNewTeam({ name: '', description: '' });
      fetchDashboardData();
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      await companyAPI.registerEmployee(newEmployee);
      setIsAddEmployeeModalOpen(false);
      setNewEmployee({
        name: '',
        email: '',
        teamId: '',
        isTeamLeader: false
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await companyAPI.deleteTeam(teamId);
        fetchDashboardData();
      } catch (error) {
        console.error('Error deleting team:', error);
      }
    }
  };

  const handleRemoveEmployee = async (employeeId, teamId) => {
    if (window.confirm('Are you sure you want to remove this employee?')) {
      try {
        await companyAPI.removeTeamMember({ employeeId, teamId });
        fetchDashboardData();
      } catch (error) {
        console.error('Error removing employee:', error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Company Dashboard</h1>
        <div className="space-x-4">
          <button
            onClick={() => setIsCreateTeamModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Team
          </button>
          <button
            onClick={() => setIsAddEmployeeModalOpen(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Employee
          </button>
        </div>
      </div>

      {/* Teams Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Teams</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div key={team._id} className="border rounded-lg p-4 shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{team.name}</h3>
                <button
                  onClick={() => handleDeleteTeam(team._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
              <p className="text-gray-600 mb-4">{team.description}</p>
              <div>
                <h4 className="font-medium mb-2">Team Members:</h4>
                <ul className="space-y-2">
                  {team.members?.map((member) => (
                    <li key={member._id} className="flex justify-between items-center">
                      <span>{member.name} {member.isTeamLeader && '(Team Leader)'}</span>
                      <button
                        onClick={() => handleRemoveEmployee(member._id, team._id)}
                        className="text-red-500 text-sm hover:text-red-700"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Team Modal */}
      {isCreateTeamModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Team</h2>
            <form onSubmit={handleCreateTeam}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Team Name</label>
                  <input
                    type="text"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateTeamModalOpen(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddEmployeeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Employee</h2>
            <form onSubmit={handleAddEmployee}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Team</label>
                  <select
                    value={newEmployee.teamId}
                    onChange={(e) => setNewEmployee({ ...newEmployee, teamId: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a team</option>
                    {teams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isTeamLeader"
                    checked={newEmployee.isTeamLeader}
                    onChange={(e) => setNewEmployee({ ...newEmployee, isTeamLeader: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isTeamLeader" className="ml-2 block text-sm text-gray-900">
                    Assign as Team Leader
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddEmployeeModalOpen(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
