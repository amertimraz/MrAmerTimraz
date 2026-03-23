import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'javascript', className = '' }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple syntax highlighting logic
  const highlightCode = (text: string) => {
    // Keywords for programming
    const keywords = /\b(const|let|var|function|return|if|else|for|while|import|export|from|class|extends|new|try|catch|async|await|public|private|static|int|float|string|bool|void|using|namespace|namespace|async|await|task|var|return)\b/g;
    const strings = /"(.*?)"|'(.*?)'|`(.*?)`/g;
    const comments = /\/\/.*/g;
    const numbers = /\b\d+\b/g;

    let highlighted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    highlighted = highlighted.replace(strings, '<span class="text-emerald-400">$&</span>');
    highlighted = highlighted.replace(comments, '<span class="text-gray-500 italic">$&</span>');
    highlighted = highlighted.replace(keywords, '<span class="text-pink-400 font-bold">$&</span>');
    highlighted = highlighted.replace(numbers, '<span class="text-orange-400">$&</span>');

    return highlighted;
  };

  return (
    <div className={`relative group rounded-xl bg-gray-900/90 border border-white/10 overflow-hidden font-mono text-sm leading-relaxed shadow-lg ${className}`}>
      {/* Header / Tab */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
          <span className="ml-2 text-xs text-gray-400 font-medium uppercase tracking-wider">{language}</span>
        </div>
        <button
          onClick={copyToClipboard}
          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-90"
          title="نسخ الكود"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
      </div>

      {/* Code Content */}
      <pre className="p-4 overflow-x-auto custom-scrollbar">
        <code 
          dangerouslySetInnerHTML={{ __html: highlightCode(code) }}
          className="block whitespace-pre text-gray-100"
        />
      </pre>

      {/* Cyber Decor */}
      <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute bottom-[-10px] right-[-10px] w-20 h-px bg-primary-500 rotate-[-45deg]" />
      </div>
    </div>
  );
};
