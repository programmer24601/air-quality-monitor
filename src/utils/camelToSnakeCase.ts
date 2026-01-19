export const camelToSnakeCase = (string: string) =>
  string.replace(/[A-Z]/g, (upperCaseLetter) => `_${upperCaseLetter.toLowerCase()}`);