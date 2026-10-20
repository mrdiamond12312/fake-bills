import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import csharp from 'highlight.js/lib/languages/csharp';
import go from 'highlight.js/lib/languages/go';
import java from 'highlight.js/lib/languages/java';
import json from 'highlight.js/lib/languages/json';
import php from 'highlight.js/lib/languages/php';
import python from 'highlight.js/lib/languages/python';
import typescript from 'highlight.js/lib/languages/typescript';

// only what the docs page shows, so the bundle stays small
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('go', go);
hljs.registerLanguage('java', java);
hljs.registerLanguage('json', json);
hljs.registerLanguage('php', php);
hljs.registerLanguage('python', python);
hljs.registerLanguage('typescript', typescript);

export type TCodeLanguage =
  | 'bash'
  | 'csharp'
  | 'go'
  | 'java'
  | 'php'
  | 'python'
  | 'typescript'
  /** A request URL, one line or the `readableUrl` view (GET line, then one param per line) */
  | 'url';

const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

const span = (className: string, text: string) =>
  `<span class="${className}">${escapeHtml(text)}</span>`;

/** `?key=value` / `&key=value`; a JSON value (the data param) gets JSON colours */
const highlightParam = (separator: string, pair: string) => {
  const [key, value] = pair.split(/=([\s\S]*)/);
  const valueHtml =
    value === undefined
      ? ''
      : `${span('hljs-punctuation', '=')}${
          value.trimStart().startsWith('{')
            ? hljs.highlight(value, { language: 'json' }).value
            : span('hljs-string', value)
        }`;
  return `${span('hljs-punctuation', separator)}${span('hljs-attr', key)}${valueHtml}`;
};

const highlightUrl = (text: string) => {
  // the readable view starts each param on its own line with ? or &
  const [first, ...lines] = text.split(/\n(?=\s*[?&])/);
  const [, method = '', request] = first.match(/^((?:GET|POST) )?([\s\S]*)$/) ?? [];
  const [base, query] = request.split(/\?([\s\S]*)/);
  const head = `${method ? span('hljs-keyword', method) : ''}${span('hljs-url', base)}${
    query === undefined
      ? ''
      : query
          .split('&')
          .map((pair, index) => highlightParam(index ? '&' : '?', pair))
          .join('')
  }`;
  const params = lines.map((line) => {
    const [, indent, separator, pair] = line.match(/^(\s*)([?&])([\s\S]*)$/) ?? [];
    return `\n${indent}${highlightParam(separator, pair)}`;
  });
  return head + params.join('');
};

/** Highlighted HTML for `code`; highlight.js escapes the source, so it is safe to inject. */
export const highlightCode = (code: string, language: TCodeLanguage) =>
  language === 'url' ? highlightUrl(code) : hljs.highlight(code, { language }).value;
