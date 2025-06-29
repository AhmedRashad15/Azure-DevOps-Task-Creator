# Azure DevOps Tasks Creator

A React web application for efficiently creating multiple tasks as children under user stories within Azure DevOps sprints. This tool streamlines the process of task creation and management for development teams.

## 🚀 Features

### Core Functionality
- **Fetch User Stories**: Automatically retrieve user stories from Azure DevOps sprints
- **Bulk Task Creation**: Create multiple tasks and apply them to all user stories in a sprint
- **Task Templates**: Save and load reusable task templates
- **Cross-Device Sync**: Templates saved to Azure DevOps are accessible from any device
- **Task Management**: Edit, duplicate, and remove tasks with full field support

### Task Management Features
- **Full Task Editing**: Edit all aspects of existing tasks including title, description, assignments, and custom fields
- **Task Duplication**: Create copies of tasks with "(Copy)" suffix for quick iteration
- **Azure DevOps Integration**: Support for all standard Azure DevOps task fields
- **Custom Fields**: Add custom Azure DevOps fields and values
- **Assignment Support**: Assign tasks to team members using email addresses

### Template System
- **Dual Storage**: Save templates locally (browser) or in Azure DevOps (cloud)
- **Template Management**: Load, save, and delete templates
- **Cross-Device Access**: Templates saved to Azure DevOps sync across all devices
- **Template Categories**: Organize templates by project or team

## 📖 Usage Guide

### 1. Configure Azure DevOps Settings
1. Enter your **Personal Access Token**
2. Provide your **Organization Name**
3. Specify your **Project Name**
4. Paste your **Sprint URL**
5. Click "Fetch User Stories"

### 2. Create Tasks
1. **Add Task Details**:
   - Task Title (required)
   - Description (optional)
   - Assigned To (email address)
   - Azure DevOps fields (Priority, Severity, Estimates, etc.)
   - Custom fields (advanced)
2. **Task Management**:
   - **Edit**: Click the blue edit icon (✏️) to modify any task
   - **Duplicate**: Click the green copy icon (📋) to create a copy
   - **Remove**: Click the red trash icon (🗑️) to delete a task

### 3. Save and Load Templates
1. **Save Template**:
   - Create your tasks
   - Click "Save Template"
   - Choose storage mode (Azure or Local)
   - Enter template name
2. **Load Template**:
   - Click "Load Template"
   - Select from your saved templates
   - Modify as needed

### 4. Apply Tasks to User Stories
1. Ensure you have tasks and user stories loaded
2. Click "Apply Tasks to All User Stories"
3. **Review the results** in the modal.

## 🧠 How It Works: The Smart Fetching Logic

The most complex part of this tool is reliably fetching user stories, because different teams in Azure DevOps can have very different project structures. Here's a simple explanation of how we solved it:

The key is that the tool can't just guess the `iterationPath` and `areaPath`. It has to be smart and let Azure DevOps tell us the correct values. The process follows these steps:

1.  **Get Team-Specific Sprints:** First, we get the `teamName` from the URL. We use it to make a targeted API call that asks Azure DevOps, 'Give me the list of sprints that belong to *this specific team*.' This is the most important step and ensures we are always looking in the right place.
2.  **Find the Correct Sprint:** Next, we find the correct sprint in that list, using the name from the URL. This gives us the **official and complete `iterationPath`**, which might be complex like `Leasing\Revamp Iterations\Leasing Revamp Sprint 19`. We don't have to guess anymore.
3.  **Handle the Area Path (The Fallback Logic):** This is the final piece of the puzzle. We know some teams have a valid `Area Path` and some don't.
    *   **Attempt 1:** The tool first tries a query using the specific area path, like `Home Insurance\Home Insurance Team`.
    *   **Attempt 2 (The Fallback):** If that fails with a very specific "Area Path does not exist" error, the tool knows it's a special case. It automatically retries the query *without* the area path filter. This allows it to handle both types of teams without breaking either one.
4.  **Create Tasks Consistently:** Once we have the final list of user stories, we grab the `areaPath` and `iterationPath` from the first story and use those for every single sub-task we create. This ensures all new tasks land in the exact same sprint and team area as the parent story.

This logic makes the application robust enough to handle the different ways our teams are configured in Azure DevOps.

## 🔧 Getting Started (Installation & Setup)

### Prerequisites
Before using this application, ensure you have:
1. **Azure DevOps Account**: Active Azure DevOps organization and project
2. **Personal Access Token (PAT)**: Token with Work Items (Read & Write) permissions
3. **Modern Browser**: Chrome, Firefox, Safari, or Edge
4. **Node.js**: Version 14 or higher (for development)

### Installation for Development
1. **Clone the repository**:
   ```bash
   git clone https://github.com/AhmedRashad15/Azure-DevOps-Task-Creator.git
   cd Azure-DevOps-Task-Creator
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm start
   ```

### Azure DevOps Setup
1. **Create Personal Access Token**:
   - Go to Azure DevOps → User Settings → Personal Access Tokens
   - Click "New Token"
   - Configure with the following permissions:
     - **Work Items**: Read & Write
     - **Project and Team**: Read
   - Copy the generated token (you won't see it again).
2. **Get Your Organization and Project Details**:
   - **Organization**: Your Azure DevOps organization name.
   - **Project**: Your project name.
   - **Sprint URL**: Copy from your sprint board URL.

## 🚀 Deployment Options

### GitHub Pages
1. **Add homepage to package.json**:
   ```json
   {
     "homepage": "https://AhmedRashad15.github.io/Azure-DevOps-Task-Creator"
   }
   ```
2. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```
3. **Add deploy script to package.json**:
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```
4. **Deploy**:
   ```bash
   npm run deploy
   ```

### Other Options (Netlify, Vercel)
- **Build the project**: `npm run build`
- For **Netlify**, drag and drop the `build` folder.
- For **Vercel**, connect your GitHub repository for automatic deployments.

## ⚙️ Advanced Configuration

### Supported URL Formats
The application supports various Azure DevOps URL formats:
```
# New dev.azure.com format
https://dev.azure.com/org/project/_sprints/taskboard/team/sprint
https://dev.azure.com/org/project/_sprints/backlog/team/sprint

# Old visualstudio.com format
https://org.visualstudio.com/project/_sprints/backlog/team/project/sprint
```

### Supported Azure DevOps Fields
The application supports these standard Azure DevOps fields:
- **Priority**: 1, 2, 3, 4
- **Severity**: Critical, High, Medium, Low
- **Original Estimate**: Hours
- **Remaining Work**: Hours
- **Completed Work**: Hours
- **Activity**: Development, Design, Documentation, Testing, Deployment, Requirements
- **Discipline**: Development, Test, User Experience, Database, Requirements
- **Tags**: Custom tags

### Custom Fields
Add any custom Azure DevOps field using the format:
```
Microsoft.VSTS.Common.CustomFieldName
```

## 🛠️ Technology Stack

- **Frontend**: React 18 with Hooks
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Build Tool**: Create React App

## 🔒 Security Considerations

- **Personal Access Tokens**: Never commit tokens to version control. Use `.env` files for sensitive data in development.
- **Token Permissions**: Use the minimal required permissions for PATs.
- **HTTPS**: Always use HTTPS in production.

## 🐛 Troubleshooting

### Common Issues
1. **"Failed to fetch user stories"**: Check your PAT permissions, organization/project names, and sprint URL.
2. **"Template save failed"**: Verify PAT has Work Items (Read & Write) permissions and check project name.
3. **"No user stories found"**: Verify sprint URL format and ensure the sprint contains user stories.

### Debug Mode
Enable console logging by opening browser developer tools (F12) to see detailed API calls and error messages.
