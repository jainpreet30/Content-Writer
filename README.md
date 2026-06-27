# ⚡ Content Writer: Advanced SEO & AI-Powered Copywriting Engine

Content Writer is a high-fidelity, interactive **Next.js (App Router)** wizard that guides users through a comprehensive 14-step workflow to research, outline, structure, and write highly optimized SEO content.

Integrating advanced text scanners, dynamic scoring formulas, and multi-model AI orchestration (OpenAI, Gemini, DeepSeek), the application operates as an elite copilot for digital marketers and SEO professionals. It calculates keyword density, heading budgets, entities, n-grams, and LSI terms in real-time, feeding a compiled system prompt into the content generator or letting the writer work in a fully equipped workspace.

---

## 🏗️ Architectural Overview & Core Workflow

The platform follows a decoupled state design powered by **Zustand** with storage persistence. This allows users to exit the app or refresh the browser without losing their progress across the 14-step wizard.

```
[Step 0-3: Research & Outline] ➔ [Step 4-9: NLP & Keyword Extraction] ➔ [Step 10-12: Prompt & Rules] ➔ [Step 13: Live Editor Workspace]
```

### 1. The 14-Step Wizard Steps
*   **Step 0: Competitor Research** – Define your primary keyword. Run SERP searches utilizing Google Search via the `Serper.dev` API, or manually enter competitor URLs.
*   **Step 1: Outline Creation** – Build a modular heading structure. Drag-and-drop layout ordering is handled via `@hello-pangea/dnd`, with dropdowns to toggle levels (`H2`, `H3`, `H4`).
*   **Step 2: Word Count Budgets** – Assign target word counts to each heading. Outlines are mapped to numerical inputs. The app can batch-assign standard budgets (e.g., 150, 200, 300, 500 words per section) or calculate them using AI.
*   **Step 3: Competitor Content** – Fetch and analyze raw HTML from competitor URLs. Content is scraped and parsed via **Cheerio** to extract structural elements.
*   **Step 4: Style Analytics Engine** – Analyze competitor text blocks to extract Writing Tone, Sentence Style, Vocabulary Level, and Content Structure.
*   **Step 5: Entities Scanner** – Extract competitor entities (capitalized brand/tool words) and cross-reference them with AI recommendations to build an optimization list.
*   **Step 6: N-Grams Filter** – Tokenize competitor text to extract common word sequences ($n=1, 2, 3$). Active/exclusion lists let you filter out noise with visual strikethrough states.
*   **Step 7: NLP Keywords (LSI)** – Extract and filter Latent Semantic Indexing terms to support search engine topical indexing.
*   **Step 8: Skip-Grams Finder** – Scrapes word pairs frequently appearing within a fixed sliding distance window (words separated by 1 or 2 tokens).
*   **Step 9: Auto-Suggest Loops** – An asynchronous loop appends character maps (`a-z`, `0-9`) to your primary keyword, querying Google Autocomplete to generate long-tail keyword variations.
*   **Step 10: Grammar Generator** – Configure specific grammar parameters and styling instructions.
*   **Step 11: SEO Writing Rules** – Enable/disable 20 advanced copywriting directives (e.g., *Answer First*, *Avoid Coreference Errors*, *No Analogies*, *Cut the Fluff*, *If Statements Second*).
*   **Step 12: AI Core Instructions** – Set parameters like conciseness, natural phrasing, AI footprint avoidance, and append custom developer directions.
*   **Step 13: Master Prompt Compiler** – Review and copy the compiled system prompt mapping the keywords, outline target budgets, style guidelines, and rules.
*   **Step 14: Live Content Editor** – A split-screen workspace featuring a **TipTap** editor (70% width) and an interactive SEO optimization sidebar (30% width).

---

## ⚡ Core Technical Features

### 📊 Live SEO Optimization Score
The sidebar calculates an live content optimization score out of 100 points, updating automatically as you type:

$$\text{Total SEO Score} = \text{Score}_{\text{Keywords}} (40\%) + \text{Score}_{\text{WordCount}} (30\%) + \text{Score}_{\text{Headings}} (20\%) + \text{Score}_{\text{Media}} (10\%)$$

*   **Keyword Scoring (40%)**: Calculates densities of all active keywords. It rewards keywords that stay within the optimal density range ($0.2\% - 3.0\%$) and penalizes keyword stuffing ($>3.0\%$).
*   **Word Count Scoring (30%)**: Matches the editor's word count against the sum of heading target word budgets.
*   **Heading Structure (20%)**: Checks if the editor matches the subheadings defined in your outline.
*   **Media Score (10%)**: Checks for the presence of relevant images in the content.

### 🛡️ Smart Offline Fallback Heuristics
If API keys (OpenAI, Gemini, DeepSeek, Serper) are not configured, the application remains fully functional through sophisticated local fallbacks:
*   **Offline Article Generator**: Generates high-fidelity, natural-sounding, 1500+ word draft articles using contextual, multi-paragraph generation templates that inject your target entities and n-grams.
*   **Word Count Allocator**: A position-aware heading budget calculator that weights sections by header level (`H2` vs `H4`), reduces budgets for intro/outro blocks, applies keyword density multipliers, and uses a character-hash variance to deliver realistic target distributions.
*   **Local NLP Tokenizer**: Tokenizes text, filters English stop-words, extracts n-grams/skip-grams, and recognizes capital-letter entities and category groups (e.g., Tech, Finance, Health) locally.

### ✍️ Live Editor & AI Optimizer
*   **TipTap Rich Text Suite**: Built with support for heading formats, alignments, bold, italics, lists, and images.
*   **Google Images Search**: Hits Serper.dev's image search engine to retrieve relevant graphics, dynamically filtering out logos, vector files, watermarks, and icons to maintain editorial design.
*   **AI Rewrite & Optimize**: Sends your draft, SEO rules, and keyword recommendations back to the LLM to automatically expand sections, naturally integrate under-optimized phrases, and reduce stuffed ones.

---

## 🛠️ Technology Stack

*   **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (using `@tailwindcss/postcss`)
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand) (with `persist` middleware for local storage caching)
*   **Editor Engine**: [TipTap Editor Core](https://tiptap.dev/) (`StarterKit`, `ExtensionImage`)
*   **HTML Scraper**: [Cheerio](https://cheerio.js.org/)
*   **Animations**: [Canvas Confetti](https://github.com/catdad/canvas-confetti)
*   **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### 📋 Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18.x or later) installed on your system.

### 💻 Installation
1. Clone the repository to your local machine:
   ```bash
   git clone <repository-url>
   cd Content-Writer
   ```

2. Install the project dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your API credentials:
   ```env
   # LLM Providers (Optional - can also be configured in the UI)
   OPENAI_API_KEY=your_openai_key_here
   GEMINI_API_KEY=your_gemini_key_here
   DEEPSEEK_API_KEY=your_deepseek_key_here

   # Search and Autocomplete Providers (Optional)
   SERPER_API_KEY=your_serper_key_here
   ```

### 🏃 Running Locally
Start the local Next.js development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to access the Content Writer suite.

### 📦 Building for Production
To optimize and compile the app for production deployment:
```bash
npm run build
npm run start
```

---

## ⚙️ Configuration & Environment Variables

The application can retrieve API keys from two sources:
1.  **Environment Variables**: Configured in `.env.local` (ideal for personal setups or static server deployments).
2.  **In-App Settings Modal**: Accessible by clicking **API Keys** in the header. Saved keys are stored locally within the browser session for privacy and security.

| Variable Name | Provider | Purpose | Fallback Behavior |
| :--- | :--- | :--- | :--- |
| `OPENAI_API_KEY` | OpenAI | Powers AI Content Generation and Optimization (via `gpt-4o-mini`). | Falls back to Gemini or DeepSeek, then to Offline Generation. |
| `GEMINI_API_KEY` | Google Gemini | Powers AI Content Generation and Filtering (via `gemini-2.5-flash`). | Falls back to OpenAI or DeepSeek, then to Offline Heuristics. |
| `DEEPSEEK_API_KEY` | DeepSeek | Powers AI Content Generation and Style Analysis (via `deepseek-chat`). | Falls back to OpenAI or Gemini, then to Offline Heuristics. |
| `SERPER_API_KEY` | Serper.dev | Fetches real-time SERP competitor URLs and Google Images search results. | Falls back to manual inputs and Unsplash stock photos. |

---

## 📄 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
