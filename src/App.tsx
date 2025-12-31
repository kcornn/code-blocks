import { useEffect, useState, useRef } from "react";
import CopyAllIcon from "@mui/icons-material/CopyAll";
import { sections } from "./examples";
import type { CodeBlockProps } from "./types";
import { handleCopyCode } from "./utils";

const CodeBlock = ({ html, code, filename }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    const hasCopied = await handleCopyCode(code);
    if (hasCopied) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

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
            onClick={onCopy}
          >
            <CopyAllIcon />
          </button>
          {copied && <div className="copy-toast">Copied!</div>}
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

function App({ initialHtmls }: { initialHtmls?: (string | null)[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [htmls] = useState<(string | null)[]>(initialHtmls ?? []);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isLoading, setIsLoading] = useState(() => {
    const arr = initialHtmls ?? [];
    return arr.length === 0 || arr.some((h) => h === null);
  });

  // if initialHtmls prop changes, update loading state
  useEffect(() => {
    const arr = initialHtmls ?? [];
    if (arr.length > 0 && !arr.some((h) => h === null)) {
      setIsLoading(false);
    }
  }, [initialHtmls]);

  // Some shiki themes/styles may be injected asynchronously on first use.
  // Render the already-computed HTML on a second animation frame to avoid
  // briefly showing unstyled content. This mirrors the user-observed
  // behavior where scrolling (a later render) causes highlighting to appear.
  const [displayHtmls, setDisplayHtmls] = useState<(string | null)[]>([]);
  useEffect(() => {
    let raf = 0 as number | null;
    if (htmls.length > 0) {
      raf = requestAnimationFrame(() => {
        setDisplayHtmls(htmls);
        setIsLoading(false);
      });
    }
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [htmls]);

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
      {isLoading && (
        <div className="loading-overlay" role="status" aria-live="polite">
          <div className="loader" aria-hidden="true" />
          <div className="loading-text">Loading highlights…</div>
        </div>
      )}
      {!isLoading && (
        <>
          <div className="left">
            <div className="sticky-wrapper">
              <div className="meta">
                <p>
                  Custom codeblock (+ notes) component powered by Shiki - very
                  WIP
                </p>
                <a href="https://kcornn.github.io/">Back to portfolio</a>
              </div>
              <CodeBlock
                html={displayHtmls[activeIndex] ?? null}
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
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
