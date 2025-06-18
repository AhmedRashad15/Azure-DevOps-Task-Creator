import React from 'react';
import { X, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

const ResultsModal = ({ isOpen, onClose, results }) => {
  if (!isOpen) return null;

  const successfulResults = results.filter(r => r.status === 'success');
  const failedResults = results.filter(r => r.status === 'error');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Task Creation Results</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Summary</h3>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle size={16} />
                <span>{successfulResults.length} successful</span>
              </div>
              {failedResults.length > 0 && (
                <div className="flex items-center gap-1 text-red-600">
                  <XCircle size={16} />
                  <span>{failedResults.length} failed</span>
                </div>
              )}
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${
                  result.status === 'success'
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {result.status === 'success' ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : (
                        <XCircle size={16} className="text-red-600" />
                      )}
                      <span className="font-medium text-gray-800">
                        {result.status === 'success' ? 'Task Created' : 'Failed to Create Task'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>User Story:</strong> #{result.userStoryId} - {result.userStoryTitle}</p>
                      <p><strong>Task:</strong> {result.taskTitle}</p>
                      {result.status === 'success' && (
                        <p><strong>Task ID:</strong> #{result.taskId}</p>
                      )}
                      {result.status === 'error' && (
                        <p><strong>Error:</strong> {result.error}</p>
                      )}
                    </div>
                  </div>

                  {result.status === 'success' && result.taskId && (
                    <a
                      href={`https://dev.azure.com/_apis/wit/workItems/${result.taskId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View task in Azure DevOps"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsModal; 