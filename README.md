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

## 🛠️ Technology Stack

- **Frontend**: React 18 with Hooks
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Build Tool**: Create React App

## 📋 Prerequisites

Before using this application, ensure you have:

1. **Azure DevOps Account**: Active Azure DevOps organization and project
2. **Personal Access Token (PAT)**: Token with Work Items (Read & Write) permissions
3. **Modern Browser**: Chrome, Firefox, Safari, or Edge
4. **Node.js**: Version 14 or higher (for development)

## 🔧 Installation

### For Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/azure-tasks-creator.git
   cd azure-tasks-creator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

### For Production Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Serve the build folder**:
   ```bash
   npx serve -s build
   ```

## 🔐 Azure DevOps Setup

### 1. Create Personal Access Token

1. Go to Azure DevOps → User Settings → Personal Access Tokens
2. Click "New Token"
3. Configure with the following permissions:
   - **Work Items**: Read & Write
   - **Project and Team**: Read
4. Copy the generated token (you won't see it again)

### 2. Get Your Organization and Project Details

- **Organization**: Your Azure DevOps organization name
- **Project**: Your project name
- **Sprint URL**: Copy from your sprint board URL

### Supported URL Formats

The application supports various Azure DevOps URL formats:

```
# New dev.azure.com format
https://dev.azure.com/org/project/_sprints/taskboard/team/sprint
https://dev.azure.com/org/project/_sprints/backlog/team/sprint

# Old visualstudio.com format
https://org.visualstudio.com/project/_sprints/backlog/team/project/sprint

# Various sprint naming patterns
- Sprint 1, Sprint 2 (numeric)
- "sprint 2 M.Q2.25" (complex naming)
```

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
3. Review the results in the modal

## 🔧 Configuration

### Azure DevOps Fields

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

## 🚀 Deployment Options

### GitHub Pages

1. **Add homepage to package.json**:
   ```json
   {
     "homepage": "https://yourusername.github.io/azure-tasks-creator"
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

### Netlify

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Drag and drop** the `build` folder to Netlify

### Vercel

1. **Connect your GitHub repository** to Vercel
2. **Deploy automatically** on push to main branch

## 🔒 Security Considerations

- **Personal Access Tokens**: Never commit tokens to version control
- **Environment Variables**: Use `.env` files for sensitive data in development
- **HTTPS**: Always use HTTPS in production
- **Token Permissions**: Use minimal required permissions for PATs

## 🐛 Troubleshooting

### Common Issues

1. **"Failed to fetch user stories"**
   - Check your PAT permissions
   - Verify organization and project names
   - Ensure sprint URL is correct

2. **"Template save failed"**
   - Verify PAT has Work Items permissions
   - Check project name spelling
   - Try local storage as fallback

3. **"No user stories found"**
   - Verify sprint URL format
   - Check if sprint contains user stories
   - Ensure team context is correct

### Debug Mode

Enable console logging by opening browser developer tools (F12) to see detailed API calls and error messages.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Azure DevOps REST API
- React community
- Tailwind CSS team
- Lucide React icons

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Azure DevOps documentation
3. Open an issue on GitHub

---

**Note**: This application is designed for Azure DevOps and requires appropriate permissions to function correctly.
