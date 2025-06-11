/**
 * @fileoverview Redux Store Configuration
 * 
 * This module configures the Redux store using Redux Toolkit's configureStore.
 * It combines all reducers and sets up the global state management for the application.
 * 
 * Features:
 * - Centralized state management
 * - Redux Toolkit integration for simplified setup
 * - Modular reducer organization
 * - Development tools integration
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

/**
 * Configure and create the Redux store
 * 
 * The store combines all reducers and provides the global state management
 * for the entire application. Redux Toolkit's configureStore automatically
 * includes useful middleware and development tools.
 */
export const store = configureStore({
  reducer: {
    /** Authentication state management */
    auth: authReducer,
    // Add other reducers here as needed
  },
});

export default store;
