# Azure Tasks Creator

A modern web application that allows you to create multiple tasks as children under user stories in Azure DevOps sprints. This tool streamlines the process of adding standardized tasks across all user stories in a sprint.

## Features

- 🔐 **Secure Authentication**: Uses Azure DevOps Personal Access Tokens
- 📋 **Bulk Task Creation**: Create multiple tasks and apply them to all user stories
- 🎯 **Custom Fields Support**: Add custom fields and values to tasks
- 📊 **Real-time Results**: View detailed results of task creation operations
- 🎨 **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- ⚡ **Fast & Efficient**: Optimized API calls and error handling

## Prerequisites

Before using this application, you need:

1. **Azure DevOps Account**: Access to an Azure DevOps organization and project
2. **Personal Access Token (PAT)**: Generate a PAT with Work Items (Read & Write) permissions
3. **Sprint with User Stories**: A sprint containing user stories where you want to add tasks

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Development Server

```bash
npm start
```

The application will open in your browser at `http://localhost:3000`.

## How to Use

### Step 1: Generate a Personal Access Token

1. Go to your Azure DevOps organization
2. Click on your profile picture → **Personal access tokens**
3. Click **New Token**
4. Configure the token:
   - **Name**: Give it a descriptive name (e.g., "Tasks Creator")
   - **Organization**: Select your organization
   - **Expiration**: Choose an appropriate expiration date
   - **Scopes**: Select **Custom defined** and ensure **Work Items (Read & Write)** is enabled
5. Click **Create** and copy the token

### Step 2: Get Your Sprint URL

1. Navigate to your Azure DevOps project
2. Go to **Boards** → **Sprints**
3. Select the sprint you want to work with
4. Copy the URL from your browser's address bar

The URL should look like:
```
https://dev.azure.com/organization/project/_sprints/taskboard/team/sprint
```

### Step 3: Use the Application

1. **Enter your Personal Access Token** in the first field
2. **Paste your Sprint URL** in the second field
3. **Click "Fetch User Stories"** to load all user stories from the sprint
4. **Add Tasks** using the task form:
   - Enter task title (required)
   - Add description (optional)
   - Add custom fields (optional)
5. **Click "Apply Tasks to All User Stories"** to create the tasks

## Custom Fields

You can add custom fields to your tasks by specifying the field name and value. Common Azure DevOps field names include:

- `Microsoft.VSTS.Common.Priority` - Task priority
- `Microsoft.VSTS.Common.Severity` - Task severity
- `Microsoft.VSTS.Scheduling.OriginalEstimate` - Original time estimate
- `Microsoft.VSTS.Scheduling.RemainingWork` - Remaining work
- `System.Tags` - Tags for the task

## API Reference

The application uses the Azure DevOps REST API v7.0. Key endpoints used:

- **Work Item Query Language (WIQL)**: To fetch user stories from a sprint
- **Work Items API**: To get detailed work item information
- **Work Items Creation**: To create new tasks with parent-child relationships

## Error Handling

The application provides comprehensive error handling for:

- Invalid access tokens
- Incorrect sprint URLs
- Network connectivity issues
- API permission errors
- Invalid field names or values

## Security Notes

- **Never share your Personal Access Token**
- **Use tokens with minimal required permissions**
- **Set appropriate expiration dates for tokens**
- **The application runs entirely in your browser** - no data is sent to external servers

## Troubleshooting

### Common Issues

1. **"Failed to fetch user stories"**
   - Check your Personal Access Token permissions
   - Verify the sprint URL is correct
   - Ensure the sprint contains user stories

2. **"No user stories found"**
   - Confirm the sprint URL points to a sprint with user stories
   - Check that user stories are assigned to the sprint

3. **"Failed to create task"**
   - Verify your PAT has Write permissions for Work Items
   - Check custom field names are valid for your Azure DevOps process

### Getting Help

If you encounter issues:

1. Check the browser's developer console for detailed error messages
2. Verify your Azure DevOps permissions
3. Test with a simple task first (no custom fields)

## Development

### Project Structure

```
src/
├── components/          # React components
│   ├── TaskForm.js     # Task creation form
│   ├── UserStoriesList.js # User stories display
│   └── ResultsModal.js # Results modal
├── services/           # API services
│   └── azureDevOps.js  # Azure DevOps API integration
├── App.js             # Main application component
└── index.js           # Application entry point
```

### Technologies Used

- **React 18**: Modern React with hooks
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API calls
- **Lucide React**: Icon library

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 