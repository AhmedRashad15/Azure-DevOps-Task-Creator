import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, Plus, X, ChevronDown, Cloud, Database } from 'lucide-react';

const TaskTemplates = ({ tasks, setTasks, onLoadTemplate, azureService, isAzureConnected }) => {
  const [templates, setTemplates] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [loading, setLoading] = useState(false);
  const [storageMode, setStorageMode] = useState('azure'); // 'azure' or 'local'
  const [localTemplates, setLocalTemplates] = useState([]);

  // Load local templates from localStorage on component mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem('azureTaskTemplates');
    if (savedTemplates) {
      setLocalTemplates(JSON.parse(savedTemplates));
    }
  }, []);

  // Save local templates to localStorage whenever localTemplates change
  useEffect(() => {
    localStorage.setItem('azureTaskTemplates', JSON.stringify(localTemplates));
  }, [localTemplates]);

  // Load Azure templates when Azure service is available
  useEffect(() => {
    if (azureService && isAzureConnected) {
      loadAzureTemplates();
    }
  }, [azureService, isAzureConnected]);

  const loadAzureTemplates = async () => {
    if (!azureService) return;
    
    setLoading(true);
    try {
      const azureTemplates = await azureService.loadTaskTemplates();
      setTemplates(azureTemplates);
    } catch (error) {
      console.error('Failed to load Azure templates:', error);
      // Fallback to local templates if Azure fails
      setTemplates(localTemplates);
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    if (!templateName.trim() || tasks.length === 0) return;

    if (storageMode === 'azure' && azureService && isAzureConnected) {
      // Save to Azure DevOps
      setLoading(true);
      try {
        console.log('Saving template to Azure DevOps:', templateName, tasks);
        await azureService.saveTaskTemplate(templateName.trim(), [...tasks]);
        await loadAzureTemplates(); // Reload templates
        setTemplateName('');
        setShowSaveDialog(false);
      } catch (error) {
        console.error('Failed to save to Azure:', error);
        
        // Show more specific error message
        let errorMessage = 'Failed to save template to Azure DevOps. ';
        if (error.message.includes('401')) {
          errorMessage += 'Authentication failed. Please check your Personal Access Token.';
        } else if (error.message.includes('403')) {
          errorMessage += 'Permission denied. Please ensure your PAT has Work Items (Read & Write) permissions.';
        } else if (error.message.includes('404')) {
          errorMessage += 'Project or work item type not found. Please check your project name.';
        } else {
          errorMessage += error.message || 'Please try again.';
        }
        
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      // Save to local storage
      const newTemplate = {
        id: Date.now(),
        name: templateName.trim(),
        tasks: [...tasks],
        createdAt: new Date().toISOString()
      };
      
      setLocalTemplates([...localTemplates, newTemplate]);
      setTemplates([...localTemplates, newTemplate]);
      setTemplateName('');
      setShowSaveDialog(false);
    }
  };

  const loadTemplate = (template) => {
    setTasks([...template.tasks]);
    setShowTemplates(false);
    if (onLoadTemplate) {
      onLoadTemplate(template.name);
    }
  };

  const deleteTemplate = async (templateId, workItemId = null) => {
    if (storageMode === 'azure' && workItemId && azureService && isAzureConnected) {
      // Delete from Azure DevOps
      try {
        await azureService.deleteTaskTemplate(workItemId);
        await loadAzureTemplates(); // Reload templates
      } catch (error) {
        console.error('Failed to delete from Azure:', error);
        alert('Failed to delete template from Azure DevOps. Please try again.');
      }
    } else {
      // Delete from local storage
      const updatedTemplates = localTemplates.filter(t => t.id !== templateId);
      setLocalTemplates(updatedTemplates);
      setTemplates(updatedTemplates);
    }
  };

  const clearAllTemplates = async () => {
    if (window.confirm('Are you sure you want to delete all templates? This action cannot be undone.')) {
      if (storageMode === 'azure' && azureService && isAzureConnected) {
        // Delete all Azure templates
        setLoading(true);
        try {
          for (const template of templates) {
            if (template.workItemId) {
              await azureService.deleteTaskTemplate(template.workItemId);
            }
          }
          setTemplates([]);
        } catch (error) {
          console.error('Failed to clear Azure templates:', error);
          alert('Failed to clear all templates. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        // Clear local templates
        setLocalTemplates([]);
        setTemplates([]);
        localStorage.removeItem('azureTaskTemplates');
      }
    }
  };

  const getCurrentTemplates = () => {
    return storageMode === 'azure' ? templates : localTemplates;
  };

  const currentTemplates = getCurrentTemplates();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Task Templates</h3>
        <div className="flex gap-2">
          {/* Storage Mode Toggle */}
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setStorageMode('azure')}
              className={`px-2 py-1 rounded ${storageMode === 'azure' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
              disabled={!isAzureConnected}
            >
              <Cloud size={12} className="inline mr-1" />
              Azure
            </button>
            <button
              onClick={() => setStorageMode('local')}
              className={`px-2 py-1 rounded ${storageMode === 'local' ? 'bg-gray-100 text-gray-700' : 'text-gray-500'}`}
            >
              <Database size={12} className="inline mr-1" />
              Local
            </button>
          </div>
          
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1"
          >
            <FolderOpen size={14} />
            Load Template
          </button>
          <button
            onClick={() => setShowSaveDialog(true)}
            disabled={tasks.length === 0 || (storageMode === 'azure' && !isAzureConnected)}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <Save size={14} />
            Save Template
          </button>
        </div>
      </div>

      {/* Storage Mode Info */}
      <div className="text-sm text-gray-600 mb-4">
        {storageMode === 'azure' ? (
          <div className="flex items-center gap-2">
            <Cloud size={14} className="text-blue-500" />
            <span>
              {isAzureConnected 
                ? 'Templates saved to Azure DevOps (accessible from any device)' 
                : 'Azure DevOps not connected. Please configure your settings first.'
              }
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Database size={14} className="text-gray-500" />
            <span>Templates saved locally in your browser</span>
          </div>
        )}
      </div>

      {/* Save Template Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Save Task Template</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter template name"
                  autoFocus
                />
              </div>
              <div className="text-sm text-gray-600">
                <p>This will save {tasks.length} task(s) as a reusable template.</p>
                {storageMode === 'azure' ? (
                  <p className="mt-1">Templates will be saved to Azure DevOps and accessible from any device.</p>
                ) : (
                  <p className="mt-1">Templates are stored locally in your browser.</p>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={saveTemplate}
                  disabled={!templateName.trim() || loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Template'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Load Templates Dialog */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Load Task Template</h4>
              <button
                onClick={() => setShowTemplates(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p>Loading templates...</p>
              </div>
            ) : currentTemplates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FolderOpen size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No templates saved yet.</p>
                <p className="text-sm mt-1">Create some tasks and save them as templates to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentTemplates.map((template) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-800">{template.name}</h5>
                        <p className="text-sm text-gray-600">
                          {template.tasks.length} task(s) • Created {new Date(template.createdAt).toLocaleDateString()}
                        </p>
                        {template.workItemId && (
                          <p className="text-xs text-blue-600">Azure DevOps ID: {template.workItemId}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => loadTemplate(template)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteTemplate(template.id, template.workItemId)}
                          className="p-1 text-red-500 hover:text-red-700"
                          title="Delete template"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-3 border-t border-gray-200">
                  <button
                    onClick={clearAllTemplates}
                    className="w-full px-3 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Clear All Templates
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Template Summary */}
      {currentTemplates.length > 0 && (
        <div className="text-sm text-gray-600">
          <p>You have {currentTemplates.length} saved template(s) in {storageMode === 'azure' ? 'Azure DevOps' : 'local storage'}.</p>
        </div>
      )}
    </div>
  );
};

export default TaskTemplates; 