import React, { useState } from 'react';
import { BarChart3, Calendar, Flag, Kanban } from 'lucide-react';
import KanbanBoard from './KanbanBoard';
import SprintManagement from './SprintManagement';
import MilestoneManagement from './MilestoneManagement';

const ProjectDashboard = ({ teamId, teamName }) => {
    const [activeTab, setActiveTab] = useState('kanban');

    const tabs = [
        { id: 'kanban', label: 'Kanban Board', icon: Kanban },
        { id: 'sprints', label: 'Sprints', icon: Calendar },
        { id: 'milestones', label: 'Milestones', icon: Flag },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'kanban':
                return <KanbanBoard teamId={teamId} />;
            case 'sprints':
                return <SprintManagement teamId={teamId} />;
            case 'milestones':
                return <MilestoneManagement teamId={teamId} />;
            default:
                return <KanbanBoard teamId={teamId} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
                    <p className="text-gray-600">
                        {teamName ? `Managing projects for ${teamName}` : 'Manage your team projects'}
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                                            activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <Icon size={16} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default ProjectDashboard;
