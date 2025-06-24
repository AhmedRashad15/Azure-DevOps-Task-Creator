import React from 'react';
import { FileText, ExternalLink, Trash2 } from 'lucide-react';

const UserStoriesList = ({ userStories, loading, error, onRemoveUserStory, selectedUserStoryIds = [], setSelectedUserStoryIds }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">User Stories</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Loading user stories...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">User Stories</h3>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!userStories || userStories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">User Stories</h3>
        <div className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No user stories found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No user stories were found in the specified sprint.
          </p>
        </div>
      </div>
    );
  }

  // Handle individual checkbox toggle
  const handleCheckboxChange = (id) => {
    if (!setSelectedUserStoryIds) return;
    if (selectedUserStoryIds.includes(id)) {
      setSelectedUserStoryIds(selectedUserStoryIds.filter((sid) => sid !== id));
    } else {
      setSelectedUserStoryIds([...selectedUserStoryIds, id]);
    }
  };

  // Handle select all toggle
  const handleSelectAll = () => {
    if (!setSelectedUserStoryIds) return;
    if (selectedUserStoryIds.length === userStories.length) {
      setSelectedUserStoryIds([]);
    } else {
      setSelectedUserStoryIds(userStories.map((story) => story.id));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        User Stories ({userStories.length})
      </h3>
      {setSelectedUserStoryIds && (
        <div className="mb-2 flex items-center">
          <input
            type="checkbox"
            checked={selectedUserStoryIds.length === userStories.length && userStories.length > 0}
            onChange={handleSelectAll}
            className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            id="select-all-user-stories"
          />
          <label htmlFor="select-all-user-stories" className="text-sm text-gray-700 select-none">
            Select All
          </label>
        </div>
      )}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {userStories.map((userStory) => (
          <div
            key={userStory.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors flex items-start"
          >
            {setSelectedUserStoryIds && (
              <input
                type="checkbox"
                checked={selectedUserStoryIds.includes(userStory.id)}
                onChange={() => handleCheckboxChange(userStory.id)}
                className="mr-4 mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                aria-label={`Select user story #${userStory.id}`}
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  #{userStory.id}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  userStory.state === 'Active' ? 'bg-green-100 text-green-800' :
                  userStory.state === 'New' ? 'bg-yellow-100 text-yellow-800' :
                  userStory.state === 'Resolved' ? 'bg-purple-100 text-purple-800' :
                  userStory.state === 'Closed' ? 'bg-gray-100 text-gray-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {userStory.state}
                </span>
              </div>
              <h4 className="font-medium text-gray-800 mb-1">{userStory.title}</h4>
              <p className="text-sm text-gray-600">Type: {userStory.workItemType}</p>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <a
                href={userStory.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Open in Azure DevOps"
              >
                <ExternalLink size={16} />
              </a>
              {onRemoveUserStory && (
                <button
                  onClick={() => onRemoveUserStory(userStory.id)}
                  className="p-1 text-red-400 hover:text-red-600 transition-colors"
                  title="Remove from list"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserStoriesList; 