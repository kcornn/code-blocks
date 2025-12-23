import { useEffect, useState, useRef } from "react";
import { codeToHtml } from "shiki";
import CopyAllIcon from "@mui/icons-material/CopyAll";
import "./App.css";
import { sections } from "./examples";
import type { CodeBlockProps } from "./types";
import { handleCopyCode } from "./utils";

const CodeBlock = ({ html, code, filename }: CodeBlockProps) => {
  return (
    <div className="code-block-figure-wrapper">
      <figure className="code-block-figure" aria-label="code block">
        <div className={"header"}>
          <div className={"header-left"}>
            {filename && <span>{filename}</span>}
          </div>
          <button
            className="copy-btn"
            aria-label="Copy code to clipboard"
            onClick={() => handleCopyCode(code)}
          >
            <CopyAllIcon />
          </button>
        </div>
        <div className="code-block-wrapper">
          {html ? (
            <div
              className="highlighted-code"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <pre className="code-fallback">{code}</pre>
          )}
        </div>
      </figure>
    </div>
  );
};

function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [htmls, setHtmls] = useState<(string | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Precompute highlighted HTML for all sections so switching sections is instant
  useEffect(() => {
    let mounted = true;
    const work = async () => {
      const results: (string | null)[] = [];
      for (const section of sections) {
        try {
          // include transformers to add data-line and highlight classes
          // eslint-disable-next-line no-await-in-loop
          const sectionHtml = await codeToHtml(section.code, {
            lang: "javascript",
            theme: "nord",
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
          results.push(sectionHtml);
        } catch {
          results.push(null);
        }
      }
      if (mounted) setHtmls(results);
    };
    work();
    return () => {
      mounted = false;
    };
  }, []);

  // scroll handler picks the section that fills the viewport (page-like)
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      // https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
      // might be slightly better than IntersectionObserver - no thresholds to tune
      requestAnimationFrame(() => {
        const nodes = Array.from(
          containerRef.current?.querySelectorAll(".note-section") ?? []
        ) as HTMLElement[];
        if (nodes.length === 0) {
          // no sections
          ticking = false;
          return;
        }

        // anchor point (a little below top so first section registers reliably)
        const anchor = (window.innerHeight || 800) * 0.15;
        let bestIdx = 0;
        let bestDist = Infinity;
        nodes.forEach((n, i) => {
          const rect = n.getBoundingClientRect();
          const dist = Math.abs(rect.top - anchor);
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = i;
          }
        });
        setActiveIndex((prev) => (prev === bestIdx ? prev : bestIdx));
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true }); // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#passive
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [htmls]);

  return (
    <div className="App two-column">
      <div className="left">
        <div className="sticky-wrapper">
          <div className="meta">
            <p>
              Custom codeblock (+ notes) component powered by Shiki - very WIP
            </p>
            <a href="https://kcornn.github.io/">Back to portfolio</a>
          </div>
          <CodeBlock
            html={htmls[activeIndex] ?? null}
            code={sections[activeIndex].code}
            filename={sections[activeIndex].filename}
          />
        </div>
      </div>

      <div className="right" ref={containerRef}>
        {sections.map((s, i) => (
          <section
            className={`note-section ${i === activeIndex ? "active" : ""}`}
            key={s.id}
            data-idx={i}
          >
            <h2>{s.title}</h2>
            <p>{s.note}</p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
              nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi.
              Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum.
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}

export default App;
