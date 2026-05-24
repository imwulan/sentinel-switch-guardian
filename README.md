🛡️ Sentinel Switch Guardian
A modern full-stack web application built with React, TypeScript, and TanStack Start — featuring Solana wallet integration, Supabase backend, and deployment on Cloudflare Workers.

🌟 Features

Solana Wallet Integration — Connect with Phantom, Solflare, or Backpack wallets
Authentication & Database — Powered by Supabase (auth, storage, real-time)
Modern UI Components — Built with Radix UI primitives and Tailwind CSS v4
Type-Safe Routing — TanStack Router with file-based routing
Server-Side Rendering — TanStack Start for full-stack React
Edge Deployment — Deployed on Cloudflare Workers for global low-latency
Form Validation — React Hook Form + Zod schema validation
Data Fetching — TanStack Query for efficient server state management
Charts & Visualization — Recharts for data display
Dark/Light Theme — Full theming support


🛠️ Tech Stack
CategoryTechnologyFrameworkTanStack Start + React 19LanguageTypeScriptStylingTailwind CSS v4 + Radix UIDatabase & AuthSupabaseBlockchainSolana Web3.js + Wallet AdapterRoutingTanStack RouterState ManagementTanStack QueryBuild ToolVite 7DeploymentCloudflare Workers (Wrangler)Code QualityESLint + Prettier

⚙️ Prerequisites
Make sure you have these installed before starting:

Node.js v18 or higher
Bun (recommended) or npm
A Supabase project (for database & auth)
A Cloudflare account (for deployment)


🚀 Getting Started
1. Clone the repository
bashgit clone https://github.com/imwulan/sentinel-switch-guardian.git
cd sentinel-switch-guardian
2. Install dependencies
bashbun install
# or
npm install
3. Set up environment variables
Create a .env file at the root and fill in your Supabase credentials:
envVITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
4. Set up the database
Apply the Supabase migrations:
bashnpx supabase db push
5. Run the development server
bashbun run dev
# or
npm run dev
Open http://localhost:3000 in your browser.

📁 Project Structure
sentinel-switch-guardian/
├── src/                    # Application source code
│   ├── routes/             # File-based routing (TanStack Router)
│   ├── components/         # Reusable UI components
│   └── lib/                # Utilities & helpers
├── supabase/               # Supabase config & migrations
├── vite.config.ts          # Vite build configuration
├── wrangler.jsonc          # Cloudflare Workers config
├── tsconfig.json           # TypeScript configuration
├── components.json         # shadcn/ui component registry
└── package.json

📜 Available Scripts
CommandDescriptionbun run devStart Vite development serverbun run buildBuild for productionbun run startRun with Wrangler (Cloudflare) locally on port 5000bun run previewPreview production buildbun run lintRun ESLintbun run formatFormat code with Prettier

☁️ Deployment
This project is configured to deploy on Cloudflare Workers via Wrangler.
bash# Build first
bun run build

# Deploy to Cloudflare
npx wrangler deploy
Make sure to set your environment variables in the Cloudflare dashboard under Workers & Pages → Settings → Environment Variables.

🔗 Solana Wallet Support
The app supports the following Solana wallets out of the box:

Phantom
Solflare
Backpack


👩‍💻 Author
Sri Wulandari

GitHub: @imwulan


📄 License
This project is open source and available under the MIT License.
