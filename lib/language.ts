// Map filename / extension to a language id usable by Monaco and highlight.js.

const EXT_TO_LANG: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  py: "python",
  rb: "ruby",
  go: "go",
  rs: "rust",
  java: "java",
  kt: "kotlin",
  swift: "swift",
  c: "c",
  h: "c",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  hpp: "cpp",
  cs: "csharp",
  php: "php",
  html: "html",
  htm: "html",
  css: "css",
  scss: "scss",
  sass: "scss",
  less: "less",
  json: "json",
  jsonc: "json",
  yaml: "yaml",
  yml: "yaml",
  toml: "toml",
  md: "markdown",
  markdown: "markdown",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  fish: "bash",
  ps1: "powershell",
  sql: "sql",
  graphql: "graphql",
  gql: "graphql",
  xml: "xml",
  svg: "xml",
  dockerfile: "dockerfile",
  vue: "html",
  svelte: "html",
  lua: "lua",
  r: "r",
  scala: "scala",
  dart: "dart",
  ex: "elixir",
  exs: "elixir",
  erl: "erlang",
  hs: "haskell",
  pl: "perl",
  vim: "vim",
  ini: "ini",
  cfg: "ini",
  conf: "ini",
  env: "bash",
};

export const SUPPORTED_LANGUAGES = [
  "typescript",
  "javascript",
  "python",
  "go",
  "rust",
  "java",
  "c",
  "cpp",
  "csharp",
  "ruby",
  "php",
  "html",
  "css",
  "scss",
  "json",
  "yaml",
  "markdown",
  "bash",
  "powershell",
  "sql",
  "graphql",
  "xml",
  "lua",
  "kotlin",
  "swift",
  "scala",
  "dart",
  "elixir",
  "haskell",
  "plaintext",
] as const;

export function detectLanguage(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower === "dockerfile" || lower.startsWith("dockerfile.")) {
    return "dockerfile";
  }
  if (lower === "makefile") return "makefile";
  const dot = lower.lastIndexOf(".");
  if (dot < 0) return "plaintext";
  const ext = lower.slice(dot + 1);
  return EXT_TO_LANG[ext] ?? "plaintext";
}

export function languageLabel(lang: string | null | undefined): string {
  if (!lang) return "Plain";
  if (lang === "cpp") return "C++";
  if (lang === "csharp") return "C#";
  if (lang === "javascript") return "JavaScript";
  if (lang === "typescript") return "TypeScript";
  return lang.charAt(0).toUpperCase() + lang.slice(1);
}
