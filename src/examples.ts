import type { Section } from "./types";

export const debounceExample = `function debounce(fn, t) {
    let timeout;
    // Every time the returned function is called, 
    // clearTimeout is called to reset the timer to t milliseconds.
    return function(...args) {
      // every time the function is triggered again before the delay is over, 
      // reset the timer since the delay hasn't actually happened yet.
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), t);
    }
};`;

export const throttleExample = `function throttle(fn, t) {
    let timer;
    let nextTimeToCallFn = 0;
    return function (...args) {
        // either call function now or after a delay
        const delay = Math.max(0, nextTimeToCallFn - Date.now())
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn(...args);
            // update nextTimeToCallFn to t ms in the future.
            nextTimeToCallFn = Date.now() + t;
        }, delay); // after waiting delay ms, call fn.
    }
};`;

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
    id: "debounce",
    title: "Debounce utility",
    note: `A simple debounce helper to avoid frequent calls. For a given delay of t milliseconds, it ensures that a function is only called once no calls have been made for t milliseconds. We use timeout to store the timer id and clearTimeout to reset it. Mnemonic: debounce delays until the bouncing stops.`,
    code: debounceExample,
    filename: "debounce.js",
    highlightLines: [9],
  },
  {
    id: "throttle",
    title: "Throttle utility",
    note: `A simple throttle helper to avoid frequent calls. For a given delay of t milliseconds, it ensures that a function is called at most once every t milliseconds, even if the event happens multiple times in quick succession, like scrolling.`,
    code: throttleExample,
    filename: "throttle.js",
    highlightLines: [5, 6],
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
