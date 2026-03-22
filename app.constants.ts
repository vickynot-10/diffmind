export const APP_URL = "https://diffmind.vercel.app"

export const FUNCTION_NODES: Record<string, Set<string>> = {
  javascript: new Set([
    "function_declaration",
    "method_definition",
    "arrow_function",
  ]),
  typescript: new Set([
    "function_declaration",
    "method_definition",
    "arrow_function",
  ]),
  python: new Set(["function_definition"]),
  go: new Set(["function_declaration", "method_declaration"]),
  rust: new Set(["function_item"]),
  java: new Set(["method_declaration", "constructor_declaration"]),
  cpp: new Set(["function_definition"]),
  ruby: new Set(["method", "singleton_method"]),
};

export const ASYNC_LANGUAGES = new Set(["javascript", "typescript"]);

export const ASYNC_PATTERNS: Record<string, RegExp> = {
  python: /\basync\s+def\b/,
  rust: /\basync\s+fn\b/,
  go: /\bgo\s+func\b/,
};

export const BRANCH_NODES: Record<string, Set<string>> = {
  javascript: new Set([
    "if_statement",
    "for_statement",
    "while_statement",
    "switch_statement",
    "catch_clause",
  ]),
  typescript: new Set([
    "if_statement",
    "for_statement",
    "while_statement",
    "switch_statement",
    "catch_clause",
  ]),
  python: new Set([
    "if_statement",
    "elif_clause",
    "for_statement",
    "while_statement",
    "except_clause",
  ]),
  go: new Set(["if_statement", "for_statement", "type_switch_statement"]),
  rust: new Set(["if_expression", "for_expression", "match_expression"]),
  java: new Set([
    "if_statement",
    "for_statement",
    "while_statement",
    "switch_statement",
    "catch_clause",
  ]),
  cpp: new Set([
    "if_statement",
    "for_statement",
    "while_statement",
    "switch_statement",
    "catch_clause",
  ]),
  ruby: new Set(["if", "elsif", "for", "while", "rescue"]),
};

export const SIDE_EFFECT_PATTERN =
  /\b(cache|logger|console|db\.|fs\.|emit|dispatch|setState|push|set\(|write)\b/;
