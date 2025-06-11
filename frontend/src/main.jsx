/**
 * @fileoverview Application Entry Point
 * 
 * This is the main entry point for the React application. It sets up the root component
 * with necessary providers and configurations including Redux store and React StrictMode.
 * 
 * Key Features:
 * - React 18 createRoot API for improved performance
 * - Redux Provider for global state management
 * - React StrictMode for development warnings and checks
 * - Global CSS imports for styling
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App';
import './index.css';

/**
 * Initialize and render the React application
 * 
 * Sets up the application with:
 * - React.StrictMode for additional development checks
 * - Redux Provider for state management across the app
 * - Main App component as the root component
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
