# What-If Dashboard 📈

A premium, data-dense financial and time-management dashboard built for high-level "what-if" scenario modeling. This application provides a suite of interactive calculators designed to help users visualize financial trajectories and time allocation with precision.

---

## 🌎 Live Demo

Live demo hosted on Vercel [What-If Dashboard](https://whatifdashboard-react-vite-framer-t.vercel.app/).

---

## ✨ Features

- **📊 Comprehensive Calculators**:
  - **Salary & Taxes**: Detailed breakdown of gross income, tax liabilities, retirement contributions, and monthly surplus.
  - **Mortgage Equity**: Amortization modeling with home price, down payment, and interest rate variables.
  - **Wealth Growth**: Multi-year investment projections showing compound interest and ROI over time.
  - **Time Allocation**: Weekly "time budget" visualization using radar charts to balance rest, career, and growth.
  - **Bardal Factor**: Severance and job-search runway estimator based on age, years of service, position level, and field availability.
  - **Debt Repayment**: Payoff timeline and total interest projection for revolving debt, with minimum-payment warnings.
  - **Financial Goals**: Multi-goal tracker with per-goal progress bars and a pie chart showing target allocation across goals.
  - **Days Between**: Calculates the exact number of days, weeks, months, and years between any two dates, with whole-unit and remainder breakdowns (e.g. 3 weeks + 4 days). Works in both directions and labels results as "Days Until" or "Days Since" accordingly.
  - **Weight Loss**: Calculates BMR via Mifflin-St Jeor, applies a safe calorie deficit (250–1,000 kcal), and projects weekly fat loss and weeks to reach a target weight. Supports lbs/kg and inches/cm.
  - **Protein Intake**: Recommends daily protein in grams and protein powder scoops based on age, weight, and activity level, with an upward adjustment for adults 50+. Supports lbs/kg.
  - **Calorie Deficit Planner**: Plan how to achieve a calorie deficit by splitting it between diet and exercise. Compare conservative, moderate, and aggressive weekly loss strategies side by side.
  - **Career Path Projection**: Model salary growth over 5–40 years. Compare staying in your current role (with periodic promotions) against job-hopping for salary bumps, and see cumulative lifetime earnings for each path.
  - **Wrongful Dismissal**: Estimate wrongful dismissal damages under Canadian employment law. Calculates common law reasonable notice (Bardal), Ontario ESA minimums, bad faith/Wallace damages, mitigation deductions, a typical settlement range, and estimated net after legal fees.
  - **Severance & EI Estimator**: Estimate your Canadian severance package and Employment Insurance benefits after a job loss. Calculates ESA termination pay and severance pay by province, EI eligibility based on insurable hours and regional unemployment rate, weekly benefit amount, benefit duration, and your combined income runway.
- **🌓 Dynamic Themes**: Fully responsive dark and light modes with a neutral, professional aesthetic.
- **💾 Persistence**: Automatically saves your progress to `localStorage` so your data remains across reloads and sessions.
- **🖨️ Professional Reporting**: Optimized print-only CSS for generating clean, white-background PDF or physical reports.
- **⚡ Real-Time Feedback**: Interactive sliders and charts provide instant visual feedback on scenario changes.
- **📤 Import / Export**: Save and restore your entire dashboard state as a JSON file for backup or sharing. The Export menu offers four formats:
  - **🗂️ JSON Backup** — full raw state for import/restore.
  - **📋 Notion (.zip)** — a zip of Markdown files importable via Notion's Merge feature.
  - **💎 Obsidian (.zip)** — same Markdown files with YAML frontmatter (`tags: [whatif]`) for Obsidian vaults.
  - **🤖 MCP / RAG (.json)** — a single human-readable JSON file with labelled inputs and computed results per calculator, optimised for LLM ingestion and RAG pipelines.
- **🏠 Landing Page**: Animated entry page with quick-access cards for each calculator.
- **🧩 Custom Dashboard**: A build-your-own view at `/multi` — toggle any combination of calculators to appear together on a single page, letting you compare scenarios side-by-side. Selection is persisted to `localStorage`.

## 🛠️ Technology Stack

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007acc.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer-Motion-black?style=for-the-badge&logo=framer&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide-React-orange?style=for-the-badge&logo=lucide&logoColor=white)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/whatifdashboard.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 📄 License

This project is open-source and available under the **MIT License**. Feel free to use, modify, and distribute it as you see fit.

---
*Created for portfolio demonstration purposes.*

## 📈 Screenshots

<img alt="Image" src="https://github.com/user-attachments/assets/ef42634a-a0da-4a31-b1db-ba17174b10c0" />

<img alt="Image" src="https://github.com/user-attachments/assets/ca626144-6c9b-48f5-b3b0-b9798d2328bd" />

<img alt="Image" src="https://github.com/user-attachments/assets/d53cf423-e250-462b-9f22-e6fb59b42e81" />

<img alt="Image" src="https://github.com/user-attachments/assets/db737551-a63a-4241-8e9b-b3be72c3a4d7" />

<img alt="Image" src="https://github.com/user-attachments/assets/f6055ebf-5d1a-430b-a103-991cc952b39e" />