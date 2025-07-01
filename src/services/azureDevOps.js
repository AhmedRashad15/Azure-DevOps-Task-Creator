import axios from 'axios';

class AzureDevOpsService {
  constructor(accessToken, organization, project) {
    this.accessToken = accessToken;
    this.organization = organization;
    this.project = project;
    
    // Handle both old visualstudio.com and new dev.azure.com formats
    // Check if organization contains the full domain
    if (organization.includes('visualstudio.com')) {
      // Old format: organization is the full domain like "tameeni.visualstudio.com"
      this.baseURL = `https://${organization}/${project}`;
    } else {
      // New format: organization is just the org name
      this.baseURL = `https://dev.azure.com/${organization}/${project}`;
    }
    
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Basic ${btoa(`:${accessToken}`)}`,
        'Content-Type': 'application/json',
      }
    });
  }

  // Extract sprint name from URL
  static extractSprintName(sprintUrl) {
    try {
      const url = new URL(sprintUrl);
      const pathParts = url.pathname.split('/').filter(part => part.length > 0).map(decodeURIComponent);

      const backlogIndex = pathParts.findIndex(part => part.toLowerCase() === 'backlog');
      const taskboardIndex = pathParts.findIndex(part => part.toLowerCase() === 'taskboard');
      
      let teamName = null;
      // The team name should be the item directly after 'backlog' or 'taskboard'.
      const teamIndex = Math.max(backlogIndex, taskboardIndex);
      if (teamIndex !== -1 && pathParts.length > teamIndex + 1) {
          teamName = pathParts[teamIndex + 1];
      }

      // The sprint name is always the last part of the path.
      const sprintName = pathParts[pathParts.length - 1];

      console.log('DEBUG extractSprintName:', { teamName, sprintName });
        return { sprintName, teamName };
      
    } catch (error) {
      console.error("Error in extractSprintName:", error);
      throw new Error('Invalid URL format. Please provide a valid Azure DevOps sprint URL.');
    }
  }

  // Fetch user stories from a specific sprint
  async getUserStoriesFromSprint(sprintUrl) {
    try {
      // Step 1: Extract sprint and team names.
      const { sprintName, teamName } = AzureDevOpsService.extractSprintName(sprintUrl);
      console.log(`Looking for sprint: "${sprintName}"`, teamName ? `for team: "${teamName}"` : '');
        
      // Step 2: Get the list of iterations specifically for the team, if provided.
      let iterationsResponse;
        if (teamName) {
        const encodedTeamName = encodeURIComponent(teamName);
        const teamIterationsUrl = `/${encodedTeamName}/_apis/work/teamsettings/iterations?api-version=7.0`;
        console.log(`Team found. Using team-specific iterations URL: ${teamIterationsUrl}`);
        iterationsResponse = await this.api.get(teamIterationsUrl);
          } else {
        console.log('No team found. Using project-level iterations URL.');
        iterationsResponse = await this.api.get('/_apis/work/teamsettings/iterations?api-version=7.0');
      }
      
      const allIterations = iterationsResponse.data.value;
      if (!allIterations || allIterations.length === 0) {
        throw new Error('No iterations found for this team or project.');
      }
      console.log('Available iterations for this context:', allIterations.map(i => ({ name: i.name, path: i.path })));

      // Step 3: Find the target iteration using robust matching.
      let targetIteration = null;
      const sprintNameLower = sprintName.trim().toLowerCase();
      targetIteration = allIterations.find(iter => iter.name.trim().toLowerCase() === sprintNameLower);
      if (!targetIteration) {
        const possibleMatches = allIterations.filter(iter => iter.name.toLowerCase().includes(sprintNameLower));
        if (possibleMatches.length === 1) {
          targetIteration = possibleMatches[0];
        } else if (possibleMatches.length > 1) {
          possibleMatches.sort((a, b) => new Date(b.attributes.startDate) - new Date(a.attributes.startDate));
          targetIteration = possibleMatches[0];
        }
      }

      if (!targetIteration) {
        throw new Error(`Sprint "${sprintName}" could not be found in the team's schedule.`);
      }
      const iterationPathForQuery = targetIteration.path;
      console.log(`Successfully matched to iteration path: ${iterationPathForQuery}`);

      // Step 4: Build and execute queries with fallback logic for Area Path.
      let workItemIds = [];
      
      try {
      const areaPath = teamName ? `${this.project}\\${teamName}` : this.project;
        const query = `SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = '${this.project}' AND [System.WorkItemType] = 'User Story' AND [System.IterationPath] = '${iterationPathForQuery}' AND [System.AreaPath] UNDER '${areaPath}' AND [System.State] <> 'Closed' AND [System.State] <> 'Removed' ORDER BY [System.Id]`;
      
        console.log('Attempting query with area path:', query);
        const wiqlResponse = await this.api.post('/_apis/wit/wiql', { query }, { params: { 'api-version': '7.0' } });

        workItemIds = wiqlResponse.data.workItems.map(wi => wi.id);
        console.log(`Query with area path succeeded. Found ${workItemIds.length} items.`);

      } catch (error) {
        // This is the CRITICAL part. We ONLY fall back if the area path itself is invalid.
        if (error.response && error.response.data && error.response.data.message.includes('TF51011')) {
          console.warn(`Area path failed, as expected for some teams. Retrying without area path filter.`);
          
          const fallbackQuery = `SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = '${this.project}' AND [System.WorkItemType] = 'User Story' AND [System.IterationPath] = '${iterationPathForQuery}' AND [System.State] <> 'Closed' AND [System.State] <> 'Removed' ORDER BY [System.Id]`;
          
          console.log('Attempting fallback query:', fallbackQuery);
          const wiqlResponse = await this.api.post('/_apis/wit/wiql', { query: fallbackQuery }, { params: { 'api-version': '7.0' } });
          
          workItemIds = wiqlResponse.data.workItems.map(wi => wi.id);
          console.log(`Fallback query succeeded. Found ${workItemIds.length} items.`);

        } else {
          // Any other error is a real problem and should be thrown.
          throw error;
        }
      }

      if (workItemIds.length === 0) {
        console.log('No user stories found for this sprint.');
        return [];
      }

      // Step 5: Fetch and return full details.
      console.log(`Found ${workItemIds.length} user stories. Fetching details.`);
      return await this.getWorkItemDetails(workItemIds);

    } catch (error) {
      console.error('Error fetching user stories:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      let errorMessage = `Failed to fetch user stories: ${error.message}`;
      if (error.response && error.response.status === 404) {
          errorMessage = "Failed to fetch iterations. This can happen if the Team Name in the URL doesn't match a real team in the project. Please check the team name.";
      }
      throw new Error(errorMessage);
    }
  }

  // Get detailed work item information
  async getWorkItemDetails(workItemIds) {
    try {
      const response = await this.api.get('/_apis/wit/workitems', {
        params: {
          ids: workItemIds.join(','),
          'api-version': '7.0',
          '$expand': 'relations'
        }
      });

      return response.data.value.map(workItem => ({
        id: workItem.id,
        title: workItem.fields['System.Title'],
        state: workItem.fields['System.State'],
        workItemType: workItem.fields['System.WorkItemType'],
        url: workItem.url,
        iterationPath: workItem.fields['System.IterationPath'] || '',
        areaPath: workItem.fields['System.AreaPath'] || ''
      }));
    } catch (error) {
      console.error('Error fetching work item details:', error);
      throw new Error(`Failed to fetch work item details: ${error.message}`);
    }
  }

  // Create a task as a child of a user story
  async createTask(userStoryId, taskData, areaPath = null, iterationPath = null) {
    try {
      // Debug log
      console.log('createTask called with areaPath:', areaPath, 'iterationPath:', iterationPath);
      const taskPayload = [
        {
          op: 'add',
          path: '/fields/System.Title',
          value: taskData.title
        },
        {
          op: 'add',
          path: '/fields/System.Description',
          value: taskData.description || ''
        },
        {
          op: 'add',
          path: '/fields/System.WorkItemType',
          value: 'Task'
        },
        {
          op: 'add',
          path: '/relations/-',
          value: {
            rel: 'System.LinkTypes.Hierarchy-Reverse',
            url: `${this.baseURL}/_apis/wit/workItems/${userStoryId}`
          }
        }
      ];

      // Set area path if provided
      if (areaPath) {
        taskPayload.push({
          op: 'add',
          path: '/fields/System.AreaPath',
          value: areaPath
        });
      }

      // Set iteration path if provided
      if (iterationPath) {
        taskPayload.push({
          op: 'add',
          path: '/fields/System.IterationPath',
          value: iterationPath
        });
      }

      // Set assigned to if provided
      if (taskData.assignedTo && taskData.assignedTo.trim()) {
        taskPayload.push({
          op: 'add',
          path: '/fields/System.AssignedTo',
          value: taskData.assignedTo.trim()
        });
      }

      // Add custom fields
      if (taskData.customFields) {
        Object.entries(taskData.customFields).forEach(([fieldName, fieldValue]) => {
          if (fieldValue !== undefined && fieldValue !== '') {
            taskPayload.push({
              op: 'add',
              path: `/fields/${fieldName}`,
              value: fieldValue
            });
          }
        });
      }

      const response = await this.api.post('/_apis/wit/workitems/$Task', taskPayload, {
        params: {
          'api-version': '7.0'
        },
        headers: {
          'Content-Type': 'application/json-patch+json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error(`Failed to create task: ${error.message}`);
    }
  }

  // Fetch user info by email
  async getUser(email) {
    try {
      const response = await this.api.get(`/../../_apis/identities`, {
        params: {
          searchFilter: 'General',
          filterValue: email,
          'api-version': '7.0'
        }
      });
      if (response.data && response.data.value && response.data.value.length > 0) {
        return response.data.value[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  }

  // Create multiple tasks for all user stories
  async createTasksForAllUserStories(userStories, tasks) {
    const results = [];

    for (const story of userStories) {
      // Defensive: If areaPath or iterationPath is missing, fetch details again
      let areaPath = story.areaPath;
      let iterationPath = story.iterationPath;
      if (!areaPath || !iterationPath) {
        try {
          const details = await this.getWorkItemDetails([story.id]);
          if (details && details.length > 0) {
            areaPath = details[0].areaPath;
            iterationPath = details[0].iterationPath;
          }
        } catch (e) {
          // fallback to original values
        }
      }
      for (const task of tasks) {
        try {
          // Build the patch document for the new task
          const patchDocument = [
            { op: 'add', path: '/fields/System.Title', value: task.title },
            { op: 'add', path: '/fields/System.AreaPath', value: areaPath },
            { op: 'add', path: '/fields/System.IterationPath', value: iterationPath },
            {
              op: 'add',
              path: '/relations/-',
              value: {
                rel: 'System.LinkTypes.Hierarchy-Reverse',
                url: story.url,
                attributes: { comment: 'Parent User Story' },
              },
            },
          ];

          // If a user is assigned, find their identity and add it to the document
          if (task.assignedTo) {
            const user = await this.getUser(task.assignedTo);
            if (user) {
              patchDocument.push({
                op: 'add',
                path: '/fields/System.AssignedTo',
                value: `${user.displayName} <${user.uniqueName}>`,
              });
            } else {
              // Fallback: assign by email directly
              patchDocument.push({
                op: 'add',
                path: '/fields/System.AssignedTo',
                value: task.assignedTo,
              });
            }
          }

          // Add any other custom or standard fields
          if (task.customFields) {
            for (const [key, value] of Object.entries(task.customFields)) {
              patchDocument.push({ op: 'add', path: `/fields/${key}`, value: value });
            }
          }

          // Create the work item (task) using the REST API
          const response = await this.api.post('/_apis/wit/workitems/$Task', patchDocument, {
            params: {
              'api-version': '7.0',
            },
            headers: {
              'Content-Type': 'application/json-patch+json',
            },
          });

          results.push({
            userStoryId: story.id,
            userStoryTitle: story.title,
            taskId: response.data.id,
            taskTitle: task.title,
            status: 'success',
          });
        } catch (error) {
          results.push({
            userStoryId: story.id,
            userStoryTitle: story.title,
            taskTitle: task.title,
            status: 'error',
            error: error.message || 'Failed to create task',
          });
        }
      }
    }
    return results;
  }

  // Save task template to Azure DevOps
  async saveTaskTemplate(templateName, tasks) {
    try {
      // First, try to create as a Task work item (more commonly available)
      const templatePayload = [
        {
          op: 'add',
          path: '/fields/System.Title',
          value: `[TEMPLATE] ${templateName}`
        },
        {
          op: 'add',
          path: '/fields/System.Description',
          value: `Task Template: ${templateName}\n\nThis template contains ${tasks.length} task(s).\nCreated on: ${new Date().toISOString()}\n\nTemplate Data:\n${JSON.stringify({ name: templateName, tasks: tasks, createdAt: new Date().toISOString(), version: '1.0' }, null, 2)}`
        },
        {
          op: 'add',
          path: '/fields/System.WorkItemType',
          value: 'Task'
        },
        {
          op: 'add',
          path: '/fields/System.Tags',
          value: 'TaskTemplate'
        },
        {
          op: 'add',
          path: '/fields/System.AreaPath',
          value: this.project
        },
        {
          op: 'add',
          path: '/fields/System.IterationPath',
          value: this.project
        },
        {
          op: 'add',
          path: '/fields/System.State',
          value: 'New'
        }
      ];

      console.log('Attempting to save template with payload:', templatePayload);

      const response = await this.api.post('/_apis/wit/workitems/$Task', templatePayload, {
        params: {
          'api-version': '7.0'
        },
        headers: {
          'Content-Type': 'application/json-patch+json'
        }
      });

      console.log('Template saved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error saving task template:', error);
      
      // If the first approach fails, try with a simpler payload
      try {
        console.log('Retrying with simplified payload...');
        const simplePayload = [
          {
            op: 'add',
            path: '/fields/System.Title',
            value: `[TEMPLATE] ${templateName}`
          },
          {
            op: 'add',
            path: '/fields/System.Description',
            value: `Task Template: ${templateName}\n\nTemplate Data:\n${JSON.stringify({ name: templateName, tasks: tasks, createdAt: new Date().toISOString() })}`
          },
          {
            op: 'add',
            path: '/fields/System.WorkItemType',
            value: 'Task'
          },
          {
            op: 'add',
            path: '/fields/System.State',
            value: 'New'
          }
        ];

        const retryResponse = await this.api.post('/_apis/wit/workitems/$Task', simplePayload, {
          params: {
            'api-version': '7.0'
          },
          headers: {
            'Content-Type': 'application/json-patch+json'
          }
        });

        console.log('Template saved successfully with retry:', retryResponse.data);
        return retryResponse.data;
      } catch (retryError) {
        console.error('Retry also failed:', retryError);
        throw new Error(`Failed to save task template: ${retryError.message}. Please check your permissions and try again.`);
      }
    }
  }

  // Load task templates from Azure DevOps
  async loadTaskTemplates() {
    try {
      // Query for tasks with TaskTemplate tag
      const query = `SELECT [System.Id], [System.Title], [System.Description] FROM WorkItems WHERE [System.TeamProject] = '${this.project}' AND [System.WorkItemType] = 'Task' AND [System.Tags] CONTAINS 'TaskTemplate' ORDER BY [System.CreatedDate] DESC`;

      console.log('Loading templates with query:', query);

      const response = await this.api.post('/_apis/wit/wiql', {
        query: query
      }, {
        params: {
          'api-version': '7.0'
        }
      });

      console.log('WIQL response:', response.data);

      if (response.data.workItems && response.data.workItems.length > 0) {
        const workItemIds = response.data.workItems.map(wi => wi.id);
        const workItems = await this.getWorkItemDetails(workItemIds);
        
        console.log('Found work items:', workItems);
        
        const templates = [];
        for (const workItem of workItems) {
          try {
            const description = workItem.fields['System.Description'] || '';
            
            // Try to extract template data from description
            const templateDataMatch = description.match(/Template Data:\s*(\{[\s\S]*\})/);
            if (templateDataMatch) {
              const templateData = JSON.parse(templateDataMatch[1]);
              if (templateData.name && templateData.tasks) {
                templates.push({
                  id: workItem.id,
                  name: templateData.name,
                  tasks: templateData.tasks,
                  createdAt: templateData.createdAt,
                  workItemId: workItem.id
                });
              }
            } else {
              // Fallback: try to extract from the title
              const title = workItem.fields['System.Title'] || '';
              if (title.startsWith('[TEMPLATE]')) {
                const templateName = title.replace('[TEMPLATE]', '').trim();
                // Create a basic template structure
                templates.push({
                  id: workItem.id,
                  name: templateName,
                  tasks: [], // Empty tasks array as fallback
                  createdAt: new Date().toISOString(),
                  workItemId: workItem.id
                });
              }
            }
          } catch (parseError) {
            console.warn('Failed to parse template data for work item:', workItem.id, parseError);
          }
        }
        
        console.log('Parsed templates:', templates);
        return templates;
      }
      
      console.log('No templates found');
      return [];
    } catch (error) {
      console.error('Error loading task templates:', error);
      throw new Error(`Failed to load task templates: ${error.message}`);
    }
  }

  // Delete task template from Azure DevOps
  async deleteTaskTemplate(workItemId) {
    try {
      await this.api.delete(`/_apis/wit/workitems/${workItemId}`, {
        params: {
          'api-version': '7.0'
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting task template:', error);
      throw new Error(`Failed to delete task template: ${error.message}`);
    }
  }
}

export default AzureDevOpsService; 