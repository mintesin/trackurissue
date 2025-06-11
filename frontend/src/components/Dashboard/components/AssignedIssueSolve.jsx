import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeAPI } from '../../../services/api';

// Component for solving an assigned issue by an employee
const AssignedIssueSolve = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // assigned issue id from route params

  // State variables for issue details and form fields
  const [issueDetails, setIssueDetails] = useState(null);
  const [description, setDescription] = useState('');
  const [solution, setSolution] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(true); // loading state for fetching issue
  const [submitting, setSubmitting] = useState(false); // submitting state for form
  const [error, setError] = useState(null); // error message
  const [successMessage, setSuccessMessage] = useState(null); // success message

  // Fetch issue details when component mounts or id changes
  useEffect(() => {
    const fetchIssueDetails = async () => {
      try {
        setLoading(true);
        // Fetch issue details from API
        const response = await employeeAPI.getIssueToSolve(id);
        const details = response.data.issueDetails;
        setIssueDetails(details);
        // Pre-fill description if available
        if (details?.issue?.description) {
          setDescription(details.issue.description);
        }
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load issue details');
        setLoading(false);
      }
    };
    fetchIssueDetails();
  }, [id]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading issue details...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  // Show message if no issue details are found
  if (!issueDetails || !issueDetails.issue) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">
          <p>No issue details found</p>
          <p className="text-sm text-gray-400 mt-2">Debug info: {JSON.stringify({ issueDetails }, null, 2)}</p>
        </div>
      </div>
    );
  }

  // Handle form submission for solving the issue
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage(null);
    setError(null);

    try {
      // Call API to submit the solution
      await employeeAPI.solveIssue(id, {
        solution,
        additionalNotes,
        description
      });
      setSuccessMessage('Issue solved successfully.');
      setSubmitting(false);
      // Navigate back to dashboard after successful submission
      setTimeout(() => {
        navigate('/employee/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to solve issue');
      setSubmitting(false);
    }
  };

  // Render the form and issue details
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-3xl mx-auto p-4 bg-gray-800 rounded-md text-white">
        {/* Header and navigation */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Solve Assigned Issue</h2>
          <button
            onClick={() => navigate('/employee/dashboard')}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm"
          >
            Back to Dashboard
          </button>
        </div>
        {/* Issue topic */}
        <div className="mb-4">
          <h3 className="text-xl font-semibold">Issue Topic:</h3>
          <p>{issueDetails?.issue?.topic || 'No topic available'}</p>
        </div>
        {/* Form for solving the issue */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1" htmlFor="description">Description (editable):</label>
            <textarea
              id="description"
              value={description || ''}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full p-2 rounded bg-gray-700 text-white"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1" htmlFor="solution">Solution:</label>
            <textarea
              id="solution"
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              rows={4}
              className="w-full p-2 rounded bg-gray-700 text-white"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1" htmlFor="additionalNotes">Additional Notes:</label>
            <textarea
              id="additionalNotes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={3}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Solve Issue'}
          </button>
        </form>
        {/* Success and error messages */}
        {successMessage && <p className="mt-4 text-green-400">{successMessage}</p>}
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default AssignedIssueSolve;
