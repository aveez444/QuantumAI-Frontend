import React, { useState } from 'react'; // Add React import
import { FiAlertCircle } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card p-6 flex items-center justify-center bg-red-900/30 text-red-400 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
          <FiAlertCircle className="mr-2" />
          <span>
            Error loading data.{' '}
            <button
              onClick={() => this.setState({ hasError: false })}
              className="underline hover:text-red-300 neon"
            >
              Retry
            </button>
          </span>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;