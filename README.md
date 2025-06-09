# 🃏 BlackJackJS

BlackJackJS is a simple Blackjack game built using HTML, JavaScript, and [CreateJS](https://createjs.com/). The game runs directly in the browser — no installation required!

🎮 **[Play the Demo Now](https://blackjack-cicd.netlify.app/)**

---

## 🎲 How to Play

### Objective of the Game

The main goal in Blackjack is to beat the Dealer in one of the following ways:

- Get a total card value of 21 on your first two cards (a "Blackjack").
- Reach a final score higher than the Dealer without exceeding 21.
- Let the Dealer draw additional cards until their hand exceeds 21 ("Bust").

### Gameplay Flow

1.  **Place Your Bet**: Click on one of the chips at the bottom to set your bet amount.
2.  **Start the Round**: Press the **"Go"** button to begin. You and the Dealer will each receive two cards.
3.  **Your Turn**: Based on your cards, choose an action:
    - **Hit**: Take one additional card.
    - **Stand**: Take no more cards and end your turn.
4.  **Dealer's Turn**: After you stand, the Dealer will reveal their face-down card and must draw cards until their total is 17 or higher.
5.  **Outcome**: The winner is determined by comparing your final card total against the Dealer's.

### Rules & Card Values

- **Number Cards (2-10)**: Their value is the number on the card.
- **Face Cards (J, Q, K)**: Each is worth 10.
- **Ace**: Can be worth either 1 or 11, whichever is more advantageous for your hand.

### Game Features

- **Double Down**: Double your initial bet, but you may only draw one more card.
- **Insurance**: If the Dealer's face-up card is an Ace, you can place a side bet. You win this bet if the Dealer has a Blackjack.
- **Give Up**: Forfeit the round after the initial deal and get half of your bet back.

### 💰 Chip Values:

| Value | Image                                                                                                      |
| ----- | ---------------------------------------------------------------------------------------------------------- |
| 500   | ![500](https://raw.githubusercontent.com/Oli8/BlackJackJs/master/assets/PNG/Chips/chipBlueWhite_side.png)  |
| 100   | ![100](https://raw.githubusercontent.com/Oli8/BlackJackJs/master/assets/PNG/Chips/chipBlackWhite_side.png) |
| 25    | ![25](https://raw.githubusercontent.com/Oli8/BlackJackJs/master/assets/PNG/Chips/chipGreenWhite_side.png)  |
| 5     | ![5](https://raw.githubusercontent.com/Oli8/BlackJackJs/master/assets/PNG/Chips/chipRedWhite_side.png)     |
| 1     | ![1](https://raw.githubusercontent.com/Oli8/BlackJackJs/master/assets/PNG/Chips/chipWhiteBlue_side.png)    |

🎨 Thanks to [Kenney Vleugels](http://www.kenney.nl) for the amazing graphic assets!

---

# CI/CD Pipeline Documentation

## Table of Contents

- [Overview](#overview)
- [Branch Strategy](#branch-strategy)
- [CI Pipeline (Continuous Integration)](#ci-pipeline-continuous-integration)
- [CD Pipeline (Continuous Deployment)](#cd-pipeline-continuous-deployment)
- [Setup Requirements](#setup-requirements)
- [Workflow Triggers](#workflow-triggers)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Overview

This project implements a **GitFlow-inspired CI/CD pipeline** using GitHub Actions to ensure code quality and automated deployment. The pipeline consists of two main workflows:

1. **CI (Continuous Integration)** - Automated testing, linting, and quality checks
2. **CD (Continuous Deployment)** - Automated deployment to production

### Pipeline Architecture

```
Developer Push → main branch → CI Pipeline → Auto-merge to production → CD Pipeline → Netlify Deployment
```

---

## Branch Strategy

### 🌟 Main Branch (`main`)

- **Purpose**: Primary development branch
- **Protection**: All code must pass CI checks before merging
- **Automation**: Successful CI runs automatically merge to `production`
- **Usage**: Direct pushes and pull request merges

### 🚀 Production Branch (`production`)

- **Purpose**: Deployment-ready code only
- **Protection**: No direct pushes allowed (auto-managed by CI)
- **Automation**: Every push triggers CD pipeline
- **Usage**: Source for production deployments

---

## CI Pipeline (Continuous Integration)

**File**: `.github/workflows/ci.yml`  
**Trigger**: Push to `main` branch or Pull Requests

### Pipeline Steps

#### 1. Environment Setup

```yaml
- name: Checkout code
  uses: actions/checkout@v3

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
```

**Purpose**: Prepares the GitHub Actions runner with the project code and Node.js environment.

#### 2. Dependency Installation

```yaml
- name: Install dependencies
  run: npm ci
```

**Purpose**: Installs exact package versions from `package-lock.json` for consistent builds.

#### 3. Code Quality Checks

##### ESLint (Linting)

```yaml
- name: Run ESLint
  run: npm run lint:fix
```

**Purpose**: Identifies and automatically fixes JavaScript/TypeScript code quality issues.

##### Prettier (Code Formatting)

```yaml
- name: Run Prettier Fix (Auto-format code)
  run: npm run format

- name: Check formatting after fix
  run: npm run format:check
```

**Purpose**: Ensures consistent code formatting across the entire codebase.

#### 4. Security Audit

```yaml
- name: Run NPM Audit
  run: npm run audit
```

**Purpose**: Scans dependencies for known security vulnerabilities with **high-severity threshold**.
**Note**: Only high and critical vulnerabilities will fail the build, moderate vulnerabilities are reported but don't block deployment.

#### 5. Testing & Coverage

```yaml
- name: Run Tests with Coverage
  run: npm run test
```

**Purpose**: Executes unit tests and generates code coverage reports.

#### 6. Coverage Reporting

```yaml
- name: Upload Code Coverage Summary to GitHub
  if: always()
  run: |
    echo "### Code Coverage Summary" >> $GITHUB_STEP_SUMMARY
    if [ -f coverage/coverage-summary.json ]; then
      cat coverage/coverage-summary.json >> $GITHUB_STEP_SUMMARY
    else
      echo "No coverage summary found." >> $GITHUB_STEP_SUMMARY
    fi
```

**Purpose**: Displays test coverage metrics in the GitHub Actions summary.

#### 7. Auto-merge to Production

```yaml
- name: Auto-merge main -> production
  if: success() && github.ref == 'refs/heads/main'
  env:
    GH_PAT: ${{ secrets.GH_PAT }}
  run: |
    git config --global user.name "github-actions[bot]"
    git config --global user.email "github-actions[bot]@users.noreply.github.com"
    git clone --single-branch --branch production https://x-access-token:${GH_PAT}@github.com/${{ github.repository }} repo
    cd repo
    git remote add upstream https://x-access-token:${GH_PAT}@github.com/${{ github.repository }}
    git fetch upstream main
    git merge upstream/main --no-edit
    git push origin production
```

**Purpose**: Automatically merges successful `main` branch changes to `production` branch.

---

## CD Pipeline (Continuous Deployment)

**File**: `.github/workflows/cd.yml`  
**Trigger**: Push to `production` branch (typically from CI auto-merge)

### Pipeline Steps

#### 1. Environment Setup

```yaml
- name: Checkout Repository
  uses: actions/checkout@v3

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
```

#### 2. Dependency Installation

```yaml
- name: Install Dependencies
  run: npm ci
```

#### 3. Netlify Deployment

```yaml
- name: Deploy to Netlify
  uses: nwtgck/actions-netlify@v2.0
  with:
    publish-dir: ./
    production-deploy: true
  env:
    NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
    NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

**Purpose**: Deploys the application to Netlify hosting platform using secure authentication tokens.

---

## Setup Requirements

### GitHub Secrets Configuration

Navigate to **Settings → Secrets and variables → Actions** in your GitHub repository and add:

#### 1. `GH_PAT` (GitHub Personal Access Token)

- **Purpose**: Allows CI pipeline to push to production branch
- **Permissions Required**:
  - `repo` (Full control of private repositories)
  - `workflow` (Update GitHub Action workflows)
- **Creation**: GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)

#### 2. `NETLIFY_AUTH_TOKEN`

- **Purpose**: Authenticates with Netlify API for deployments
- **Location**: Netlify Dashboard → User settings → Applications → Personal access tokens

#### 3. `NETLIFY_SITE_ID`

- **Purpose**: Identifies the specific Netlify site for deployment
- **Location**: Netlify Dashboard → Site settings → General → Site details

### Package.json Configuration

Your `package.json` must include the following scripts and dependencies for the CI/CD pipeline to function properly:

#### Required Scripts

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "lint:report": "eslint . --format=json --output-file=eslint-report.json",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "audit": "npm audit --audit-level=high",
    "test": "jest --coverage",
    "fix-all": "npm run lint:fix && npm run format"
  }
}
```

#### Required Dev Dependencies

```json
{
  "devDependencies": {
    "@eslint/js": "^9.27.0",
    "eslint": "^9.27.0",
    "eslint-config-prettier": "^10.1.5",
    "eslint-plugin-jest": "^28.12.0",
    "globals": "^16.2.0",
    "istanbul-reports": "^3.1.7",
    "jest": "^29.7.0",
    "prettier": "^3.5.3"
  }
}
```

#### Script Explanations

- **`lint`**: Basic ESLint check without auto-fixing
- **`lint:fix`**: ESLint with automatic error fixing (used in CI)
- **`lint:report`**: Generates JSON report for detailed analysis
- **`format`**: Auto-formats code using Prettier (used in CI)
- **`format:check`**: Validates code formatting without changes
- **`audit`**: Security audit with high-severity threshold
- **`test`**: Runs Jest tests with coverage reporting
- **`fix-all`**: Convenience script to fix linting and formatting in one command

---

## Workflow Triggers

### CI Pipeline Triggers

- **Push to main**: `git push origin main`
- **Pull Request**: Opening, updating, or reopening PRs targeting any branch
- **Manual trigger**: GitHub Actions tab → Run workflow

### CD Pipeline Triggers

- **Automatic**: When CI pipeline successfully merges to `production`
- **Manual**: Direct push to `production` branch (not recommended)

---

## Troubleshooting

### Common Issues

#### CI Pipeline Failures

**ESLint Errors**

```bash
# Fix locally before pushing
npm run lint:fix
git add .
git commit -m "fix: resolve linting issues"
```

**Test Failures**

```bash
# Run tests locally
npm test
# Fix failing tests, then commit changes
```

**Security Audit Failures**

```bash
# Check for vulnerabilities locally
npm run audit

# Fix automatically fixable vulnerabilities
npm audit fix

# For high-severity issues requiring manual intervention
npm audit fix --force

# Generate detailed audit report
npm run lint:report  # Creates eslint-report.json for analysis
```

#### CD Pipeline Failures

**Netlify Authentication Issues**

- Verify `NETLIFY_AUTH_TOKEN` is valid and not expired
- Check `NETLIFY_SITE_ID` matches your Netlify site

**Deployment Failures**

- Check Netlify build logs in the Actions output
- Ensure `publish-dir` path is correct in `cd.yml`

#### Auto-merge Issues

**Permission Denied**

- Verify `GH_PAT` token has required permissions
- Ensure token is not expired
- Check branch protection rules don't conflict

---

## Best Practices

### Development Workflow

1. **Feature Development**

   ```bash
   git checkout -b feature/new-feature
   # Make changes
   npm run fix-all  # Convenience script for linting and formatting
   git commit -m "feat: add new feature"
   git push origin feature/new-feature
   # Create Pull Request to main
   ```

2. **Local Quality Checks**

   ```bash
   npm run lint              # Check for linting errors
   npm run lint:fix          # Auto-fix linting issues
   npm run format:check      # Check code formatting
   npm run format            # Auto-format code
   npm run fix-all           # Fix both linting and formatting
   npm run test              # Run tests with coverage
   npm run audit             # Check for security vulnerabilities
   ```

3. **Code Quality Standards**

   - **ESLint Configuration**: Uses `@eslint/js` v9.27.0 with Prettier integration
   - **Testing Framework**: Jest v29.7.0 with Istanbul coverage reports
   - **Code Formatting**: Prettier v3.5.3 for consistent styling
   - **Security**: High-severity vulnerability threshold in npm audit

4. **Branch Management**
   - Never push directly to `production`
   - Keep `main` branch always deployable
   - Use descriptive branch names

### Monitoring & Maintenance

1. **Regular Checks**

   - Monitor GitHub Actions for failures
   - Review security audit reports
   - Update dependencies regularly

2. **Token Management**

   - Rotate access tokens quarterly
   - Use least-privilege principle
   - Document token purposes

3. **Performance Optimization**
   - Cache dependencies when possible
   - Optimize test suite execution time
   - Monitor deployment times

---

## Pipeline Benefits

✅ **Automated Quality Assurance**: Every code change is automatically tested and validated  
✅ **Consistent Deployments**: Eliminates manual deployment errors  
✅ **Fast Feedback**: Developers get immediate feedback on code quality  
✅ **Security**: Regular vulnerability scanning and secure deployment  
✅ **Rollback Capability**: Git-based deployments enable easy rollbacks  
✅ **Documentation**: Pipeline runs provide audit trail of all changes

---

## 📜 License

This project is licensed under the MIT License.  
Visual assets are licensed by Kenney.nl.  
Inspired by the original project at [github.com/Oli8](https://github.com/Oli8).

Thanks for checking it out!

---

_This documentation should be updated whenever pipeline configurations change. Last updated:09.06.2025_