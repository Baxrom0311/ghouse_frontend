import React from "react";

interface MarkdownTextProps {
  content: string;
}

/**
 * Lightweight markdown renderer for AI chat messages.
 * Supports: **bold**, *italic*, `code`, ```code blocks```, - lists, numbered lists
 */
const MarkdownText: React.FC<MarkdownTextProps> = ({ content }) => {
  const blocks = content.split(/```(\w*)\n?([\s\S]*?)```/g);
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < blocks.length; i++) {
    if (i % 3 === 0) {
      // Regular text
      if (blocks[i]) {
        elements.push(<InlineMarkdown key={i} text={blocks[i]} />);
      }
    } else if (i % 3 === 2) {
      // Code block content
      elements.push(
        <pre key={i} className="my-2 overflow-x-auto rounded-lg bg-muted/80 p-3 text-xs font-mono border border-primary/10">
          <code>{blocks[i].trim()}</code>
        </pre>
      );
    }
    // i % 3 === 1 is the language identifier, skip
  }

  return <div className="space-y-1">{elements}</div>;
};

const InlineMarkdown: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split("\n");

  return (
    <>
      {lines.map((line, idx) => (
        <LineRenderer key={idx} line={line} isLast={idx === lines.length - 1} />
      ))}
    </>
  );
};

const LineRenderer: React.FC<{ line: string; isLast: boolean }> = ({ line, isLast }) => {
  const trimmed = line.trim();

  // Empty line
  if (!trimmed) return <br />;

  // List items
  if (/^[-•]\s/.test(trimmed)) {
    return (
      <div className="flex gap-2 pl-2">
        <span className="text-primary">•</span>
        <span>{renderInline(trimmed.slice(2))}</span>
      </div>
    );
  }

  // Numbered list
  if (/^\d+[.)]\s/.test(trimmed)) {
    const match = trimmed.match(/^(\d+[.)])\s(.*)$/);
    if (match) {
      return (
        <div className="flex gap-2 pl-2">
          <span className="text-primary font-medium">{match[1]}</span>
          <span>{renderInline(match[2])}</span>
        </div>
      );
    }
  }

  return (
    <>
      <span>{renderInline(line)}</span>
      {!isLast && <br />}
    </>
  );
};

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Match: **bold**, *italic*, `code`
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // **bold**
      parts.push(<strong key={key++} className="font-semibold text-foreground">{match[2]}</strong>);
    } else if (match[3]) {
      // *italic*
      parts.push(<em key={key++}>{match[3]}</em>);
    } else if (match[4]) {
      // `code`
      parts.push(
        <code key={key++} className="rounded bg-muted/80 px-1.5 py-0.5 text-xs font-mono text-primary border border-primary/10">
          {match[4]}
        </code>
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

export default React.memo(MarkdownText);
