'use client';

import React from 'react';
import styles from './RichContent.module.css';


type TextNode = {
  type: 'text';
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
};

type LinkNode = {
  type: 'link';
  url: string;
  children: InlineNode[];
};

type InlineNode = TextNode | LinkNode;

type ParagraphBlock = {
  type: 'paragraph';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  children: InlineNode[];
};

type HeadingBlock = {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  children: InlineNode[];
};

type ListItemBlock = {
  type: 'list-item';
  children: InlineNode[];
};

type ListBlock = {
  type: 'list';
  format: 'ordered' | 'unordered';
  children: ListItemBlock[];
};

type QuoteBlock = {
  type: 'quote';
  children: InlineNode[];
};

type CodeBlock = {
  type: 'code';
  children: InlineNode[];
};

type ImageBlock = {
  type: 'image';
  image: { url: string; alternativeText?: string | null; width?: number; height?: number };
  children: InlineNode[];
};

type Block = ParagraphBlock | HeadingBlock | ListBlock | QuoteBlock | CodeBlock | ImageBlock;


const STRAPI_URL = typeof window === 'undefined'
  ? (process.env.STRAPI_URL ?? 'http://localhost:1337')
  : '';

function resolveUrl(url: string): string {
  if (url.startsWith('http')) return url;
  return `${STRAPI_URL}${url}`;
}

function alignStyle(align?: string): React.CSSProperties {
  if (align === 'center') return { textAlign: 'center' };
  if (align === 'right') return { textAlign: 'right' };
  if (align === 'justify') return { textAlign: 'justify' };
  return {};
}


function renderInline(node: InlineNode, key: number): React.ReactNode {
  if (node.type === 'link') {
    return (
      <a key={key} href={node.url} className={styles.link} target="_blank" rel="noreferrer">
        {node.children.map((c, i) => renderInline(c, i))}
      </a>
    );
  }

  let el: React.ReactNode = node.text;
  if (node.code) el = <code className={styles.inlineCode}>{el}</code>;
  if (node.bold) el = <strong className={styles.bold}>{el}</strong>;
  if (node.italic) el = <em className={styles.italic}>{el}</em>;
  if (node.underline) el = <u className={styles.underline}>{el}</u>;
  if (node.strikethrough) el = <s>{el}</s>;

  return <React.Fragment key={key}>{el}</React.Fragment>;
}


function renderBlock(block: Block, key: number): React.ReactNode {
  switch (block.type) {
    case 'paragraph':
      return (
        <p key={key} className={styles.p} style={alignStyle(block.textAlign)}>
          {block.children.map((c, i) => renderInline(c, i))}
        </p>
      );

    case 'heading': {
      const Tag = `h${block.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      return (
        <Tag key={key} className={styles[`h${block.level}` as keyof typeof styles]}
          style={alignStyle(block.textAlign)}>
          {block.children.map((c, i) => renderInline(c, i))}
        </Tag>
      );
    }

    case 'list': {
      const Tag = block.format === 'ordered' ? 'ol' : 'ul';
      return (
        <Tag key={key} className={styles.list}>
          {block.children.map((item, i) => (
            <li key={i} className={styles.listItem}>
              {item.children.map((c, j) => renderInline(c, j))}
            </li>
          ))}
        </Tag>
      );
    }

    case 'quote':
      return (
        <blockquote key={key} className={styles.quote}>
          {block.children.map((c, i) => renderInline(c, i))}
        </blockquote>
      );

    case 'code':
      return (
        <pre key={key} className={styles.codeBlock}>
          <code>{block.children.map((c, i) => renderInline(c, i))}</code>
        </pre>
      );

    case 'image':
      return (
        <img
          key={key}
          src={resolveUrl(block.image.url)}
          alt={block.image.alternativeText ?? ''}
          className={styles.image}
          width={block.image.width}
          height={block.image.height}
        />
      );

    default:
      return null;
  }
}


interface Props {
  content: any[];
  className?: string;
}

export default function RichContent({ content, className }: Props) {
  if (!Array.isArray(content) || content.length === 0) return null;
  return (
    <div className={`${styles.root}${className ? ` ${className}` : ''}`}>
      {content.map((block, i) => renderBlock(block as Block, i))}
    </div>
  );
}
