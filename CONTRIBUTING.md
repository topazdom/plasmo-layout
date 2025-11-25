# Contributing to Plasmo Layout

Thank you for your interest in contributing to Plasmo Layout! 🎉 We welcome contributions from everyone who wants to help improve this project.

Please take a moment to review this document to make the contribution process smooth and effective for everyone involved.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Setting Up the Development Environment](#setting-up-the-development-environment)
- [Development Workflow](#development-workflow)
  - [Project Structure](#project-structure)
  - [Available Scripts](#available-scripts)
  - [Running Tests](#running-tests)
- [Making Contributions](#making-contributions)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Submitting Pull Requests](#submitting-pull-requests)
- [Coding Standards](#coding-standards)
  - [Code Style](#code-style)
  - [Commit Messages](#commit-messages)
  - [TypeScript Guidelines](#typescript-guidelines)
- [Release Process](#release-process)
- [Getting Help](#getting-help)

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [developers@topazdom.com](mailto:developers@topazdom.com).

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **Git**
- **Docker** (optional, for containerized development)

### Setting Up the Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/<your-username>/plasmo-layout.git
   cd plasmo-layout
   ```

3. **Add the upstream remote**:

   ```bash
   git remote add upstream https://github.com/topazdom/plasmo-layout.git
   ```

4. **Install dependencies**:

   ```bash
   npm install
   ```

5. **Set up environment variables**:

   ```bash
   cp sample.env .env
   ```

6. **Build the project**:

   ```bash
   npm run build
   ```

7. **Run tests** to verify everything is working:

   ```bash
   npm test
   ```

## Development Workflow

### Project Structure

```text
plasmo-layout/
├── src/                    # Source code
│   ├── cli/                # CLI commands (build, watch, clean)
│   │   └── commands/       # Individual command implementations
│   ├── config/             # Configuration handling
│   ├── engines/            # Templating engines (JSX, Edge.js)
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── examples/               # Example usage and layouts
│   ├── layouts/            # Sample layout templates
│   └── src/                # Sample Plasmo components
├── build/                  # Build configuration (Docker)
├── deployments/            # Deployment configurations
└── dist/                   # Compiled output (generated)
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Run in development mode with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run build:clean` | Clean build artifacts |
| `npm test` | Run the test suite |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint for code analysis |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

### Using Make Commands

We also provide a `Makefile` for common tasks:

```bash
make help        # Show all available commands
make test        # Run tests
make fmt         # Format code
make lint        # Run linting
make check       # Run all checks (format, lint, test, build)
make up          # Start Docker development environment
make down        # Stop Docker environment
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

## Making Contributions

### Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates.

When filing a bug report, include:

- **Clear title** describing the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs. actual behavior
- **Environment details** (OS, Node.js version, npm version)
- **Code samples** or minimal reproduction repository
- **Error messages** and stack traces if applicable

### Suggesting Features

Feature requests are welcome! Please provide:

- **Clear description** of the feature
- **Use case** explaining why this feature would be useful
- **Possible implementation** approach (optional)
- **Examples** of similar features in other tools (optional)

### Submitting Pull Requests

1. **Sync with upstream**:

   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**:

   ```bash
   git checkout -b feature/your-feature-name
   # or for bug fixes
   git checkout -b fix/issue-description
   ```

3. **Make your changes** following our [coding standards](#coding-standards)

4. **Write/update tests** for your changes

5. **Run the full check suite**:

   ```bash
   make check
   # or
   npm run format:check && npm run lint && npm test && npm run build
   ```

6. **Commit your changes** using [conventional commits](#commit-messages)

7. **Push to your fork**:

   ```bash
   git push origin feature/your-feature-name
   ```

8. **Open a Pull Request** against the `main` branch

#### Pull Request Guidelines

- Fill out the PR template completely
- Link related issues using keywords (e.g., "Fixes #123")
- Keep PRs focused on a single feature or fix
- Ensure all CI checks pass
- Request review from maintainers
- Be responsive to feedback and make requested changes

## Coding Standards

### Code Style

This project uses **Prettier** for code formatting and **ESLint** for linting.

- Run `npm run format` before committing
- Run `npm run lint` to check for issues
- Pre-commit hooks will automatically format staged files

Configuration files:

- `.prettierrc` - Prettier configuration
- `eslint.config.js` - ESLint configuration

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification. This enables automatic changelog generation and semantic versioning.

**Format:**

```text
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

**Types:**

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, etc.) |
| `refactor` | Code refactoring |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `build` | Build system or dependencies |
| `ci` | CI/CD configuration |
| `chore` | Other changes (tooling, etc.) |

**Examples:**

```bash
feat(cli): add --verbose flag to build command
fix(engine): resolve JSX rendering issue with nested components
docs(readme): update installation instructions
test(parser): add unit tests for @layout decorator parsing
```

**Rules:**

- Use imperative mood ("add" not "added")
- Don't capitalize the first letter
- No period at the end of the subject line
- Keep subject line under 72 characters

Commit messages are validated using `commitlint` via Husky pre-commit hooks.

### TypeScript Guidelines

- Use strict TypeScript (`strict: true` in tsconfig)
- Prefer interfaces over type aliases for object shapes
- Export types from `src/types/` directory
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Avoid `any` type; use `unknown` when type is truly unknown

## Release Process

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning and publishing.

Releases are triggered automatically when commits are merged to `main`:

- `fix:` commits trigger a **patch** release (1.0.x)
- `feat:` commits trigger a **minor** release (1.x.0)
- `BREAKING CHANGE:` in commit body triggers a **major** release (x.0.0)

**Note:** Only maintainers can merge to `main` and trigger releases.

## Getting Help

- 📖 Check the [README](README.md) for usage documentation
- 🔍 Search [existing issues](https://github.com/topazdom/plasmo-layout/issues)
- 💬 Open a [new issue](https://github.com/topazdom/plasmo-layout/issues/new) for questions
- 📧 Email us at [developers@topazdom.com](mailto:developers@topazdom.com)

---

Thank you for contributing to Plasmo Layout! ❤️
