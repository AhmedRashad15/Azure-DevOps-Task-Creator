# Azure DevOps Task Pilot Extension

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/AhmedRashad15/Azure-DevOps-Task-Creator)

## Overview

**Task Pilot** is an Azure DevOps extension that enables teams to efficiently create, manage, and template multiple tasks as children under user stories within sprints. It is designed to streamline bulk task creation and management directly inside Azure DevOps Boards.

---

## ✨ Features
- Fetch user stories from any sprint in your Azure DevOps project
- Bulk create and assign tasks under user stories
- Support for all standard and custom Azure DevOps fields (Priority, Severity, Activity, Estimates, etc.)
- Assign tasks to users by email
- Save and load task templates (local or Azure DevOps cloud)
- Robust handling of area/iteration paths for all team/project structures

---

## 🛠️ Installation

1. **Upload the Extension:**
   - Download the latest `.vsix` file from your build or release.
   - Go to your Azure DevOps organization settings > Extensions > Manage extensions > Upload new extension.
   - Select the `.vsix` file and follow the prompts to install.

2. **Access Task Pilot:**
   - In your Azure DevOps project, hover over **Boards** in the sidebar and select **Task Pilot** from the list.

---

## 🚀 Usage

1. **Configure Azure DevOps Settings:**
   - Enter your Personal Access Token (PAT)
   - Provide your Organization Name, Project Name, and Sprint URL
   - Click "Fetch User Stories"
2. **Create Tasks:**
   - Add task details (title, description, assigned to, Azure fields, custom fields)
   - Save and load task templates as needed
   - Click "Apply Tasks to All User Stories" to bulk-create tasks
3. **Review Results:**
   - Success and error details are shown in a modal after task creation

---

## 🤝 Contributing

Contributions are welcome! Please fork the repo and submit a pull request.

---

## 📚 Documentation & Support
- For more details, see the [GitHub repository](https://github.com/AhmedRashad15/Azure-DevOps-Task-Creator)
- For help, open an issue or contact the maintainer

---

© 2025 Ahmed Rashad. All rights reserved.
