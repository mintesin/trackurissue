/**
 * @fileoverview Terms of Service Component
 * 
 * This component displays the application's terms of service, including user responsibilities,
 * acceptable use, limitations, and legal disclaimers.
 */

import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
          
          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing or using TrackurIssue, you agree to be bound by these Terms of Service and all applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. User Responsibilities</h2>
              <p>
                You agree to use the service only for lawful purposes and not to engage in any activity that disrupts or harms the service or other users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Account Security</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Intellectual Property</h2>
              <p>
                All content and software provided by TrackurIssue are the property of the company or its licensors and are protected by intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Limitation of Liability</h2>
              <p>
                TrackurIssue is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Continued use of the service constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Contact Us</h2>
              <p>
                For questions about these Terms, please contact us at{' '}
                <a href="mailto:support@trackurissue.com" className="text-blue-400 hover:text-blue-300">
                  support@trackurissue.com
                </a>
              </p>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-700">
            <p className="text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <Link
              to="/"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
