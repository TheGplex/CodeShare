import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import java from "highlight.js/lib/languages/java";
import csharp from "highlight.js/lib/languages/csharp";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import ruby from "highlight.js/lib/languages/ruby";
import php from "highlight.js/lib/languages/php";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import scss from "highlight.js/lib/languages/scss";
import json from "highlight.js/lib/languages/json";
import yaml from "highlight.js/lib/languages/yaml";
import markdown from "highlight.js/lib/languages/markdown";
import bash from "highlight.js/lib/languages/bash";
import powershell from "highlight.js/lib/languages/powershell";
import sql from "highlight.js/lib/languages/sql";
import graphql from "highlight.js/lib/languages/graphql";
import lua from "highlight.js/lib/languages/lua";
import kotlin from "highlight.js/lib/languages/kotlin";
import swift from "highlight.js/lib/languages/swift";
import scala from "highlight.js/lib/languages/scala";
import dart from "highlight.js/lib/languages/dart";
import elixir from "highlight.js/lib/languages/elixir";
import haskell from "highlight.js/lib/languages/haskell";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import plaintext from "highlight.js/lib/languages/plaintext";

let registered = false;
function ensureRegistered() {
  if (registered) return;
  hljs.registerLanguage("javascript", javascript);
  hljs.registerLanguage("typescript", typescript);
  hljs.registerLanguage("python", python);
  hljs.registerLanguage("go", go);
  hljs.registerLanguage("rust", rust);
  hljs.registerLanguage("java", java);
  hljs.registerLanguage("csharp", csharp);
  hljs.registerLanguage("c", c);
  hljs.registerLanguage("cpp", cpp);
  hljs.registerLanguage("ruby", ruby);
  hljs.registerLanguage("php", php);
  hljs.registerLanguage("xml", xml);
  hljs.registerLanguage("html", xml);
  hljs.registerLanguage("css", css);
  hljs.registerLanguage("scss", scss);
  hljs.registerLanguage("less", scss);
  hljs.registerLanguage("json", json);
  hljs.registerLanguage("yaml", yaml);
  hljs.registerLanguage("markdown", markdown);
  hljs.registerLanguage("bash", bash);
  hljs.registerLanguage("powershell", powershell);
  hljs.registerLanguage("sql", sql);
  hljs.registerLanguage("graphql", graphql);
  hljs.registerLanguage("lua", lua);
  hljs.registerLanguage("kotlin", kotlin);
  hljs.registerLanguage("swift", swift);
  hljs.registerLanguage("scala", scala);
  hljs.registerLanguage("dart", dart);
  hljs.registerLanguage("elixir", elixir);
  hljs.registerLanguage("haskell", haskell);
  hljs.registerLanguage("dockerfile", dockerfile);
  hljs.registerLanguage("plaintext", plaintext);
  registered = true;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function highlight(content: string, language?: string | null): string {
  ensureRegistered();
  if (!language || !hljs.getLanguage(language)) {
    return escapeHtml(content);
  }
  try {
    return hljs.highlight(content, { language, ignoreIllegals: true }).value;
  } catch {
    return escapeHtml(content);
  }
}

// Server component — pre-rendered HTML, no client JS.
export function CodeViewer({
  content,
  language,
}: {
  content: string;
  language?: string | null;
}) {
  const html = highlight(content, language);
  const lines = html.split("\n");
  // Trim a trailing empty line if file ends with \n
  if (lines.length > 1 && lines[lines.length - 1] === "") lines.pop();

  return (
    <div className="code-block hljs">
      {lines.map((line, i) => (
        <div className="row" key={i}>
          <div className="ln">{i + 1}</div>
          <pre
            className="lc"
            // line is hljs-escaped output, safe to inject
            dangerouslySetInnerHTML={{ __html: line || " " }}
          />
        </div>
      ))}
    </div>
  );
}
