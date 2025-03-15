const issues = [
    {
        topic: "Login Bug",
        description: "Users are unable to log in intermittently due to session issues.",
        assignedAt: new Date('2023-03-13T10:00:00Z'), // You can either use a Date object or an ISO string
        urgency: "urgent",
        team: "60e73b2f5f1b2f001f48893f", // Replace with actual ObjectId of the team
        company: "60e73b2f5f1b2f001f48894f" // Optional: Replace with actual ObjectId of the company
    },
    {
        topic: "API Response Time",
        description: "The response time of the API is slower than expected, causing delays in the app.",
        assignedAt: new Date('2023-03-12T09:00:00Z'),
        urgency: "notUrgent",
        team: "60e73b2f5f1b2f001f48893f", // Same as above
        company: "60e73b2f5f1b2f001f48894f" // Optional
    },
    {
        topic: "Database Connection Error",
        description: "There are frequent errors when trying to connect to the database for user authentication.",
        assignedAt: new Date('2023-03-11T08:30:00Z'),
        urgency: "urgent",
        team: "60e73b2f5f1b2f001f48893f", // Team ID
        // No company ID provided as it's optional
    }
];

// Export the issues array
export default issues;