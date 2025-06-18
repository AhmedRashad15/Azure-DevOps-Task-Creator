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
      const pathParts = url.pathname.split('/').filter(part => part.length > 0);
      
      console.log('URL path parts:', pathParts);
      
      // Handle both old visualstudio.com and new dev.azure.com formats
      // For visualstudio.com: /organization/project/_sprints/backlog/team/project/sprint
      // For dev.azure.com: /organization/project/_sprints/backlog/team/sprint
      
      // Extract team name if available - be more careful about the structure
      let teamName = null;
      const backlogIndex = pathParts.findIndex(part => part.toLowerCase() === 'backlog');
      const taskboardIndex = pathParts.findIndex(part => part.toLowerCase() === 'taskboard');
      const sprintIndex = pathParts.findIndex(part => 
        part.toLowerCase().includes('sprint') || 
        part.match(/^sprint\s+\d+/i) ||
        part.match(/sprint.*\d+.*\d+\.\d+/i)
      );
      
      // Find team name between backlog/taskboard and sprint
      if ((backlogIndex !== -1 || taskboardIndex !== -1) && sprintIndex !== -1) {
        const startIndex = Math.max(backlogIndex, taskboardIndex) + 1;
        const endIndex = sprintIndex;
        
        if (startIndex < endIndex) {
          // For old format: /project/_sprints/backlog/team/project/sprint
          // For new format: /project/_sprints/backlog/team/sprint
          const potentialTeamName = decodeURIComponent(pathParts[startIndex]);
          
          // Validate that this looks like a team name (not a project name)
          if (potentialTeamName && 
              !potentialTeamName.toLowerCase().includes('project') &&
              !potentialTeamName.toLowerCase().includes('leasing') &&
              potentialTeamName.length > 0) {
            teamName = potentialTeamName;
            console.log('Extracted team name:', teamName);
          }
        }
      }
      
      // Find the sprint part in the path - look for the last part that could be a sprint
      let sprintName = null;
      
      // Try to find sprint by looking for patterns - start from the end
      for (let i = pathParts.length - 1; i >= 0; i--) {
        const part = decodeURIComponent(pathParts[i]);
        console.log(`Checking part ${i}: "${part}"`);
        
        // Check if this part looks like a sprint name
        if (part.toLowerCase().includes('sprint') || 
            part.match(/^sprint\s+\d+/i) ||
            part.match(/sprint.*\d+.*\d+\.\d+/i) ||
            part.match(/sprint.*\d+.*[MQ]\d+\.\d+/i)) { // For formats like "sprint 2 M.Q2.25"
          sprintName = part;
          console.log('Found sprint pattern in part:', part);
          break;
        }
      }
      
      // If no sprint pattern found, try the last part of the URL
      if (!sprintName && pathParts.length > 0) {
        const lastPart = decodeURIComponent(pathParts[pathParts.length - 1]);
        console.log('Checking last part as fallback:', lastPart);
        // Skip common non-sprint parts
        if (!['backlog', 'taskboard', 'board', 'team', 'leasing'].includes(lastPart.toLowerCase())) {
          sprintName = lastPart;
          console.log('Using last part as sprint name:', lastPart);
        }
      }
      
      if (sprintName) {
        console.log('Extracted sprint name:', sprintName);
        return { sprintName, teamName };
      }
      
      // If still no sprint name found, show all parts for debugging
      console.log('Could not extract sprint name. All URL parts:');
      pathParts.forEach((part, index) => {
        console.log(`${index}: "${part}" -> "${decodeURIComponent(part)}"`);
      });
      
      throw new Error(`Could not extract sprint name from URL. Please ensure you're using a valid Azure DevOps sprint URL.`);
      
    } catch (error) {
      if (error.message.includes('Could not extract sprint name')) {
        throw error;
      }
      throw new Error('Invalid URL format. Please provide a valid Azure DevOps sprint URL.');
    }
  }

  // Fetch user stories from a specific sprint
  async getUserStoriesFromSprint(sprintUrl) {
    try {
      // Extract sprint name from URL
      const { sprintName, teamName } = AzureDevOpsService.extractSprintName(sprintUrl);
      console.log('Looking for sprint:', sprintName);

      // First, get all iterations to find the correct one
      let targetIteration = null;
      
      try {
        const iterationsResponse = await this.api.get('/_apis/work/teamsettings/iterations', {
          params: {
            'api-version': '7.0'
          }
        });
        
        console.log('Available iterations:', iterationsResponse.data.value.map(iter => ({
          name: iter.name,
          path: iter.path
        })));
        
        // Find the iteration that matches our sprint name - be more precise
        const allIterations = iterationsResponse.data.value;
        console.log('Available iterations:', allIterations.map(iter => ({
          name: iter.name,
          path: iter.path
        })));
        
        // First, try to find exact name match within the team context
        if (teamName) {
          // Prioritize iterations that are under the team's area path
          const teamIterations = allIterations.filter(iter => 
            iter.path.toLowerCase().includes(teamName.toLowerCase())
          );
          
          console.log('Team-specific iterations:', teamIterations.map(iter => ({
            name: iter.name,
            path: iter.path
          })));
          
          // Look for exact name match within team iterations
          targetIteration = teamIterations.find(iter => iter.name === sprintName);
          
          if (targetIteration) {
            console.log('Found exact name match in team context:', targetIteration.name, 'Path:', targetIteration.path);
          } else {
            // Look for sprint name in team iterations
            const teamSprintMatches = teamIterations.filter(iter => {
              const pathLower = iter.path.toLowerCase();
              const nameLower = iter.name.toLowerCase();
              const sprintNameLower = sprintName.toLowerCase();
              
              return pathLower.includes(sprintNameLower) || nameLower.includes(sprintNameLower);
            });
            
            if (teamSprintMatches.length > 0) {
              console.log('Found sprint matches in team context:', teamSprintMatches.map(m => ({ name: m.name, path: m.path })));
              // Choose the most specific match (longest path that contains the sprint name)
              targetIteration = teamSprintMatches.reduce((best, current) => {
                if (current.path.length > best.path.length) return current;
                return best;
              });
              console.log('Selected most specific team match:', targetIteration.name, 'Path:', targetIteration.path);
            } else {
              console.log('No sprint matches found in team context. Looking for any iteration under team...');
              // If no sprint name match, just take the first iteration under the team
              if (teamIterations.length > 0) {
                targetIteration = teamIterations[0];
                console.log('Using first team iteration as fallback:', targetIteration.name, 'Path:', targetIteration.path);
              }
            }
          }
        }
        
        // If no team-specific match found, fall back to general matching
        if (!targetIteration) {
          console.log('No team-specific match found, trying general matching...');
          
          // Try to find exact name match
          targetIteration = allIterations.find(iter => iter.name === sprintName);
          
          if (targetIteration) {
            console.log('Found exact name match:', targetIteration.name, 'Path:', targetIteration.path);
          } else {
            // Try to find iteration that contains the sprint name in its path
            const sprintMatches = allIterations.filter(iter => {
              const pathLower = iter.path.toLowerCase();
              const nameLower = iter.name.toLowerCase();
              const sprintNameLower = sprintName.toLowerCase();
              
              // Look for iterations that contain the sprint name
              return pathLower.includes(sprintNameLower) || nameLower.includes(sprintNameLower);
            });
            
            if (sprintMatches.length > 0) {
              console.log('Found sprint matches:', sprintMatches.map(m => ({ name: m.name, path: m.path })));
              // Choose the most specific match (longest path that contains the sprint name)
              targetIteration = sprintMatches.reduce((best, current) => {
                if (current.path.length > best.path.length) return current;
                return best;
              });
              console.log('Selected most specific match:', targetIteration.name, 'Path:', targetIteration.path);
            } else {
              // Try case-insensitive matching
              const caseInsensitiveMatches = allIterations.filter(iter => 
                iter.name.toLowerCase().includes(sprintName.toLowerCase()) ||
                iter.path.toLowerCase().includes(sprintName.toLowerCase())
              );
              
              if (caseInsensitiveMatches.length > 0) {
                console.log('Found case-insensitive matches:', caseInsensitiveMatches.map(m => ({ name: m.name, path: m.path })));
                targetIteration = caseInsensitiveMatches[0];
              } else {
                // Try matching parts of the sprint name
                const sprintParts = sprintName.toLowerCase().split(/\s+/);
                console.log('Sprint name parts:', sprintParts);
                
                const partialMatches = allIterations.filter(iter => {
                  const iterNameLower = iter.name.toLowerCase();
                  const iterPathLower = iter.path.toLowerCase();
                  
                  // Check if any part of the sprint name appears in the iteration
                  return sprintParts.some(part => 
                    part.length > 2 && ( // Only consider parts longer than 2 characters
                      iterNameLower.includes(part) ||
                      iterPathLower.includes(part)
                    )
                  );
                });
                
                if (partialMatches.length > 0) {
                  console.log('Found partial matches:', partialMatches.map(m => ({ name: m.name, path: m.path })));
                  targetIteration = partialMatches[0];
                } else {
                  // Show all available iterations for debugging
                  console.log('No matches found. All available iterations:');
                  allIterations.forEach((iter, index) => {
                    console.log(`${index + 1}. Name: "${iter.name}" | Path: "${iter.path}"`);
                  });
                }
              }
            }
          }
        }
      } catch (iterationsError) {
        console.error('Could not fetch iterations:', iterationsError);
        throw new Error('Could not fetch iterations from Azure DevOps. Please check your permissions.');
      }

      if (!targetIteration) {
        throw new Error(`Sprint "${sprintName}" not found in the project. Please check the sprint name and ensure it exists.`);
      }

      // Validate that the selected iteration is under the team's area path
      if (teamName && !targetIteration.path.toLowerCase().includes(teamName.toLowerCase())) {
        console.warn('Warning: Selected iteration is not under the team area path!');
        console.warn('Team:', teamName);
        console.warn('Selected iteration path:', targetIteration.path);
        
        // Try to find a better match under the team
        const teamIterations = allIterations.filter(iter => 
          iter.path.toLowerCase().includes(teamName.toLowerCase())
        );
        
        if (teamIterations.length > 0) {
          console.log('Found better team iterations, using the first one:', teamIterations[0].name, 'Path:', teamIterations[0].path);
          targetIteration = teamIterations[0];
        }
      }

      // Build the WIQL query with the correct area path and iteration path
      // Construct the paths based on the extracted team name and sprint name
      const areaPath = teamName ? `${this.project}\\${teamName}` : this.project;
      const iterationPath = `${this.project}\\${sprintName}`;
      
      let query = `SELECT [System.Id], [System.Title], [System.State] FROM WorkItems WHERE [System.TeamProject] = '${this.project}' AND [System.WorkItemType] = 'User Story' AND [System.IterationPath] = '${iterationPath}'`;
      
      // Add team filtering if team name is available and valid
      if (teamName && teamName.trim() && 
          !teamName.toLowerCase().includes('project') &&
          !teamName.toLowerCase().includes('leasing') &&
          teamName.length > 0) {
        query += ` AND [System.AreaPath] UNDER '${areaPath}'`;
        console.log('Adding team filter for area path:', areaPath);
      } else {
        console.log('Skipping team filter - team name not available or invalid:', teamName);
      }
      
      query += ` ORDER BY [System.Id]`;
      
      console.log('Using WIQL query:', query);
      console.log('Team context:', teamName);
      console.log('Constructed area path:', areaPath);
      console.log('Constructed iteration path:', iterationPath);
      console.log('Final query:', query);

      // Use POST method for WIQL query
      const response = await this.api.post('/_apis/wit/wiql', {
        query: query
      }, {
        params: {
          'api-version': '7.0'
        }
      });

      if (response.data.workItems && response.data.workItems.length > 0) {
        const workItemIds = response.data.workItems.map(wi => wi.id);
        const workItems = await this.getWorkItemDetails(workItemIds);
        
        console.log(`Found ${workItems.length} user stories in sprint: ${sprintName}`);
        console.log('User stories found:', workItems.map(us => ({ id: us.id, title: us.title, state: us.state, iterationPath: us.iterationPath })));
        return workItems;
      } else {
        // If no results with team filtering, try without team filter
        if (teamName) {
          console.log('No results with team filter, trying without team filter...');
          const fallbackQuery = `SELECT [System.Id], [System.Title], [System.State] FROM WorkItems WHERE [System.TeamProject] = '${this.project}' AND [System.WorkItemType] = 'User Story' AND [System.IterationPath] = '${iterationPath}' ORDER BY [System.Id]`;
          
          console.log('Using fallback WIQL query:', fallbackQuery);
          
          const fallbackResponse = await this.api.post('/_apis/wit/wiql', {
            query: fallbackQuery
          }, {
            params: {
              'api-version': '7.0'
            }
          });
          
          if (fallbackResponse.data.workItems && fallbackResponse.data.workItems.length > 0) {
            const workItemIds = fallbackResponse.data.workItems.map(wi => wi.id);
            const workItems = await this.getWorkItemDetails(workItemIds);
            
            console.log(`Found ${workItems.length} user stories in sprint (without team filter): ${sprintName}`);
            console.log('User stories found:', workItems.map(us => ({ id: us.id, title: us.title, state: us.state, iterationPath: us.iterationPath })));
            return workItems;
          }
        }
        
        // If still no results, try to get all user stories from the project and filter by iteration path
        console.log('Trying to get all user stories and filter by iteration path...');
        const allStoriesQuery = `SELECT [System.Id], [System.Title], [System.State] FROM WorkItems WHERE [System.TeamProject] = '${this.project}' AND [System.WorkItemType] = 'User Story' ORDER BY [System.Id]`;
        
        console.log('Using all stories query:', allStoriesQuery);
        
        const allStoriesResponse = await this.api.post('/_apis/wit/wiql', {
          query: allStoriesQuery
        }, {
          params: {
            'api-version': '7.0'
          }
        });
        
        if (allStoriesResponse.data.workItems && allStoriesResponse.data.workItems.length > 0) {
          const workItemIds = allStoriesResponse.data.workItems.map(wi => wi.id);
          const allWorkItems = await this.getWorkItemDetails(workItemIds);
          
          // Filter by iteration path
          const filteredWorkItems = allWorkItems.filter(wi => 
            wi.iterationPath && wi.iterationPath.includes(iterationPath)
          );
          
          console.log(`Found ${filteredWorkItems.length} user stories in sprint (filtered from all): ${sprintName}`);
          console.log('User stories found:', filteredWorkItems.map(us => ({ id: us.id, title: us.title, state: us.state, iterationPath: us.iterationPath })));
          return filteredWorkItems;
        }
        
        console.log('No user stories found in the specified sprint');
        return [];
      }
    } catch (error) {
      console.error('Error fetching user stories:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      throw new Error(`Failed to fetch user stories: ${error.message}`);
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
        iterationPath: workItem.fields['System.IterationPath'] || ''
      }));
    } catch (error) {
      console.error('Error fetching work item details:', error);
      throw new Error(`Failed to fetch work item details: ${error.message}`);
    }
  }

  // Create a task as a child of a user story
  async createTask(userStoryId, taskData, areaPath = null, iterationPath = null) {
    try {
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

  // Create multiple tasks for all user stories
  async createTasksForAllUserStories(userStories, tasks, areaPath = null, iterationPath = null) {
    const results = [];
    
    for (const userStory of userStories) {
      for (const task of tasks) {
        try {
          const createdTask = await this.createTask(userStory.id, task, areaPath, iterationPath);
          results.push({
            userStoryId: userStory.id,
            userStoryTitle: userStory.title,
            taskId: createdTask.id,
            taskTitle: task.title,
            status: 'success'
          });
        } catch (error) {
          results.push({
            userStoryId: userStory.id,
            userStoryTitle: userStory.title,
            taskTitle: task.title,
            status: 'error',
            error: error.message
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