import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { setToastContext } from '../services/errorHandler';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const Toast = ({ toast, onRemove }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/70 dark:border-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/70 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/70 dark:border-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/70 dark:border-blue-800';
    }
  };

  return (
    <div
      className={`${getBackgroundColor()} border rounded-lg p-4 shadow-lg transition-all duration-300 transform ${
        toast.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          {toast.title && (
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {toast.title}
            </h3>
          )}
          <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
            {toast.message}
          </div>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => onRemove(toast.id)}
            className="inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "warning" }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="h-6 w-6 text-blue-500" />;
    }
  };

  const getButtonStyle = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'info':
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {getIcon()}
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {title}
                </h3>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {message}
              </p>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${getButtonStyle()}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'warning',
    onConfirm: null,
    onCancel: null
  });

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: 'info',
      title: '',
      message: '',
      duration: 5000,
      visible: true,
      ...toast
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, visible: false } : toast
    ));
    
    // Remove from DOM after animation
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 300);
  }, []);

  const showToast = useCallback((message, options = {}) => {
    return addToast({ message, ...options });
  }, [addToast]);

  const showSuccess = useCallback((message, options = {}) => {
    return addToast({ message, type: 'success', ...options });
  }, [addToast]);

  const showError = useCallback((message, options = {}) => {
    return addToast({ message, type: 'error', ...options });
  }, [addToast]);

  const showWarning = useCallback((message, options = {}) => {
    return addToast({ message, type: 'warning', ...options });
  }, [addToast]);

  const showInfo = useCallback((message, options = {}) => {
    return addToast({ message, type: 'info', ...options });
  }, [addToast]);

  const showConfirm = useCallback((title, message, options = {}) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        isOpen: true,
        title,
        message,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        type: options.type || 'warning',
        onConfirm: () => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, []);

  const value = {
    addToast,
    removeToast,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm
  };

  // Initialize error handler with toast context
  useEffect(() => {
    setToastContext(value);
  }, [value]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm w-full">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.onCancel}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        type={confirmDialog.type}
      />
    </ToastContext.Provider>
  );
};
