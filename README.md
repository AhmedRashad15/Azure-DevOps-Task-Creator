# Azure DevOps Task Pilot Extension

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/AhmedRashad15/Azure-DevOps-Task-Creator)

## Overview

**Task Pilot** is an Azure DevOps extension that enables teams to efficiently create, manage, and template multiple tasks as children under **user stories and bugs**. Use a **Sprint URL** or **Query URL** to load work items, then bulk-create tasks with full field support directly inside Azure DevOps Boards.

---

## ✨ Features

- **Sprint URL or Query URL** — Fetch user stories from a sprint, or user stories and bugs from a saved Azure DevOps query
- **User stories & bugs** — When using Query URL, both User Stories and Bugs are listed; tasks can be created under either
- Bulk create and assign tasks under user stories or bugs
- Support for all standard and custom Azure DevOps fields (Priority, Severity, Activity, Estimates, etc.)
- Assign tasks to users by email
- Save and load task templates (local or Azure DevOps cloud)
- Robust handling of area/iteration paths for all team/project structures

---

## 🛠️ Installation

### From Azure Marketplace

1. Go to [Task Pilot: Automated Task Creator on Azure Marketplace](https://marketplace.visualstudio.com/items?itemName=AhmedRashad.task-pilot-custom)
2. Click **Get it free** and install it to your Azure DevOps organization.
3. In your project, go to **Boards** → **Task Pilot** in the hub list.

### Install in your organization (upload VSIX)

1. [Package the extension](#-package-extension-for-azure-upload) (see below) to get the `.vsix` file.
2. In Azure DevOps: **Organization settings** → **Extensions** → **Manage extensions** → **Upload extension**.
3. Select the `.vsix` file (e.g. `AhmedRashad.task-pilot-custom-3.0.16.vsix`) and complete the install.

---

## 🚀 Usage

1. **Configure Azure DevOps**
   - Enter your **Personal Access Token (PAT)** (Work Items: Read & Write, Queries: Read).
   - Enter **Organization** and **Project**.
   - Provide either a **Sprint URL** (user stories only) or a **Query URL** (user stories and bugs from a saved query).
2. **Fetch work items**
   - Click **Fetch User Stories**. The list shows **User Stories & Bugs** when using a Query URL.
3. **Create tasks**
   - Add task details (title, description, assigned to, custom fields).
   - Use templates if needed, then click **Apply Tasks to Selected Items**.
4. **Review results** in the modal (success/error per task).

---

## 📦 Package extension for Azure upload

Build and create the `.vsix` file for uploading to your org or the marketplace:

```bash
# Install dependencies
npm install

# Build the web app and create the VSIX (version in vss-extension.json is auto-incremented)
npm run package
```

Output: `AhmedRashad.task-pilot-custom-<version>.vsix` in the project root.

**Upload to Azure DevOps**

- **Your organization:** **Organization settings** → **Extensions** → **Upload extension** → choose the `.vsix` file.
- **Marketplace (public):** [Visual Studio Marketplace – Azure DevOps](https://marketplace.visualstudio.com/azuredevops) → **Publish extension** → upload the `.vsix` and complete the listing.

To rebuild and repackage later, run `npm run package` again (version bumps automatically).

---

## 🌐 Deploy on GitHub

### Push code to GitHub

```bash
# If you haven't already, add the remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Commit and push
git add .
git commit -m "Your commit message"
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub username and repository name. Use `master` instead of `main` if that’s your default branch.

### Deploy app to GitHub Pages (optional)

To host the built app on GitHub Pages:

1. In `package.json`, set `"homepage": "https://YOUR_USERNAME.github.io/YOUR_REPO"`.
2. Install and use `gh-pages`:
   ```bash
   npm install --save-dev gh-pages
   ```
   Add (or restore) a script: `"deploy": "gh-pages -d build"`.
3. Build and deploy:
   ```bash
   npm run build
   npm run deploy
   ```
4. In the repo on GitHub: **Settings** → **Pages** → Source: **Deploy from a branch** → Branch: `gh-pages` → Save.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repo and submit a pull request.

---

## 📚 Documentation & Support

- [GitHub repository](https://github.com/AhmedRashad15/Azure-DevOps-Task-Creator)
- For help, open an issue or contact the maintainer

---

© 2025 Ahmed Rashad. All rights reserved.
