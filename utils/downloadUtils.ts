import JSZip from 'jszip';
import { Message } from '../types';

const EXTENSION_MAP: Record<string, string> = {
  javascript: 'js',
  js: 'js',
  typescript: 'ts',
  ts: 'ts',
  typescriptreact: 'tsx',
  jsx: 'jsx',
  tsx: 'tsx',
  python: 'py',
  py: 'py',
  html: 'html',
  css: 'css',
  scss: 'scss',
  json: 'json',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  csharp: 'cs',
  go: 'go',
  rust: 'rs',
  php: 'php',
  ruby: 'rb',
  swift: 'swift',
  kotlin: 'kt',
  bash: 'sh',
  sh: 'sh',
  shell: 'sh',
  sql: 'sql',
  markdown: 'md',
  md: 'md',
  yaml: 'yaml',
  yml: 'yaml',
  xml: 'xml',
};

export const extractCodeFromMessages = async (messages: Message[]) => {
  const zip = new JSZip();
  let fileCount = 0;

  messages.forEach((msg) => {
    if (msg.role !== 'model' || !msg.text) return;

    // Regex to capture language and code content
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(msg.text)) !== null) {
      const language = match[1]?.toLowerCase() || 'txt';
      const content = match[2];
      
      if (!content.trim()) continue;

      const extension = EXTENSION_MAP[language] || 'txt';
      
      // Try to find a filename in the code or preceding text
      // 1. Look for "// filename: name.ext" or "<!-- filename: name.ext -->" inside the block
      const filenameMatch = content.match(/^(?:\/\/|#|<!--)\s*(?:filename:)?\s*([\w.-]+\.\w+)\s*(?:-->)?/m);
      
      let filename = '';
      if (filenameMatch) {
        filename = filenameMatch[1];
      } else {
        fileCount++;
        filename = `snippet_${fileCount}.${extension}`;
      }

      // Add to zip folder "spurify_code"
      zip.folder("spurify_code")?.file(filename, content);
    }
  });

  if (fileCount === 0 && Object.keys(zip.files).length === 0) {
    return null;
  }

  return await zip.generateAsync({ type: 'blob' });
};

export const triggerDownload = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};