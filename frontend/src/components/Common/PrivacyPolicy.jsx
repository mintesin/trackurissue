/**
 * @fileoverview Privacy Policy Component
 * 
 * This component displays the application's privacy policy, including information about
 * data collection, usage, storage, and user rights.
 */

import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
          
          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
              <p className="mb-4">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account information (name, email, company details)</li>
                <li>Profile information (job title, department)</li>
                <li>Communication data through our chat feature</li>
                <li>Issue tracking and management data</li>
                <li>Usage information and activity logs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">We use the collected information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and maintain our services</li>
                <li>Process and manage issue tracking</li>
                <li>Facilitate team communication</li>
                <li>Improve our services and user experience</li>
                <li>Send important notifications and updates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information.
                This includes encryption, secure servers, and regular security assessments.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Data Sharing</h2>
              <p>
                We only share your information with team members within your organization and do not sell or
                share data with third parties except as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to data processing</li>
                <li>Export your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:privacy@trackurissue.com" className="text-blue-400 hover:text-blue-300">
                  privacy@trackurissue.com
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

export default PrivacyPolicy;
