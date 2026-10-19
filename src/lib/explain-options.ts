import { z } from "zod";

export const LANGUAGES = ["Auto Detect", "Python", "Java", "JavaScript", "TypeScript", "C", "C++", "HTML", "CSS", "SQL"] as const;
export const DIFFICULTIES = ["beginner", "intermediate", "expert"] as const;
export const MAX_CODE_CHARS = 12000;

export const settingsSchema = z.object({
  detail: z.enum(["brief", "balanced", "detailed"]).default("balanced"),
  style: z.enum(["tutorial", "step-by-step", "technical"]).default("step-by-step"),
  examples: z.boolean().default(true),
  complexity: z.boolean().default(false),
  improvements: z.boolean().default(true),
  sampleIO: z.boolean().default(true),
  outputLanguage: z.enum(["English", "Hindi", "Hinglish"]).default("English"),
  customInstructions: z.string().trim().max(500).default(""),
});
export type ExplainSettings = z.infer<typeof settingsSchema>;
export const defaultSettings: ExplainSettings = settingsSchema.parse({});

export const explainInputSchema = z.object({
  code: z.string().refine((s) => s.trim().length > 0, "Please paste some code first.").pipe(z.string().max(MAX_CODE_CHARS, `Code is too long (max ${MAX_CODE_CHARS} characters).`)),
  language: z.enum(LANGUAGES),
  difficulty: z.enum(DIFFICULTIES),
  settings: settingsSchema,
});
export type ExplainInput = z.infer<typeof explainInputSchema>;

/** Very small heuristic language detector used for "Auto Detect". */
export function detectLanguage(code: string): string {
  const c = code;
  if (/^\s*<(!doctype|html|div|body|head|p|span)/im.test(c)) return "HTML";
  if (/#include\s*<iostream>|std::|cout\s*<</.test(c)) return "C++";
  if (/#include\s*<stdio\.h>|printf\s*\(/.test(c)) return "C";
  if (/public\s+static\s+void\s+main|System\.out\.println/.test(c)) return "Java";
  if (/^\s*(select|insert|update|delete|create\s+table)\b/im.test(c)) return "SQL";
  if (/:\s*(string|number|boolean)\b|interface\s+\w+\s*\{/.test(c)) return "TypeScript";
  if (/\bdef\s+\w+\(|^\s*import\s+\w+$|print\(|elif\b/m.test(c)) return "Python";
  if (/\b(const|let|var)\s+\w+|function\s+\w+\(|=>|console\.log/.test(c)) return "JavaScript";
  if (/^[\s.#\w-]+\{[^}]*:[^}]*\}/m.test(c)) return "CSS";
  return "Unknown";
}

export function makeTitle(code: string, language: string): string {
  const fn = code.match(/(?:def|function|class|void|int)\s+([A-Za-z_]\w*)/);
  if (fn) return `${language}: ${fn[1]}`;
  const first = code.split("\n").find((l) => l.trim())?.trim() ?? "Snippet";
  return `${language}: ${first.slice(0, 40)}`;
}
