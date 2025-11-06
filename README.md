# SERA AI - Personalized Genetics Health Platform

![SERA AI](public/helix-icon.svg)

**SERA AI** is a beautiful, privacy-first web application that provides genetics-based drug recommendations and lifestyle planning. Built as a **frontend-only** MVP with AI-powered insights via Google Gemini.

## ✨ Features

- 🔒 **100% Private** - All data stays on your device (localStorage/IndexedDB)
- 🧬 **40+ Pharmacogenomics Rules** - Evidence-based drug-gene interactions
- 🤖 **AI-Powered Explanations** - Gemini integration for patient-friendly insights
- 🎨 **Beautiful 3D Visualization** - Interactive DNA helix with Three.js
- 📊 **Personalized Recommendations** - Risk assessment and actionable advice
- 📅 **Lifestyle Planner** - Track screenings and health actions
- 💾 **Data Portability** - Export/import your complete genetic profile

## 🚀 Quick Start

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd sera-ai

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview  # Preview production build locally
```

## 🏗️ Tech Stack

- **Framework**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS v3 with custom design tokens
- **State Management**: Zustand with localForage persistence
- **3D Graphics**: Three.js via @react-three/fiber
- **Animation**: Framer Motion
- **Routing**: React Router v6 (HashRouter for GitHub Pages)
- **AI Integration**: Google Gemini API (client-side)
- **Forms**: React Hook Form + Zod validation

## 📁 Project Structure

```
/
├── public/               # Static assets
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI primitives
│   │   ├── layout/      # Navbar, RightDockGemini
│   │   └── helix3d/     # 3D DNA visualization
│   ├── routes/          # Page components
│   ├── lib/             # Core logic
│   │   ├── geminiClient.ts       # AI client
│   │   ├── ruleEngine/           # Genetic rules & recommendations
│   │   └── parser/               # Genetic data parser
│   ├── store/           # Zustand store
│   ├── types/           # TypeScript definitions
│   └── main.tsx         # Entry point
├── tests/
│   └── fixtures/        # Sample genetic data
└── package.json
```

## 🧬 Data Formats

SERA AI accepts genetic data in multiple formats:

### JSON Format (Recommended)

```json
[
  {
    "rsid": "rs1065852",
    "gene": "CYP2D6",
    "genotype": "CT"
  },
  {
    "rsid": "rs1799853",
    "gene": "CYP2C9",
    "genotype": "CC"
  }
]
```

### Simple Key-Value JSON

```json
{
  "rs1065852": "CT",
  "rs1799853": "CC"
}
```

### Tab-Delimited Text

```
rsID        Gene     Genotype
rs1065852   CYP2D6   CT
rs1799853   CYP2C9   CC
```

## 🔑 Gemini API Setup

1. Get your free API key at [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Navigate to **Settings** in SERA AI
3. Paste your API key
4. Optionally enable "Store in browser" for persistence

### Security Note

Your API key is used **directly by your browser** to call Gemini. It is never sent to any third-party servers (only to Google's Gemini API). When stored, it's saved in your browser's localStorage.

## 🧪 Testing

### Unit Tests

```bash
npm test
```

Tests cover:
- Genetic data parser
- Recommendation engine
- Gemini client (mock mode)
- Rule matching logic

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

## 📦 Deployment to GitHub Pages

### Option 1: Manual Deployment

```bash
npm run build
npm run deploy
```

This uses `gh-pages` to push the `dist/` folder to the `gh-pages` branch.

### Option 2: GitHub Actions (Automated)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

Configure GitHub Pages:
1. Go to repository **Settings** → **Pages**
2. Set source to `gh-pages` branch
3. Your site will be live at `https://<username>.github.io/<repo-name>/`

## 🔬 How It Works

### Rule Engine

SERA AI uses a comprehensive rule database (`src/lib/ruleEngine/geneticRules.ts`) containing:

- **Pharmacogenomics**: CYP2D6, CYP2C9, CYP2C19, CYP3A5, VKORC1, TPMT, SLCO1B1, etc.
- **Cancer Risk**: BRCA1, BRCA2, CHEK2, ATM
- **Metabolic**: TCF7L2 (diabetes), FTO (obesity), MTHFR (folate)
- **Cardiovascular**: APOE, LPA
- **Drug Hypersensitivity**: HLA-B*57:01 (abacavir), DPYD (5-FU)

Each rule includes:
- Gene and rsID(s)
- Genotype pattern
- Category (drug/disease/metabolic/cancer/lifestyle)
- Clinical implication
- Actionable recommendation
- Confidence level (low/medium/high)
- Evidence URLs

### Recommendation Flow

1. User uploads genetic markers (JSON/text) or enters manually
2. Click "Generate Recommendations" on Dashboard
3. Engine matches markers against 40+ rules
4. Optionally enhances with Gemini AI for patient-friendly explanations
5. Display prioritized recommendations with action buttons
6. User can accept, decline, save to lifestyle plan, or export

### 3D Visualization

The DNA helix (`Helix3D.tsx`) uses:
- Two intertwined tube geometries (double helix strands)
- Cylindrical rungs connecting strands
- Color-coded by recommendation confidence:
  - 🔴 Red = High risk
  - 🟡 Amber = Medium risk
  - 🟢 Green = Low risk
  - 🔵 Teal = No finding
- Hover tooltips showing gene, rsID, genotype
- OrbitControls for interactive rotation/zoom

## 🛡️ Privacy & Security

### Data Storage

- All genetic data stored in **IndexedDB** via localForage
- No server uploads or external transmission (except Gemini API when enabled)
- Export/import functionality for data portability
- One-click data deletion

### API Key Storage

- Stored in localStorage when "persist" option enabled
- **Not encrypted** (browser limitation)
- User can clear at any time
- Alternative: Use session-only (not persisted)

### Disclaimers

⚠️ **Medical Disclaimer**: SERA AI is for educational purposes only. It does not constitute medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals before making medical decisions based on genetic information.

⚠️ **Data Accuracy**: Rules are based on published research but may not reflect the latest clinical guidelines. Genomic science is rapidly evolving.

⚠️ **Gemini Integration**: When enabled, your genetic data and queries are sent to Google's Gemini API. Review Google's privacy policy.

## 🤝 Contributing

Contributions are welcome! Areas for improvement:

- Add more genetic rules (pharmacogenomics, rare diseases)
- Improve VCF parsing (handle full VCF format)
- Add more visualization options
- Implement PDF report generation
- Add internationalization (i18n)

## 📚 References

- [PharmGKB](https://www.pharmgkb.org/) - Pharmacogenomics knowledge base
- [ClinVar](https://www.ncbi.nlm.nih.gov/clinvar/) - Clinical variants database
- [CPIC Guidelines](https://cpicpgx.org/) - Clinical Pharmacogenetics Implementation Consortium

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built with:
- React, Vite, TypeScript
- Three.js, Framer Motion
- Google Gemini AI
- Tailwind CSS
- Zustand, React Router

---

**Made with ❤️ for accessible, privacy-first genetic health insights**

