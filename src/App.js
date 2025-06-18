import React, { useState } from 'react';
import { Key, Link, Play, AlertCircle, Info, Folder, HelpCircle } from 'lucide-react';
import AzureDevOpsService from './services/azureDevOps';
import TaskForm from './components/TaskForm';
import TaskTemplates from './components/TaskTemplates';
import UserStoriesList from './components/UserStoriesList';
import ResultsModal from './components/ResultsModal';

function App() {
  const [accessToken, setAccessToken] = useState('');
  const [organization, setOrganization] = useState('');
  const [project, setProject] = useState('');
  const [sprintUrl, setSprintUrl] = useState('');
  const [userStories, setUserStories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showUrlHelp, setShowUrlHelp] = useState(false);
  const [azureService, setAzureService] = useState(null);
  const [isAzureConnected, setIsAzureConnected] = useState(false);

  const fetchUserStories = async () => {
    if (!accessToken.trim() || !organization.trim() || !project.trim() || !sprintUrl.trim()) {
      setError('Please provide access token, organization, project name, and sprint URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create Azure DevOps service instance
      const azureServiceInstance = new AzureDevOpsService(accessToken, organization, project);
      setAzureService(azureServiceInstance);
      setIsAzureConnected(true);

      // Fetch user stories from the sprint using the full URL
      const stories = await azureServiceInstance.getUserStoriesFromSprint(sprintUrl);
      setUserStories(stories);

      if (stories.length === 0) {
        setError('No user stories found in the specified sprint');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch user stories');
      setUserStories([]);
      setIsAzureConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const createTasks = async () => {
    if (tasks.length === 0) {
      setError('Please add at least one task');
      return;
    }

    if (userStories.length === 0) {
      setError('No user stories available. Please fetch user stories first.');
      return;
    }

    if (!azureService) {
      setError('Azure DevOps service not available. Please fetch user stories first.');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      // Extract team name and sprint name from URL to construct paths
      const { sprintName, teamName } = AzureDevOpsService.extractSprintName(sprintUrl);
      const areaPath = teamName ? `${project}\\${teamName}` : project;
      const iterationPath = `${project}\\${sprintName}`;

      console.log('Creating tasks with paths:');
      console.log('Area path:', areaPath);
      console.log('Iteration path:', iterationPath);

      // Create tasks for all user stories with correct paths
      const results = await azureService.createTasksForAllUserStories(userStories, tasks, areaPath, iterationPath);
      setResults(results);
      setShowResults(true);

      // Clear tasks after successful creation
      if (results.some(r => r.status === 'success')) {
        setTasks([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to create tasks');
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchUserStories();
    }
  };

  const handleRemoveUserStory = (userStoryId) => {
    setUserStories(prevStories => prevStories.filter(story => story.id !== userStoryId));
  };

  const handleTemplateLoaded = (templateName) => {
    // Optional: Show a notification or update UI when template is loaded
    console.log(`Template "${templateName}" loaded successfully`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">Azure Tasks Creator</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-500">
                <Info size={16} className="mr-1" />
                Create tasks as children under user stories
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Configuration and Tasks */}
          <div className="space-y-6">
            {/* Azure Configuration */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Azure DevOps Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Key size={16} className="inline mr-1" />
                    Personal Access Token *
                  </label>
                  <input
                    type="password"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your Azure DevOps Personal Access Token"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Generate a PAT with Work Items (Read & Write) permissions
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your Azure DevOps organization name"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    For new dev.azure.com: organization name (e.g., "mycompany"). For old visualstudio.com: full domain (e.g., "tameeni.visualstudio.com")
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Folder size={16} className="inline mr-1" />
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your Azure DevOps project name"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Your Azure DevOps project name (e.g., "MyProject")
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <Link size={16} className="inline mr-1" />
                      Sprint URL *
                    </label>
                    <button
                      onClick={() => setShowUrlHelp(!showUrlHelp)}
                      className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                    >
                      <HelpCircle size={14} />
                      URL Help
                    </button>
                  </div>
                  <input
                    type="url"
                    value={sprintUrl}
                    onChange={(e) => setSprintUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://dev.azure.com/organization/project/_sprints/taskboard/team/sprint"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Copy the URL from your Azure DevOps sprint board
                  </p>
                  
                  {showUrlHelp && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">Supported URL Formats:</h4>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• <code>https://dev.azure.com/org/project/_sprints/taskboard/team/sprint</code></li>
                        <li>• <code>https://dev.azure.com/org/project/_sprints/backlog/team/sprint</code></li>
                        <li>• <code>https://dev.azure.com/org/project/_sprints/sprint</code></li>
                        <li>• <code>https://org.visualstudio.com/project/_sprints/backlog/team/project/sprint</code></li>
                        <li>• URLs with numeric sprint IDs (e.g., Sprint 1, Sprint 2)</li>
                        <li>• URLs with complex sprint names (e.g., "sprint 2 M.Q2.25")</li>
                      </ul>
                      <p className="text-xs text-blue-600 mt-2">
                        <strong>Tip:</strong> Navigate to your sprint board in Azure DevOps and copy the URL from your browser's address bar.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={fetchUserStories}
                  disabled={loading || !accessToken.trim() || !organization.trim() || !project.trim() || !sprintUrl.trim()}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Fetching User Stories...
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      Fetch User Stories
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center">
                    <AlertCircle size={16} className="text-red-500 mr-2" />
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Task Templates */}
            <TaskTemplates 
              tasks={tasks} 
              setTasks={setTasks} 
              onLoadTemplate={handleTemplateLoaded}
              azureService={azureService}
              isAzureConnected={isAzureConnected}
            />

            {/* Task Form */}
            <TaskForm tasks={tasks} setTasks={setTasks} />

            {/* Apply Button */}
            {userStories.length > 0 && tasks.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <button
                  onClick={createTasks}
                  disabled={isCreating || tasks.length === 0}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-medium"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating Tasks...
                    </>
                  ) : (
                    <>
                      <Play size={20} />
                      Apply Tasks to All User Stories
                    </>
                  )}
                </button>
                <p className="mt-2 text-sm text-gray-600 text-center">
                  This will create {tasks.length} task(s) for each of the {userStories.length} user story(ies)
                </p>
              </div>
            )}
          </div>

          {/* Right Column - User Stories */}
          <div>
            <UserStoriesList 
              userStories={userStories} 
              loading={loading} 
              error={error} 
              onRemoveUserStory={handleRemoveUserStory}
            />
          </div>
        </div>
      </main>

      {/* Results Modal */}
      <ResultsModal 
        isOpen={showResults} 
        onClose={() => setShowResults(false)} 
        results={results} 
      />
    </div>
  );
}

export default App; 