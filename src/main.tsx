import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import App from "./App.tsx";
import { codeToHtml } from "shiki";
import { sections } from "./examples";

// Precompute highlighted HTML before rendering so the app shows highlighted code on first paint
const htmls = await Promise.all(
  // create all sections in parallel
  sections.map(async (section) => {
    try {
      return await codeToHtml(section.code, {
        lang: "javascript",
        theme: "nord",
        // include transformers to add data-line and highlight classes
        // https://shiki.style/guide/transformers#transformers
        transformers: [
          {
            code(node) {
              this.addClassToHast(node, `language-javascript`);
            },
            line(node, line) {
              node.properties["data-line"] = line;
              if (
                Array.isArray(section.highlightLines) &&
                section.highlightLines.includes(line)
              ) {
                this.addClassToHast(node, "highlight");
              }
            },
          },
        ],
      });
    } catch {
      return null;
    }
  })
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App initialHtmls={htmls} />
  </StrictMode>
);
