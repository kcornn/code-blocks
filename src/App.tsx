import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";
import CopyAllIcon from "@mui/icons-material/CopyAll";
import "./App.css";

const exampleCode = `function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}`;

const longLineExampleCode = `function fetchUserProfileWithPermissionsAndPreferences(
  userId,
  includeSensitiveData,
  fallbackToCache = true,
  options = { retries: 3, timeout: 15000 }
) {
  const requestUrl = \`https://api.example.com/v1/users/\${userId}?includeSensitive=\${includeSensitiveData}&fallback=\${fallbackToCache}&retries=\${options.retries}&timeout=\${options.timeout}\`;

  return fetch(requestUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Client-Metadata": JSON.stringify({
        appVersion: "1.42.7-production-app-version-with-a-very-very-long-name",
        environment: "stg-us-east-1-env-with-a-very-very-long-name",
        featureFlags: ["experimental-user-preferences-synchronization", "extended-audit-logging-enabled"],
      }),
    },
  }).then(response =>
    response.ok
      ? response.json()
      : Promise.reject(
          new Error(
            \`Request failed with status \${response.status} while fetching metadata for userId=\${userId} from \${requestUrl}\`
          )
        )
  );
}`;

// navigator.clipboard.writeText(code)
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard
const handleCopyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error.message);
  }
};

type CodeblockProps = {
  code: string;
  language?: string;
  filename?: string;
  theme?: string;
  highlightLines?: number[];
};

const CodeBlock = ({
  code,
  language = "javascript",
  filename,
  theme = "nord",
  highlightLines = [],
}: CodeblockProps) => {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    const highlightCode = async () => {
      try {
        const highlightedHtml = await codeToHtml(code, {
          lang: language,
          theme,
          transformers: [
            // https://shiki.style/guide/transformers#transformers
            {
              code(node) {
                this.addClassToHast(node, `language-${language}`);
              },
              line(node, line) {
                node.properties["data-line"] = line;
                if (highlightLines.includes(line)) {
                  this.addClassToHast(node, "highlight");
                }
              },
            },
          ],
        });
        setHtml(highlightedHtml);
      } catch (error) {
        console.error("Error highlighting code:", error);
      }
    };

    highlightCode();
  }, [code, language, theme, highlightLines]);

  if (!html) return; // when loading html

  return (
    <div className="code-block-figure-wrapper">
      <figure className="code-block-figure" aria-label="code block">
        <>
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
            <div
              className="highlighted-code"
              dangerouslySetInnerHTML={{
                __html: html,
              }}
            />
          </div>
        </>
      </figure>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <p>Custom codeblock component powered by Shiki - very WIP</p>
      <a href="https://kcornn.github.io/">Back to portfolio</a>
      <CodeBlock
        code={longLineExampleCode}
        filename={"demo.js"}
        language={"javascript"}
        highlightLines={[2, 4, 5]}
      />
      <CodeBlock
        code={exampleCode}
        filename={"demo.js"}
        language={"javascript"}
        highlightLines={[2, 3, 4]}
      />
    </div>
  );
}

export default App;
