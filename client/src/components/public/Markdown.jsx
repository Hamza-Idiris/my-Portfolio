import { Fragment } from 'react';

/**
 * A deliberately small Markdown subset renderer.
 *
 * It builds React elements directly instead of setting innerHTML, so update
 * content can never inject markup into the page, and it avoids adding a
 * markdown parser plus sanitiser to the bundle for the handful of constructs
 * that are actually used: headings, lists, quotes, code blocks, links, bold,
 * italic and inline code.
 */

const INLINE = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

function renderInline(text) {
  return text.split(INLINE).filter(Boolean).map((token, index) => {
    if (/^\*\*[\s\S]+\*\*$/.test(token) || /^__[\s\S]+__$/.test(token)) {
      return <strong key={index}>{token.slice(2, -2)}</strong>;
    }
    if (/^\*[^*]+\*$/.test(token) || /^_[^_]+_$/.test(token)) {
      return <em key={index}>{token.slice(1, -1)}</em>;
    }
    if (/^`[^`]+`$/.test(token)) {
      return <code key={index}>{token.slice(1, -1)}</code>;
    }
    const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = link[2];
      const external = /^https?:\/\//.test(href);
      // Only http(s) and relative links are followed; anything else renders as text.
      if (!external && !href.startsWith('/')) return <Fragment key={index}>{link[1]}</Fragment>;
      return (
        <a
          key={index}
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {link[1]}
        </a>
      );
    }
    return <Fragment key={index}>{token}</Fragment>;
  });
}

function parseBlocks(markdown) {
  const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith('```')) {
      const language = line.slice(3).trim();
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith('```')) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push({ type: 'code', language, content: code.join('\n') });
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, content: heading[2] });
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^>\s?/, ''));
        index += 1;
      }
      blocks.push({ type: 'quote', content: quote.join(' ') });
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items = [];
      while (
        index < lines.length &&
        (ordered ? /^\s*\d+\.\s+/.test(lines[index]) : /^\s*[-*+]\s+/.test(lines[index]))
      ) {
        items.push(lines[index].replace(/^\s*(?:[-*+]|\d+\.)\s+/, ''));
        index += 1;
      }
      blocks.push({ type: 'list', ordered, items });
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      blocks.push({ type: 'divider' });
      index += 1;
      continue;
    }

    const paragraph = [];
    while (index < lines.length && lines[index].trim() && !/^(#{1,4}\s|>|```)/.test(lines[index])) {
      if (/^\s*(?:[-*+]|\d+\.)\s+/.test(lines[index])) break;
      paragraph.push(lines[index]);
      index += 1;
    }
    if (paragraph.length) blocks.push({ type: 'paragraph', content: paragraph.join(' ') });
  }

  return blocks;
}

export function Markdown({ content, className = 'prose-update' }) {
  const blocks = parseBlocks(content);

  if (!blocks.length) return null;

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading': {
            const Tag = `h${Math.min(block.level + 1, 4)}`;
            return <Tag key={index}>{renderInline(block.content)}</Tag>;
          }
          case 'code':
            return (
              <pre key={index}>
                <code>{block.content}</code>
              </pre>
            );
          case 'quote':
            return <blockquote key={index}>{renderInline(block.content)}</blockquote>;
          case 'list': {
            const Tag = block.ordered ? 'ol' : 'ul';
            return (
              <Tag key={index}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{renderInline(item)}</li>
                ))}
              </Tag>
            );
          }
          case 'divider':
            return <hr key={index} className="border-[var(--hairline)]" />;
          default:
            return <p key={index}>{renderInline(block.content)}</p>;
        }
      })}
    </div>
  );
}
