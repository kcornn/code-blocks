// navigator.clipboard.writeText(code)
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard
export const handleCopyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code);
    return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error.message);
    return false;
  }
};
