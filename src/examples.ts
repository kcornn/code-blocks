import type { Section } from "./types";

export const exampleCode = `function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}`;

export const longLineExampleCode = `function fetchUserProfileWithPermissionsAndPreferences(
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

export const sections: Section[] = [
  {
    id: "intro",
    title: "Debounce utility",
    note: "A simple debounce helper to avoid frequent calls.",
    code: exampleCode,
    filename: "debounce.js",
    highlightLines: [2, 3, 4],
  },
  {
    id: "fetch",
    title: "Fetch user profile",
    note: "A longer example showing options, headers, and error handling.",
    code: longLineExampleCode,
    filename: "fetchUser.js",
    highlightLines: [2, 4, 5],
  },
];
