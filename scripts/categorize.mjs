const rx = (...parts) => new RegExp(parts.join("|"), "i");

const LIST = rx("awesome", "curated list", "curated index", "directory of");
const SDK = rx("(?<!ai-)\\bsdk\\b", "\\bclient\\b", "client for", "library for", "\\bport\\b", "wrapper", "typed layer", "derive layer", "\\bdsl\\b", "for otp\\b", "genserver");
const INTEGRATION = rx("home assistant", "laravel", "\\brails\\b", "\\bn8n\\b", "\\bneon\\b", "postgres", "pydantic", "mellea", "letta", "agent zero", "langgraph", "litellm", "rubyllm", "llamaindex", "llama-index", "langchain", "shadcn", "google sheets", "\\bzsh\\b", "\\bfish\\b", "extension for .*(vs ?code|vim|emacs)");
const BROWSER = rx("browser", "computer.?use", "playwright", "chrome", "(chrome|firefox|safari|web) extension", "android", "mobile (agent|automation|control|mcp)", "hyprland", "\\bocr\\b", "adblock", "ad blocker", "\\bdom\\b");
const AGENT = rx("\\bmcp\\b", "\\bpi\\b", "claude code", "codex", "hermes", "\\bomp\\b", "opencode", "coding agent", "agent skill", "\\bskill", "tool.?call", "guardrail", "\\bgate\\b", "router", "routing", "code.?review", "\\breview", "\\blint", "\\bhook\\b", "harness", "cursor", "antigravity", "triage", "stop hook", "coprocessor", "compaction", "context.?prun", "agents?\\b", "\\bacp\\b");
const GAME = rx("\\bgame", "tetris", "snake", "mario", "doom", "chess", "pong", "pac-?man", "gomoku", "omok", "2048", "rubik", "starcraft", "civilization", "minecraft", "arena", "\\bnpc", "drone", "mujoco", "rover", "robot", "\\barm\\b", "quadrotor", "terrarium", "river raid", "ping pong", "brick breaker", "t-rex", "shooter", "\\btown\\b", "playstation", "emulator", "simulation", "car sim", "autopilot", "roblox");
const RESEARCH = rx("benchmark", "\\bbench\\b", "\\beval", "\\bstudy\\b", "research", "calibrat", "open.?jev", "replica", "re-?creation", "reproduc", "\\bpaper\\b", "rlcd", "system-one-open", "gemma", "qwen", "modernbert", "\\bmlx\\b", "experiment", "exploration", "laptop", "behavior", "\\breport\\b", "comparison", "\\bvs\\b", "evaluation", "diffusion", "forecast", "open decision model", "open models", "local llm", "not affiliated with jev");
const STRONG_RESEARCH = rx("benchmark", "\\bbench\\b", "\\beval", "rlcd", "open.?jev", "replica", "re-?creation", "reproduc", "modernbert", "\\bmlx\\b", "not affiliated with jev", "open decision model", "audit");
const STRONG_SDK = rx("(?<!ai-)\\bsdk\\b", "\\bdsl\\b", "client for the", "idiomatic .*(client|sdk)", "for otp\\b", "unofficial .*client");
const DEMO = rx("playground", "\\bdemo", "\\blab\\b", "\\btry\\b", "\\btest\\b", "showcase", "first step", "starter", "fun project", "\\bpoc\\b", "proof of concept");

export function categorize(repo) {
  const fullName = repo.full_name || repo.repo || "";
  if (fullName.startsWith("typesafe-ai/")) return "official";
  const text = `${fullName} ${repo.description || ""} ${(repo.topics || []).join(" ")}`;
  if (LIST.test(text)) return "lists";
  if (STRONG_RESEARCH.test(text) && !/\bmcp server\b/i.test(text)) return "research";
  if (STRONG_SDK.test(text) && !/\bmcp\b/i.test(text)) return "sdks";
  if (SDK.test(text) && !AGENT.test(text) && !BROWSER.test(text)) return "sdks";
  if (INTEGRATION.test(text)) return "integrations";
  if (BROWSER.test(text)) return "browser";
  if (/playground|\bdemo\b/i.test(text)) return "demos";
  if (RESEARCH.test(text)) return "research";
  if (GAME.test(text)) return "games";
  if (AGENT.test(text)) return "agents";
  if (DEMO.test(text) || repo.homepage) return "demos";
  return "apps";
}

export const RELEVANT = /\b(jev|typesafe\.ai|typesafe ai|typesafe-ai|typesafeai|system one)\b/i;
export const JEV_LAUNCH = "2026-09-10";
