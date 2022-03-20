export const tryParseJson = (message: unknown) => {
  if (typeof message !== "string") return;
  try {
    return JSON.parse(message);
  } catch { /* do nothing */ }
};
