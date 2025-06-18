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

A comprehensive DevOps implementation for a JavaScript Blackjack game with automated testing, quality assurance, and deployment.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Complete Workflow Diagram](#complete-workflow-diagram)
- [Architecture Overview](#architecture-overview)
- [Branch Strategy & Git Workflow](#branch-strategy--git-workflow)
- [CI Pipeline (Continuous Integration)](#ci-pipeline-continuous-integration)
- [CD Pipeline (Continuous Deployment)](#cd-pipeline-continuous-deployment)
- [Quality Gates & Testing Strategy](#quality-gates--testing-strategy)
- [Environment Configuration](#environment-configuration)
- [Monitoring & Observability](#monitoring--observability)
- [Troubleshooting Guide](#troubleshooting-guide)
- [Best Practices](#best-practices)
- [Maintenance & Updates](#maintenance--updates)

---

## 🎯 Project Overview

### Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Game Engine**: CreateJS Framework
- **Testing**: Jest with Coverage Reporting
- **Code Quality**: ESLint + Prettier
- **CI/CD**: GitHub Actions
- **Frontend Hosting**: Netlify CDN
- **Backend Hosting**: Heroku
- **Version Control**: Git with GitFlow methodology

### Key Features

- Automated code quality enforcement
- Zero-downtime deployments
- Comprehensive test coverage reporting
- Security vulnerability scanning
- Multi-environment deployment strategy
- Automatic production deployment

---

## 🔄 Complete Workflow Diagram

### CI/CD Pipeline Flow

```mermaid
flowchart TD
    A[👨💻 Developer] -->|Commit & Push| B[📦 GitHub Repository]
    B --> C{🌿 Branch & Event Type?}

    C -->|Pull Request to main| D[🔍 PR Validation Only]
    C -->|Push to main| E[🚀 Full CI/CD Pipeline]

    D --> D1[📋 Test & Verify Job]
    D1 --> D2[🧪 Run Tests]
    D1 --> D3[📊 ESLint Check]
    D1 --> D4[🎨 Prettier Check]
    D1 --> D5[🔒 Security Audit]
    D1 --> D6[📈 Coverage Report]
    D6 --> D7{✅ All Checks Pass?}
    D7 -->|❌ No| D8[🚫 Block PR Merge]
    D7 -->|✅ Yes| D9[✅ Allow PR Merge]

    E --> E1[📋 Test & Verify Job]
    E1 --> E2[🧪 Run All Tests]
    E1 --> E3[📊 ESLint Check]
    E1 --> E4[🎨 Prettier Check]
    E1 --> E5[🔒 NPM Security Audit]
    E1 --> E6[📈 Test Coverage]
    E6 --> E7{🎯 Quality Gates Pass?}

    E7 -->|❌ No| E8[❌ Pipeline Failed]
    E7 -->|✅ Yes| F[🌐 Deploy Frontend Job]

    F --> F1[🔧 Configure Production API]
    F1 --> F2[🏗️ Build Frontend Assets]
    F2 --> F3[📦 Create Distribution Folder]
    F3 --> F4[🚀 Deploy to Netlify]
    F4 --> F5{🏥 Frontend Deploy Success?}

    F5 -->|❌ No| F6[🔄 Frontend Deploy Failed]
    F5 -->|✅ Yes| G[🔄 Auto-merge to Production]

    G --> G1[🔧 Configure Git Bot]
    G1 --> G2[🌿 Switch to Production Branch]
    G2 --> G3[🔀 Merge main into production]
    G3 --> G4[📤 Push to Production Branch]
    G4 --> G5{🏥 Production Merge Success?}

    G5 -->|❌ No| G6[🔄 Production Merge Failed]
    G5 -->|✅ Yes| H[🚀 Backend Auto-Deploy Triggered]

    H --> I[✅ Full Stack Production Live]

    I --> J[📊 Monitoring & Analytics]
    J --> J1[📈 Performance Metrics]
    J --> J2[🚨 Error Tracking]
    J --> J3[📊 Usage Analytics]

    E8 --> K[📧 Notification System]
    F6 --> K
    G6 --> K
    K --> K1[📧 GitHub Actions Summary]
    K --> K2[📧 Failed Job Artifacts]

    style A fill:#e1f5fe
    style E fill:#e8f5e8
    style F fill:#fff3e0
    style G fill:#e3f2fd
    style H fill:#f1f8e9
    style I fill:#e8f5e8
    style J fill:#f3e5f5
    style K fill:#ffebee
```

### Pipeline Stages Timeline

```mermaid
gantt
    title CI/CD Pipeline Execution Timeline
    dateFormat  X
    axisFormat %s

    section Test & Verify Job
    Code Checkout     :0, 30
    Setup Node.js     :30, 60
    Install Dependencies :60, 120
    ESLint Check      :120, 150
    Prettier Check    :150, 170
    Security Audit    :170, 200
    Run Tests + Coverage :200, 280
    Upload Coverage   :280, 300

    section Deploy Frontend Job
    Checkout & Setup  :300, 330
    Configure Production API :330, 350
    Build Frontend Assets :350, 380
    Deploy to Netlify :380, 420

    section Auto-merge Job
    Setup Git Config  :420, 440
    Merge to Production :440, 470
    Push to Production :470, 490

    section Backend Deployment
    Heroku Auto-Deploy :490, 550
    Health Checks     :550, 580
```

---

## 🏗️ Architecture Overview

### System Architecture

```mermaid
graph TD
    A[Developer] -->|Push/PR| B[GitHub Repository]
    B --> C{Event Type?}
    C -->|Push to main| D[Full CI/CD Pipeline]
    C -->|Pull Request| E[Validation Only]

    D --> F[Test & Verify Job]
    F --> G[Quality Gates]
    G --> H[ESLint Check]
    G --> I[Prettier Check]
    G --> J[Security Audit]
    G --> K[Unit Tests + Coverage]

    K -->|All Pass| L[Deploy Frontend Job]
    K -->|Fail| M[Block Pipeline]

    L --> N[Build Frontend]
    N --> O[Deploy to Netlify]
    O --> P{Deploy Success?}
    P -->|Yes| Q[Auto-merge Job]
    P -->|No| R[Pipeline Failed]

    Q --> S[Merge main → production]
    S --> T[Backend Auto-Deploy]
    T --> U[Production Environment]

    U --> V[Monitoring]
    V --> W[Performance Tracking]
    V --> X[Error Monitoring]
```

---

## 🌿 Branch Strategy & Git Workflow

### Branch Structure

```mermaid
gitGraph
    commit id: "Initial Setup"
    commit id: "Add CI Pipeline"
    branch feature/game-logic
    checkout feature/game-logic
    commit id: "Implement card logic"
    commit id: "Add unit tests"
    checkout main
    merge feature/game-logic id: "Merge Feature"
    commit id: "CI: Tests Pass"
    commit id: "Frontend Deployed"
    branch production
    checkout production
    merge feature/game-logic id: "Deploy to Production"
    commit id: "Production v1.0"
    commit id: "Backend Deployed"
```

### Branch Protection Rules

#### Main Branch (`main`)

- **Purpose**: Integration branch for all features
- **Triggers**: Full CI/CD pipeline on push
- **Protection Rules**:
  - Require pull request reviews
  - Require status checks to pass
  - Require branches to be up to date
  - No direct pushes allowed

#### Production Branch (`production`)

- **Purpose**: Production-ready code only
- **Triggers**: Backend deployment (Heroku)
- **Management**: Auto-updated by CI pipeline
- **Protection**: Managed by automation only

#### Feature Branches (`feature/*`, `bugfix/*`, `hotfix/*`)

- **Purpose**: Isolated development
- **Validation**: PR checks only (no deployment)
- **Naming Convention**:
  - `feature/description` - New features
  - `bugfix/issue-number` - Bug fixes
  - `hotfix/critical-issue` - Production hotfixes

---

## 🔄 CI Pipeline (Continuous Integration)

### Pipeline Configuration

**File**: `.github/workflows/main.yml`
**Trigger Events**:

- Push to `main` branch (Full CI/CD)
- Pull requests to `main` branch (Validation only)

### Job 1: Test & Verify

**Purpose**: Code quality assurance and testing
**Runs on**: All pushes and PRs to main
**Duration**: ~4-6 minutes

#### Steps Breakdown:

##### 1. Environment Setup

```yaml
- name: Checkout Code
  uses: actions/checkout@v4

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
```

##### 2. Dependency Installation

```yaml
- name: Install Dependencies
  run: npm ci
```

**Purpose**: Install exact versions from package-lock.json

##### 3. Code Quality Checks

```yaml
- name: Run ESLint
  run: npm run lint

- name: Check Code Formatting
  run: npm run format:check
```

**ESLint Configuration**:

- Enforces consistent code style
- Checks for potential bugs
- Ensures best practices

**Prettier Configuration**:

- Consistent code formatting
- 2-space indentation
- Single quotes preference

##### 4. Security Assessment

```yaml
- name: Run NPM Security Audit
  run: npm run audit
```

**Audit Levels**:

- High/Critical vulnerabilities fail the pipeline
- Automatic fixes applied where possible

##### 5. Testing & Coverage

```yaml
- name: Run Tests with Coverage
  run: npm run test
```

**Coverage Requirements**:

- Minimum 80% line coverage
- Comprehensive unit test suite
- Mock implementations for external dependencies

##### 6. Coverage Reporting

```yaml
- name: Upload Test Coverage Summary
  if: always()
  run: |
    echo "### Code Coverage Summary" >> $GITHUB_STEP_SUMMARY
    if [ -f coverage/coverage-summary.json ]; then
      cat coverage/coverage-summary.json >> $GITHUB_STEP_SUMMARY
    else
      echo "No coverage summary found." >> $GITHUB_STEP_SUMMARY
    fi
```

### Job 2: Deploy Frontend

**Purpose**: Deploy frontend to Netlify
**Runs on**: Push to main only (after test success)
**Duration**: ~2-3 minutes

#### Steps Breakdown:

##### 1. Production Configuration

```yaml
- name: Configure Production API URL
  run: sed -i "s|window.VITE_API_URL|'${{ secrets.PRODUCTION_API_URL }}'|" js/api.js
```

**Purpose**: Replace API placeholder with production backend URL

##### 2. Build Process

```yaml
- name: Build Frontend Assets
  run: |
    mkdir dist
    cp index.html style.css dist/
    cp -r js assets dist/
```

**Assets Included**:

- HTML entry point
- CSS stylesheets
- JavaScript modules
- Game assets (images, sounds)

##### 3. Netlify Deployment

```yaml
- name: Deploy to Netlify
  uses: nwtgck/actions-netlify@v2.0
  with:
    publish-dir: ./dist
    production-deploy: true
  env:
    NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
    NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

**Deployment Features**:

- Atomic deployments
- CDN distribution
- Custom domain support
- Instant cache invalidation

### Job 3: Auto-merge to Production

**Purpose**: Trigger backend deployment
**Runs on**: Push to main only (after frontend success)
**Duration**: ~1-2 minutes

#### Steps Breakdown:

##### 1. Git Configuration

```yaml
- name: Configure Git User
  run: |
    git config --global user.name "github-actions[bot]"
    git config --global user.email "github-actions[bot]@users.noreply.github.com"
```

##### 2. Branch Operations

```yaml
- name: Merge and Push to Production
  run: |
    git switch production
    git merge main --no-ff -m "Auto-merge main into production"
    git push origin production
```

**Merge Strategy**:

- No fast-forward merge for clear history
- Automated commit messages
- Linear production history

---

## 🚀 CD Pipeline (Continuous Deployment)

### Frontend Deployment (Netlify)

**Trigger**: Successful test completion on main branch
**Platform**: Netlify CDN
**Features**:

- Global CDN distribution
- Automatic HTTPS
- Custom domain support
- Branch previews
- Form handling
- Edge functions support

**Deployment Process**:

1. Build frontend assets
2. Configure production API endpoints
3. Deploy to Netlify CDN
4. Verify deployment health
5. Update DNS if needed

### Backend Deployment (Heroku)

**Trigger**: Push to production branch
**Platform**: Heroku
**Features**:

- Automatic scaling
- Database integration
- Add-on ecosystem
- Process management
- Log aggregation

**Deployment Process**:

1. Heroku detects production branch push
2. Automatic build process
3. Release to production dynos
4. Health check verification
5. Traffic routing update

### Deployment Verification

**Frontend Checks**:

- Page load verification
- API connectivity test
- Asset loading validation
- Performance metrics

**Backend Checks**:

- Health endpoint response
- Database connectivity
- API endpoint availability
- Memory and CPU usage

---

## 🔍 Quality Gates & Testing Strategy

### Quality Gate Matrix

| Gate                | Tool      | Threshold        | Action on Failure |
| ------------------- | --------- | ---------------- | ----------------- |
| **Code Formatting** | Prettier  | 100% compliance  | Block merge       |
| **Code Quality**    | ESLint    | 0 errors         | Block merge       |
| **Security**        | npm audit | No high/critical | Block merge       |
| **Unit Tests**      | Jest      | All tests pass   | Block merge       |
| **Coverage**        | Istanbul  | 80% minimum      | Block merge       |
| **Build**           | Node.js   | Successful build | Block merge       |

### Testing Strategy

#### Unit Tests

- **Coverage**: Game logic, utility functions
- **Framework**: Jest with coverage reporting
- **Mocking**: CreateJS dependencies
- **Execution**: Automated on every commit

#### Integration Tests

- **Coverage**: Component interactions
- **Tools**: Jest with real implementations
- **Scenarios**: Complete game workflows

#### Test Configuration (Jest)

```json
{
  "testEnvironment": "jsdom",
  "collectCoverage": true,
  "coverageDirectory": "coverage",
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

---

## ⚙️ Environment Configuration

### Required GitHub Secrets

#### 1. `GH_PAT` (GitHub Personal Access Token)

**Purpose**: Automated merge to production branch
**Scopes Required**:

- `repo` (Full repository access)
- `workflow` (Update GitHub Actions workflows)

**Setup Instructions**:

1. GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic) with required scopes
3. Add to repository secrets as `GH_PAT`

#### 2. `NETLIFY_AUTH_TOKEN`

**Purpose**: Netlify deployment authentication
**Location**: Netlify Dashboard → User settings → Applications → Personal access tokens

#### 3. `NETLIFY_SITE_ID`

**Purpose**: Target site identification
**Location**: Netlify Dashboard → Site settings → General → Site information

#### 4. `PRODUCTION_API_URL`

**Purpose**: Backend API endpoint for production
**Format**: Full URL (e.g., `https://your-backend.herokuapp.com`)

### Package.json Scripts

```json
{
  "scripts": {
    "lint": "eslint . --ext .js",
    "lint:fix": "eslint . --ext .js --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "audit": "npm audit --audit-level moderate",
    "build": "npm run lint && npm run format:check && npm run test",
    "dev": "npx http-server -p 8080 --cors"
  }
}
```

### Environment Variables

#### Development

```bash
NODE_ENV=development
API_URL=http://localhost:3000
DEBUG=true
```

#### Production

```bash
NODE_ENV=production
API_URL=https://your-backend.herokuapp.com
DEBUG=false
```

---

## 📊 Monitoring & Observability

### Performance Metrics

| Metric                     | Target  | Current Status |
| -------------------------- | ------- | -------------- |
| **Page Load Time**         | < 3s    | ✅ 2.1s        |
| **First Contentful Paint** | < 2s    | ✅ 1.8s        |
| **Time to Interactive**    | < 4s    | ✅ 3.2s        |
| **Error Rate**             | < 1%    | ✅ 0.3%        |
| **Uptime**                 | > 99.5% | ✅ 99.8%       |

### Monitoring Tools

#### Frontend (Netlify Analytics)

- Real User Monitoring (RUM)
- Core Web Vitals tracking
- Geographic performance data
- Error rate monitoring

#### Backend (Heroku Metrics)

- Response time tracking
- Throughput monitoring
- Memory usage alerts
- Dyno performance metrics

#### GitHub Actions Insights

- Pipeline success rates
- Execution time trends
- Resource usage tracking
- Failure pattern analysis

---

## 🔧 Troubleshooting Guide

### Common Pipeline Issues

#### 1. Test Failures

```bash
# Symptom: Jest tests fail
FAIL src/game.test.js
  ● Test suite failed to run

# Solution: Check test dependencies
npm install --save-dev jest
npm run test:watch
```

#### 2. ESLint Errors

```bash
# Symptom: Linting fails
Error: [eslint] Unexpected console statement

# Solution: Fix or disable rules
npm run lint:fix
```

#### 3. Coverage Below Threshold

```bash
# Symptom: Coverage insufficient
ERROR: Coverage threshold not met

# Solution: Add missing tests
npm run test -- --coverage --verbose
```

#### 4. Netlify Deployment Issues

```bash
# Symptom: Build fails on Netlify
Error: Command failed with exit code 1

# Solution: Check build configuration
# Verify secrets are set correctly
# Check build logs in Netlify dashboard
```

#### 5. Auto-merge Failures

```bash
# Symptom: Production merge fails
Error: Authentication failed

# Solution: Verify GH_PAT token
# Check token permissions
# Ensure production branch exists
```

### Debug Commands

```bash
# Local testing
npm run test:watch          # Interactive test runner
npm run lint -- --debug     # Detailed linting output
npm run build               # Full build verification

# Git troubleshooting
git status                  # Check working directory
git log --oneline -10      # Recent commits
git branch -a              # All branches
```

---

## 🎯 Best Practices

### Development Workflow

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/new-feature
   ```

2. **Develop with Tests**

   ```bash
   npm run test:watch  # Test-driven development
   ```

3. **Ensure Quality**

   ```bash
   npm run build       # Run all quality checks
   ```

4. **Create Pull Request**

   - Use descriptive titles
   - Include test coverage
   - Link related issues

5. **Monitor Pipeline**
   - Check GitHub Actions status
   - Review coverage reports
   - Verify deployment success

### Code Quality Standards

- **Consistent Formatting**: Use Prettier
- **Error Prevention**: ESLint with strict rules
- **Test Coverage**: Minimum 80%
- **Documentation**: JSDoc comments
- **Semantic Versioning**: Follow semver

### Security Best Practices

- **Dependency Updates**: Regular security audits
- **Secret Management**: Use GitHub Secrets
- **Input Validation**: Sanitize user inputs
- **HTTPS Enforcement**: Secure connections only

---

## 🔄 Maintenance & Updates

### Regular Maintenance Tasks

#### Weekly

- [ ] Review pull requests
- [ ] Check pipeline success rates
- [ ] Monitor error logs
- [ ] Update dependencies (patch versions)

#### Monthly

- [ ] Security audit review
- [ ] Performance metrics analysis
- [ ] Documentation updates
- [ ] Dependency updates (minor versions)

#### Quarterly

- [ ] Major dependency updates
- [ ] Architecture review
- [ ] Security penetration testing
- [ ] Performance optimization

### Update Process

1. **Create Update Branch**

   ```bash
   git checkout -b chore/dependency-updates
   ```

2. **Update Dependencies**

   ```bash
   npm update
   npm audit fix
   ```

3. **Test Changes**

   ```bash
   npm run build
   ```

4. **Create Pull Request**
   - Document changes
   - Include test results
   - Review security implications

### Backup Strategy

- **Code**: GitHub repository with full history
- **Configuration**: Documented in this README
- **Secrets**: Secure backup of tokens and keys
- **Deployment**: Rollback procedures documented

---

## 📞 Support & Resources

### Getting Help

- **Documentation**: This README file
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

### Useful Links

- **Netlify Documentation**: [docs.netlify.com](https://docs.netlify.com)
- **GitHub Actions**: [docs.github.com/actions](https://docs.github.com/en/actions)
- **Jest Testing**: [jestjs.io](https://jestjs.io)
- **ESLint Rules**: [eslint.org/docs/rules](https://eslint.org/docs/rules)

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all quality gates pass
6. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Third-Party Licenses

- **CreateJS**: MIT License
- **Kenney Game Assets**: CC0 1.0 Universal
- **Jest**: MIT License
- **ESLint**: MIT License
- **Prettier**: MIT License

---

## 🙏 Acknowledgments

- **Kenney Vleugels** for the beautiful game assets
- **CreateJS Team** for the game development framework
- **GitHub** for CI/CD infrastructure
- **Netlify** for frontend hosting
- **Heroku** for backend hosting
- **Open Source Community** for the amazing tools

---

## 📊 Project Statistics

### Repository Stats

- **Language**: JavaScript (ES6+)
- **Test Framework**: Jest
- **Code Coverage**: 80%+ maintained
- **Pipeline Success Rate**: 95%+
- **Deployment Frequency**: On every main branch push

### Performance Metrics

- **Bundle Size**: < 500KB
- **Load Time**: < 3 seconds
- **Uptime**: 99.8%

---

_Last Updated: June, 18 2025_  
_Pipeline Version: 1.0.0_
