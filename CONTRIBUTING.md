# Contributing to Logify

First off, thank you for considering contributing to Logify! It is people like you that make Logify such a great tool. This document provides guidelines and information about contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to **security@logify.dev**.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20.x
- [npm](https://www.npmjs.com/) >= 10.x (or [pnpm](https://pnpm.io/) >= 9.x)
- [Git](https://git-scm.com/)
- A code editor (we recommend [VS Code](https://code.visualstudio.com/) with the [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension)

### First-Time Contributors

If this is your first time contributing to open source, welcome! Here are some resources to get you started:

- [How to Contribute to Open Source](https://opensource.guide/how-to-contribute/)
- [First Timers Only](https://www.firsttimersonly.com/)

Look for issues tagged with [`good first issue`](../../labels/good%20first%20issue) -- these are specifically curated for newcomers.

## Development Setup

1. **Fork the repository** on GitHub.

2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/<your-username>/logify.git
   cd logify
   ```

3. **Add the upstream remote:**

   ```bash
   git remote add upstream https://github.com/logify/logify.git
   ```

4. **Install dependencies:**

   ```bash
   npm install
   ```

5. **Start the development server:**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`.

6. **Verify the setup** by opening the URL in your browser and confirming the app loads correctly.

## Project Structure

Logify follows the standard [Nuxt 4 directory structure](https://nuxt.com/docs/guide/directory-structure):

```
logify/
├── app/                  # Application source code
│   ├── assets/           # Stylesheets, fonts, images
│   ├── components/       # Vue components
│   ├── composables/      # Vue composables (shared reactive logic)
│   ├── layouts/          # Application layouts
│   ├── middleware/        # Route middleware
│   ├── pages/            # File-based routing pages
│   ├── plugins/          # Nuxt plugins
│   └── utils/            # Utility functions
├── public/               # Static assets served at root
├── server/               # Server-side code (API routes, middleware)
│   ├── api/              # API endpoints
│   ├── middleware/        # Server middleware
│   └── utils/            # Server utility functions
├── nuxt.config.ts        # Nuxt configuration
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Development Workflow

1. **Create a branch** from `main` for your work:

   ```bash
   git checkout -b feat/my-new-feature
   ```

   Use a descriptive branch name with a prefix:
   - `feat/` for new features
   - `fix/` for bug fixes
   - `docs/` for documentation changes
   - `refactor/` for refactoring
   - `test/` for adding or updating tests
   - `chore/` for maintenance tasks

2. **Make your changes.** Write code, add tests, update documentation as needed.

3. **Run the linter and fix any issues:**

   ```bash
   npm run lint
   ```

4. **Run the tests:**

   ```bash
   npm run test
   ```

5. **Commit your changes** following our [commit message conventions](#commit-messages).

6. **Push your branch** to your fork:

   ```bash
   git push origin feat/my-new-feature
   ```

7. **Open a Pull Request** against the `main` branch of the upstream repository.

## Coding Standards

### General

- Write code in **TypeScript** wherever possible.
- Follow the existing code style in the project.
- Keep functions small and focused on a single responsibility.
- Add JSDoc comments for public APIs and complex logic.

### Vue / Nuxt Specifics

- Use the **Composition API** with `<script setup lang="ts">` for all components.
- Use **auto-imports** -- Nuxt auto-imports Vue APIs, composables, and utilities. Do not manually import `ref`, `computed`, `useState`, etc.
- Place reusable logic in `composables/` using the `use` prefix (e.g., `useLogger`).
- Use Nuxt's file-based routing; do not configure routes manually.
- Prefer `$fetch` or `useFetch` for data fetching over raw `fetch`.
- Keep components small and composable. Extract shared UI into `components/`.

### Styling

- Use scoped styles in Vue single-file components (`<style scoped>`).
- Follow a consistent naming convention for CSS classes.

### TypeScript

- Enable strict mode; avoid using `any`.
- Define explicit types for props, emits, and composable return values.
- Place shared type definitions in a `types/` directory.

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. Each commit message should be structured as:

```
<type>(<scope>): <short summary>

<optional body>

<optional footer>
```

### Types

| Type       | Description                                      |
| ---------- | ------------------------------------------------ |
| `feat`     | A new feature                                    |
| `fix`      | A bug fix                                        |
| `docs`     | Documentation changes only                       |
| `style`    | Code style changes (formatting, no logic change) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf`     | A code change that improves performance          |
| `test`     | Adding or correcting tests                       |
| `build`    | Changes to the build system or dependencies      |
| `ci`       | Changes to CI configuration                      |
| `chore`    | Other changes that don't modify src or test      |

### Examples

```
feat(dashboard): add real-time log streaming widget
fix(api): handle empty log entries gracefully
docs(readme): update installation instructions
refactor(server): extract log parser into separate module
```

## Pull Requests

### Before Submitting

- Make sure your branch is up to date with `main`:

  ```bash
  git fetch upstream
  git rebase upstream/main
  ```

- Ensure all tests pass and there are no linting errors.
- If you added a new feature, include tests and update relevant documentation.
- Fill out the pull request template completely.

### PR Guidelines

- **Keep PRs focused.** One PR should address one concern. If you find an unrelated issue, open a separate PR.
- **Write a clear description.** Explain *what* you changed and *why*.
- **Include screenshots or recordings** for UI changes.
- **Reference related issues** using `Closes #123` or `Fixes #456`.
- **Be responsive to review feedback.** We aim to review PRs within a few days.

### Review Process

1. At least one maintainer must approve the PR before it can be merged.
2. CI checks must pass (linting, tests, build).
3. The PR branch must be up to date with `main`.
4. Maintainers may request changes -- please address them in new commits (do not force-push during review).
5. Once approved, a maintainer will merge the PR using squash-and-merge.

## Reporting Bugs

Found a bug? Please help us fix it! Use the [Bug Report](../../issues/new?template=bug_report.md) issue template and include:

- A clear, descriptive title.
- Steps to reproduce the behavior.
- Expected behavior vs. actual behavior.
- Screenshots or logs, if applicable.
- Your environment (OS, browser, Node.js version).

## Suggesting Features

Have an idea for Logify? We would love to hear it! Use the [Feature Request](../../issues/new?template=feature_request.md) issue template and describe:

- The problem your feature would solve.
- Your proposed solution.
- Any alternatives you have considered.

## Community

- **GitHub Issues** -- for bug reports, feature requests, and discussion.
- **GitHub Discussions** -- for questions, ideas, and general conversation.

Thank you for contributing to Logify!
