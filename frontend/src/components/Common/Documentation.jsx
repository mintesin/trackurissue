import React from 'react';

const Documentation = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Help & Documentation</h1>
        
        <div className="space-y-8">
          {/* Getting Started */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Getting Started</h2>
            <div className="prose max-w-none">
              <p>Issue Tracker is a comprehensive solution for managing teams, tracking issues, and facilitating real-time collaboration.</p>
            </div>
          </section>

          {/* User Roles */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">User Roles</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2 text-gray-200">Company Admin</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Create and manage teams</li>
                  <li>Add and remove employees</li>
                  <li>Assign team leaders</li>
                  <li>Monitor team performance</li>
                  <li>Create and assign issues</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2 text-gray-200">Team Leader</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Manage team members</li>
                  <li>Create and assign issues within the team</li>
                  <li>Monitor team progress</li>
                  <li>Facilitate team communication</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2 text-gray-200">Employee</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>View assigned issues</li>
                  <li>Update issue status</li>
                  <li>Participate in team chat</li>
                  <li>Submit issue solutions</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Features */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-medium mb-2 text-gray-200">Issue Management</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Create and assign issues</li>
                  <li>Track issue status and progress</li>
                  <li>Set priorities and deadlines</li>
                  <li>Attach files and documentation</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2 text-gray-200">Team Collaboration</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Real-time team chat</li>
                  <li>File sharing</li>
                  <li>Team member status tracking</li>
                  <li>Activity notifications</li>
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2 text-gray-200">How do I create a new team?</h3>
                <p>As a company admin, navigate to the Teams section and click the "Create Team" button. Fill in the team details and add team members.</p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2 text-gray-200">How do I assign an issue?</h3>
                <p>Navigate to the Issues section, create a new issue, and select the team member you want to assign it to. You can also set priority and deadline.</p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2 text-gray-200">How does the chat system work?</h3>
                <p>Each team has its own chat room where members can communicate in real-time. Messages are saved for future reference.</p>
              </div>
            </div>
          </section>

          {/* Support */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Support</h2>
            <p>For additional support or questions not covered in this documentation, please contact our support team:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Email: support@issuetracker.com</li>
              <li>Phone: 1-800-ISSUES</li>
              <li>Hours: Monday - Friday, 9 AM - 5 PM EST</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
