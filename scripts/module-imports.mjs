/** Discover source-level imports without mistaking `.import()` member calls for dynamic imports. */
export function moduleImportSpecifiers(source) {
  const pattern = /(?:^\s*import\s+(?:[^;\n]*?\sfrom\s*)?|(?<![\w.$])\bimport\s*\(\s*)['"]([^'"]+)['"]/gm;
  return Array.from(source.matchAll(pattern), match => match[1]);
}
