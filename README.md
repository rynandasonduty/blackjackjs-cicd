# 🃏 BlackJackJS

BlackJackJS is a simple Blackjack game built using HTML, JavaScript, and [CreateJS](https://createjs.com/). The game runs directly in the browser — no installation required!

🎮 **[Play the Demo Now](https://blackjack-cicd.netlify.app/)**

---

## 🎲 How to Play

Click on a chip to place your bet and start the game!

### 💰 Chip Values:

| Value | Image |
|-------|--------|
| 500   | ![500](https://raw.githubusercontent.com/Oli8/BlackJackJs/master/assets/PNG/Chips/chipBlueWhite_side.png) |
| 100   | ![100](https://raw.githubusercontent.com/Oli8/BlackJackJs/master/assets/PNG/Chips/chipBlackWhite_side.png) |
| 25    | ![25](https://raw.githubusercontent.com/Oli8/BlackJackJs/master/assets/PNG/Chips/chipGreenWhite_side.png) |
| 5     | ![5](https://raw.githubusercontent.com/Oli8/BlackJackJs/master/assets/PNG/Chips/chipRedWhite_side.png) |
| 1     | ![1](https://raw.githubusercontent.com/Oli8/BlackJackJs/master/assets/PNG/Chips/chipWhiteBlue_side.png) |

### 🔧 Game Features

- **Double** – Double your bet and draw one more card.
- **Insurance** – A side bet when the dealer shows an Ace.
- **Give Up** – Forfeit half of your bet and end the round early.

🎨 Thanks to [Kenney Vleugels](http://www.kenney.nl) for the amazing graphic assets!

---

## ⚙️ Branch Structure & CI/CD Pipeline

### 📁 Branches

- **`main`**:
  - Main development branch.
  - Every commit triggers **CI (Continuous Integration)**.
  - If all CI steps pass, changes are **automatically merged into `production`**.

- **`production`**:
  - Deployment branch with **CD (Continuous Deployment)** configured.
  - Every push automatically deploys the latest version to **Netlify**.

### 🔄 CI/CD Workflow

#### ✅ CI (Continuous Integration)

Runs on the `main` branch via GitHub Actions:

- Linting and auto-fix (ESLint)
- Code formatting (Prettier)
- Security audit (`npm audit`)
- Unit testing (Jest)
- Code coverage report (Jest + Codecov)
- Auto-merge to `production` when all checks pass

#### 🚀 CD (Continuous Deployment)

Runs on the `production` branch:

- Checkout the repository
- Install dependencies
- Automatically deploys to **Netlify** using API token and Site ID stored in GitHub secrets

---

## 📜 License

This project is licensed under the MIT License.  
Visual assets are licensed by Kenney.nl.  
Inspired by the original project at [github.com/Oli8](https://github.com/Oli8).

Thanks for checking it out!
