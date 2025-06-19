import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import api from '../../services/api';

const KanbanBoard = ({ teamId }) => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const columns = [
        { id: 'backlog', title: 'Backlog', color: 'bg-gray-100' },
        { id: 'todo', title: 'To Do', color: 'bg-blue-100' },
        { id: 'inProgress', title: 'In Progress', color: 'bg-yellow-100' },
        { id: 'review', title: 'Review', color: 'bg-purple-100' },
        { id: 'done', title: 'Done', color: 'bg-green-100' }
    ];

    useEffect(() => {
        fetchIssues();
    }, [teamId]);

    const fetchIssues = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/team/${teamId}/issues`);
            setIssues(response.data.data || []);
        } catch (err) {
            setError('Failed to fetch issues');
            console.error('Error fetching issues:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateIssueStatus = async (issueId, newStatus) => {
        try {
            await api.put(`/api/admin/issues/${issueId}`, {
                kanbanStatus: newStatus
            });
        } catch (err) {
            console.error('Error updating issue status:', err);
            // Revert the change if API call fails
            fetchIssues();
        }
    };

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStatus = destination.droppableId;
        const issueId = draggableId;

        // Update local state immediately for better UX
        setIssues(prevIssues =>
            prevIssues.map(issue =>
                issue._id === issueId
                    ? { ...issue, kanbanStatus: newStatus }
                    : issue
            )
        );

        // Update on server
        updateIssueStatus(issueId, newStatus);
    };

    const getIssuesByStatus = (status) => {
        return issues.filter(issue => issue.kanbanStatus === status);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical': return 'border-l-red-500';
            case 'high': return 'border-l-orange-500';
            case 'medium': return 'border-l-yellow-500';
            case 'low': return 'border-l-green-500';
            default: return 'border-l-gray-500';
        }
    };

    const IssueCard = ({ issue, index }) => (
        <Draggable draggableId={issue._id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`bg-white p-3 mb-2 rounded-lg shadow-sm border-l-4 ${getPriorityColor(issue.priority)} ${
                        snapshot.isDragging ? 'shadow-lg' : ''
                    }`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                            {issue.topic}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                            issue.urgency === 'urgent' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-gray-100 text-gray-800'
                        }`}>
                            {issue.urgency}
                        </span>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {issue.description}
                    </p>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>#{issue._id.slice(-6)}</span>
                        {issue.storyPoints > 0 && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {issue.storyPoints} pts
                            </span>
                        )}
                    </div>
                    
                    {issue.labels && issue.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {issue.labels.map((label, idx) => (
                                <span
                                    key={idx}
                                    className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded"
                                >
                                    {label}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{error}</p>
                <button
                    onClick={fetchIssues}
                    className="mt-2 text-red-600 hover:text-red-800 underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Kanban Board</h2>
                <p className="text-sm text-gray-600">Drag and drop issues to update their status</p>
            </div>
            
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {columns.map(column => (
                            <div key={column.id} className={`${column.color} rounded-lg p-3`}>
                                <h3 className="font-medium text-gray-900 mb-3 text-center">
                                    {column.title}
                                    <span className="ml-2 bg-white text-gray-600 px-2 py-1 rounded-full text-xs">
                                        {getIssuesByStatus(column.id).length}
                                    </span>
                                </h3>
                                
                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`min-h-[200px] ${
                                                snapshot.isDraggingOver ? 'bg-blue-50' : ''
                                            }`}
                                        >
                                            {getIssuesByStatus(column.id).map((issue, index) => (
                                                <IssueCard
                                                    key={issue._id}
                                                    issue={issue}
                                                    index={index}
                                                />
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </div>
            </DragDropContext>
        </div>
    );
};

export default KanbanBoard;
