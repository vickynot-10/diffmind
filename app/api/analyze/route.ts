import { NextRequest, NextResponse } from "next/server";
import Parser from "web-tree-sitter";
import Groq from "groq-sdk"
import path from "path";
import {
  FUNCTION_NODES,
  ASYNC_LANGUAGES,
  ASYNC_PATTERNS,
  SIDE_EFFECT_PATTERN,
  BRANCH_NODES,
} from "@/app.constants";

export async function POST(req: NextRequest) {
  try {
    const { oldCode, newCode, language } = await req.json();

    if (!oldCode?.trim() || !newCode?.trim()) {
      return NextResponse.json(
        { msg: "Both old and new code are required" },
        { status: 400 },
      );
    }

    await Parser.init({
      locateFile(scriptName: string) {
        return path.join(process.cwd(), "public/wasm", scriptName);
      },
    });

    const parser = new Parser();

    const langPath = path.join(
      process.cwd(),
      `public/wasm/tree-sitter-${language}.wasm`,
    );

    const Lang = await Parser.Language.load(langPath);
    parser.setLanguage(Lang);

    const oldTree = parser.parse(oldCode);
    if (!oldTree) {
      return NextResponse.json(
        {
          msg: "Error Parsing Old Code",
        },
        {
          status: 400,
        },
      );
    }
    const newTree = parser.parse(newCode);

    if (!newTree) {
      return NextResponse.json(
        {
          msg: "Error Parsing New Code",
        },
        {
          status: 400,
        },
      );
    }

    const oldFacts: any[] = extractNodes(oldTree.rootNode, oldCode, language);
    const newFacts: any[] = extractNodes(newTree.rootNode, newCode, language);

    const diff_facts = DiffFacts(oldFacts, newFacts);

    const analysis = await GetAIResponse(diff_facts, language, oldCode, newCode)

    return NextResponse.json({ analysis, "isFetched": true }, { status: 200 })


  } catch (e: any) {

    return NextResponse.json(
      { error: e?.message ?? String(e) },
      { status: 500 },
    );
  }
}

function walkIterative(root: any, visit: (n: any) => void) {
  const stack: any[] = [root];

  while (stack.length > 0) {
    const node = stack.pop();

    visit(node);

    for (let i = node.childCount - 1; i >= 0; i--) {
      stack.push(node.child(i));
    }
  }
}

function extractNodes(root_node: any, code: string, language: string): any[] {
  if (!root_node || !code || !language) return [];

  const fn_type = FUNCTION_NODES[language] ?? FUNCTION_NODES.javascript;
  const functions_arr: any[] = [];
  function iterativeFn(n: any) {
    if (!fn_type.has(n.type)) {
      return;
    }
    if (n.type === "arrow_function" && !n.childForFieldName("name")) return;
    const fn_name =
      n.childForFieldName("identifier")?.text ??
      n.childForFieldName("name")?.text ??
      "Anonymous";
    const params = n.childForFieldName("parameters");
    const body = n.childForFieldName("body");
    const fnText = code.slice(n.startIndex, n.endIndex);

    functions_arr.push({
      function_name: fn_name,
      isAsync: ASYNC_LANGUAGES.has(language)
        ? fnText.includes("async")
        : (ASYNC_PATTERNS[language]?.test(fnText) ?? false),
      paramCount: params?.namedChildCount ?? 0,
      complexity: CountComplexity(body, language),
      hasSideEffects: SIDE_EFFECT_PATTERN.test(fnText),
      calls: ExtractCalls(body),
    });
  }

  walkIterative(root_node, iterativeFn);

  return functions_arr;
}

function CountComplexity(body_node: any, language: string) {
  if (!body_node) return 1;

  const branch_type = BRANCH_NODES[language] ?? BRANCH_NODES.javascript;

  let count = 1;
  function IterativeFn_Complexity(n: any) {
    if (branch_type.has(n.type)) {
      count++;
    }
  }
  walkIterative(body_node, IterativeFn_Complexity);
  return count;
}

function ExtractCalls(body_node: any) {
  if (!body_node) return [];
  const calls = new Set();
  function IterativeFn_Calls(node: any) {
    if (node.type === "call_expression") {
      const fn = node.childForFieldName("function");
      if (fn && fn.text) {
        calls.add(fn.text);
      }
    }
  }
  walkIterative(body_node, IterativeFn_Calls);
  return [...calls];
}

function DiffFacts(old_facts: any[], new_facts: any[]) {
  const results = [];
  const oldMap = new Map();
  const newMap = new Map();
  for (let i = 0; i < old_facts.length; i++) {
    const fact = old_facts[i];
    oldMap.set(fact.function_name, fact);
  }

  for (let j = 0; j < new_facts.length; j++) {
    const fact = new_facts[j];
    newMap.set(fact.function_name, fact);
  }

  for (const [name, newFn] of newMap) {
    const oldFn = oldMap.get(name);
    if (!oldFn) {
      results.push({
        name,
        type: "added",
        changes: [],
        facts: {
          isAsync: newFn.isAsync,
          paramCount: newFn.paramCount,
          complexity: newFn.complexity,
          hasSideEffects: newFn.hasSideEffects,
          calls: newFn.calls,
        }
      })
      continue
    }

    const changes: any[] = [];

    if (oldFn.isAsync !== newFn.isAsync) {
      changes.push({
        field: "isAsync",
        from: oldFn.isAsync,
        to: newFn.isAsync,
      });
    }

    if (oldFn.paramCount !== newFn.paramCount) {
      changes.push({
        field: "paramCount",
        from: oldFn.paramCount,
        to: newFn.paramCount,
      });
    }

    if (oldFn.complexity !== newFn.complexity) {
      changes.push({
        field: "complexity",
        from: oldFn.complexity,
        to: newFn.complexity,
      });
    }

    if (oldFn.hasSideEffects !== newFn.hasSideEffects) {
      changes.push({
        field: "hasSideEffects",
        from: oldFn.hasSideEffects,
        to: newFn.hasSideEffects,
      });
    }

    const oldCalls = new Set(oldFn.calls);
    const newCalls = new Set(newFn.calls);

    const addedCalls = newFn.calls.filter((c: string) => !oldCalls.has(c));
    const removedCalls = oldFn.calls.filter((c: string) => !newCalls.has(c));

    if (addedCalls.length) {
      changes.push({ field: "addedCalls", value: addedCalls });
    }
    if (removedCalls.length) {
      changes.push({ field: "removedCalls", value: removedCalls });
    }

    if (changes.length) {
      results.push({ name, type: "modified", changes });
    }
  }

  for (const [name] of oldMap) {
    if (!newMap.has(name)) results.push({ name, type: "removed", changes: [] });
  }
  return results;
}

async function GetAIResponse(
  diff: any[],
  language: string,
  old_code: string,
  new_code: string,
) {
  const aiKey = process.env.GROK_API_KEY;
  if (!aiKey) {
    return "AI API key is not sets";
  }
  const client = new Groq({
    apiKey: aiKey,
  });
  const prompt = `You are a senior code reviewer. Analyze these ${language} function changes.

OLD CODE:
${old_code}

NEW CODE:
${new_code}

STRUCTURED DIFF (AST analysis):
${JSON.stringify(diff, null, 2)}

For each changed function return a JSON array:
[
  {
    "name": "functionName",
    "severity": "breaking" | "warning" | "info",
    "summary": "one line explanation",
    "details": "what changed and why it matters",
    "risk": "specific actionable improvement, not obvious failure states",
    "fixes": [
      {
        "title": "short fix title",
        "description": "why this fix matters",
        "code": "actual improved code snippet"
      }
    ]
  }
]

Rules:
- breaking = callers will break without changes
- warning = behavior changed, callers should review
- info = minor improvement or refactor
- For "added" functions: describe what it does and suggest improvements or missing patterns
- risk must be ACTIONABLE: missing try/catch, no timeout, no retry logic, no cache invalidation, missing validation
- fixes array must have 1-3 concrete improvements with real working code snippets
- code in fixes must be actual ${language} code, not pseudocode
- If async added but no await in body, flag as breaking and mention it is unnecessary
- Be concise, no fluff
- Return ONLY the JSON array, no markdown, no extra text`
  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1024,
  })
  return response.choices[0].message.content
}
