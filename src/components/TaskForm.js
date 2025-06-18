import React, { useState } from 'react';
import { Plus, Trash2, X, ChevronDown, Edit, Copy, Save, ArrowLeft } from 'lucide-react';

// Common Azure DevOps fields with their predefined values
const AZURE_FIELDS = {
  'Microsoft.VSTS.Common.Priority': {
    label: 'Priority',
    type: 'dropdown',
    values: ['1', '2', '3', '4']
  },
  'Microsoft.VSTS.Common.Severity': {
    label: 'Severity',
    type: 'dropdown',
    values: ['1 - Critical', '2 - High', '3 - Medium', '4 - Low']
  },
  'Microsoft.VSTS.Scheduling.OriginalEstimate': {
    label: 'Original Estimate (hours)',
    type: 'number',
    placeholder: 'Enter hours (e.g., 8)'
  },
  'Microsoft.VSTS.Scheduling.RemainingWork': {
    label: 'Remaining Work (hours)',
    type: 'number',
    placeholder: 'Enter hours (e.g., 4)'
  },
  'Microsoft.VSTS.Scheduling.CompletedWork': {
    label: 'Completed Work (hours)',
    type: 'number',
    placeholder: 'Enter hours (e.g., 4)'
  },
  'System.Tags': {
    label: 'Tags',
    type: 'text',
    placeholder: 'Enter tags separated by semicolons'
  },
  'Microsoft.VSTS.Common.Activity': {
    label: 'Activity',
    type: 'dropdown',
    values: ['Development', 'Design', 'Documentation', 'Testing', 'Deployment', 'Requirements']
  },
  'Microsoft.VSTS.Common.Discipline': {
    label: 'Discipline',
    type: 'dropdown',
    values: ['Development', 'Test', 'User Experience', 'Database', 'Requirements']
  }
};

const TaskForm = ({ tasks, setTasks }) => {
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    customFields: {}
  });
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [showFieldSelector, setShowFieldSelector] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingTask, setEditingTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    customFields: {}
  });

  const addTask = () => {
    if (newTask.title.trim()) {
      setTasks([...tasks, { ...newTask }]);
      setNewTask({
        title: '',
        description: '',
        assignedTo: '',
        customFields: {}
      });
    }
  };

  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const duplicateTask = (index) => {
    const taskToDuplicate = tasks[index];
    const duplicatedTask = {
      ...taskToDuplicate,
      title: `${taskToDuplicate.title} (Copy)`
    };
    setTasks([...tasks, duplicatedTask]);
  };

  const startEditing = (index) => {
    const taskToEdit = tasks[index];
    setEditingIndex(index);
    setEditingTask({
      title: taskToEdit.title,
      description: taskToEdit.description || '',
      assignedTo: taskToEdit.assignedTo || '',
      customFields: { ...taskToEdit.customFields }
    });
  };

  const saveEdit = () => {
    if (editingTask.title.trim()) {
      const updatedTasks = [...tasks];
      updatedTasks[editingIndex] = { ...editingTask };
      setTasks(updatedTasks);
      setEditingIndex(null);
      setEditingTask({
        title: '',
        description: '',
        assignedTo: '',
        customFields: {}
      });
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingTask({
      title: '',
      description: '',
      assignedTo: '',
      customFields: {}
    });
  };

  const addCustomField = () => {
    if (newFieldName.trim() && newFieldValue.trim()) {
      setNewTask({
        ...newTask,
        customFields: {
          ...newTask.customFields,
          [newFieldName]: newFieldValue
        }
      });
      setNewFieldName('');
      setNewFieldValue('');
    }
  };

  const addAzureField = () => {
    if (selectedField && newFieldValue.trim()) {
      setNewTask({
        ...newTask,
        customFields: {
          ...newTask.customFields,
          [selectedField]: newFieldValue
        }
      });
      setSelectedField('');
      setNewFieldValue('');
      setShowFieldSelector(false);
    }
  };

  const removeCustomField = (fieldName) => {
    const updatedFields = { ...newTask.customFields };
    delete updatedFields[fieldName];
    setNewTask({
      ...newTask,
      customFields: updatedFields
    });
  };

  // Functions for editing mode
  const addEditingCustomField = () => {
    if (newFieldName.trim() && newFieldValue.trim()) {
      setEditingTask({
        ...editingTask,
        customFields: {
          ...editingTask.customFields,
          [newFieldName]: newFieldValue
        }
      });
      setNewFieldName('');
      setNewFieldValue('');
    }
  };

  const addEditingAzureField = () => {
    if (selectedField && newFieldValue.trim()) {
      setEditingTask({
        ...editingTask,
        customFields: {
          ...editingTask.customFields,
          [selectedField]: newFieldValue
        }
      });
      setSelectedField('');
      setNewFieldValue('');
      setShowFieldSelector(false);
    }
  };

  const removeEditingCustomField = (fieldName) => {
    const updatedFields = { ...editingTask.customFields };
    delete updatedFields[fieldName];
    setEditingTask({
      ...editingTask,
      customFields: updatedFields
    });
  };

  const getFieldDisplayName = (fieldName) => {
    return AZURE_FIELDS[fieldName]?.label || fieldName;
  };

  const getFieldType = (fieldName) => {
    return AZURE_FIELDS[fieldName]?.type || 'text';
  };

  const getFieldPlaceholder = (fieldName) => {
    return AZURE_FIELDS[fieldName]?.placeholder || 'Enter value';
  };

  const getFieldValues = (fieldName) => {
    return AZURE_FIELDS[fieldName]?.values || [];
  };

  // If we're in editing mode, show the edit form
  if (editingIndex !== null) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Edit Task</h3>
          <button
            onClick={cancelEdit}
            className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={16} />
            Cancel Edit
          </button>
        </div>
        
        {/* Edit Task Form */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={editingTask.title}
              onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={editingTask.description}
              onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows="3"
              placeholder="Enter task description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned To (Email)
            </label>
            <input
              type="email"
              value={editingTask.assignedTo}
              onChange={(e) => setEditingTask({ ...editingTask, assignedTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter email address (e.g., user@company.com)"
            />
          </div>

          {/* Azure DevOps Fields for Editing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Azure DevOps Fields
            </label>
            
            {!showFieldSelector ? (
              <button
                onClick={() => setShowFieldSelector(true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-left text-gray-500 flex items-center justify-between"
              >
                <span>Select an Azure DevOps field...</span>
                <ChevronDown size={16} />
              </button>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <select
                    value={selectedField}
                    onChange={(e) => setSelectedField(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select a field...</option>
                    {Object.entries(AZURE_FIELDS).map(([fieldName, field]) => (
                      <option key={fieldName} value={fieldName}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedField && (
                  <div className="space-y-2">
                    {getFieldType(selectedField) === 'dropdown' ? (
                      <select
                        value={newFieldValue}
                        onChange={(e) => setNewFieldValue(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select value...</option>
                        {getFieldValues(selectedField).map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={getFieldType(selectedField)}
                        value={newFieldValue}
                        onChange={(e) => setNewFieldValue(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder={getFieldPlaceholder(selectedField)}
                      />
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={addEditingAzureField}
                        disabled={!newFieldValue.trim()}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Field
                      </button>
                      <button
                        onClick={() => {
                          setShowFieldSelector(false);
                          setSelectedField('');
                          setNewFieldValue('');
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Custom Fields for Editing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Fields (Advanced)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Field name (e.g., Microsoft.VSTS.Common.Priority)"
              />
              <input
                type="text"
                value={newFieldValue}
                onChange={(e) => setNewFieldValue(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Field value"
              />
              <button
                onClick={addEditingCustomField}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Add
              </button>
            </div>
          </div>

          {/* Display editing custom fields */}
          {Object.keys(editingTask.customFields).length > 0 && (
            <div className="space-y-2">
              {Object.entries(editingTask.customFields).map(([fieldName, fieldValue]) => (
                <div key={fieldName} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-600">
                    {getFieldDisplayName(fieldName)}:
                  </span>
                  <span className="text-sm text-gray-800">{fieldValue}</span>
                  <button
                    onClick={() => removeEditingCustomField(fieldName)}
                    className="ml-auto p-1 text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={saveEdit}
              disabled={!editingTask.title.trim()}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save size={16} />
              Save Changes
            </button>
            <button
              onClick={cancelEdit}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Tasks</h3>
      
      {/* Task Input Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Title *
          </label>
          <input
            type="text"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter task title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows="3"
            placeholder="Enter task description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assigned To (Email)
          </label>
          <input
            type="email"
            value={newTask.assignedTo}
            onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter email address (e.g., user@company.com)"
          />
          <p className="mt-1 text-xs text-gray-500">
            Azure DevOps will automatically resolve the email to the correct user
          </p>
        </div>

        {/* Azure DevOps Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Azure DevOps Fields
          </label>
          
          {!showFieldSelector ? (
            <button
              onClick={() => setShowFieldSelector(true)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-left text-gray-500 flex items-center justify-between"
            >
              <span>Select an Azure DevOps field...</span>
              <ChevronDown size={16} />
            </button>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <select
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a field...</option>
                  {Object.entries(AZURE_FIELDS).map(([fieldName, field]) => (
                    <option key={fieldName} value={fieldName}>
                      {field.label}
                    </option>
                  ))}
                </select>
              </div>

              {selectedField && (
                <div className="space-y-2">
                  {getFieldType(selectedField) === 'dropdown' ? (
                    <select
                      value={newFieldValue}
                      onChange={(e) => setNewFieldValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select value...</option>
                      {getFieldValues(selectedField).map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={getFieldType(selectedField)}
                      value={newFieldValue}
                      onChange={(e) => setNewFieldValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={getFieldPlaceholder(selectedField)}
                    />
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={addAzureField}
                      disabled={!newFieldValue.trim()}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Field
                    </button>
                    <button
                      onClick={() => {
                        setShowFieldSelector(false);
                        setSelectedField('');
                        setNewFieldValue('');
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Custom Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Fields (Advanced)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Field name (e.g., Microsoft.VSTS.Common.Priority)"
            />
            <input
              type="text"
              value={newFieldValue}
              onChange={(e) => setNewFieldValue(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Field value"
            />
            <button
              onClick={addCustomField}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Add
            </button>
          </div>
        </div>

        {/* Display custom fields */}
        {Object.keys(newTask.customFields).length > 0 && (
          <div className="space-y-2">
            {Object.entries(newTask.customFields).map(([fieldName, fieldValue]) => (
              <div key={fieldName} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium text-gray-600">
                  {getFieldDisplayName(fieldName)}:
                </span>
                <span className="text-sm text-gray-800">{fieldValue}</span>
                <button
                  onClick={() => removeCustomField(fieldName)}
                  className="ml-auto p-1 text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={addTask}
          disabled={!newTask.title.trim()}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      {/* Display added tasks */}
      {tasks.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">Added Tasks ({tasks.length})</h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {tasks.map((task, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-800">{task.title}</h5>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                    {task.assignedTo && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Assigned to:</span> {task.assignedTo}
                      </p>
                    )}
                    {Object.keys(task.customFields).length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-500 mb-1">Fields:</p>
                        <div className="space-y-1">
                          {Object.entries(task.customFields).map(([fieldName, fieldValue]) => (
                            <div key={fieldName} className="text-xs">
                              <span className="font-medium text-gray-600">
                                {getFieldDisplayName(fieldName)}:
                              </span>
                              <span className="text-gray-800 ml-1">{fieldValue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => startEditing(index)}
                      className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                      title="Edit task"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => duplicateTask(index)}
                      className="p-1 text-green-500 hover:text-green-700 hover:bg-green-50 rounded"
                      title="Duplicate task"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => removeTask(index)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                      title="Remove task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskForm; 