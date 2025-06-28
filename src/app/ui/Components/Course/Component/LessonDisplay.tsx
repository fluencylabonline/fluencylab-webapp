// app/components/LessonDisplay.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownComponents } from '../../Workbook/MarkdownComponents';
import { FiPaperclip } from 'react-icons/fi';
import {
  Attachment,
  LessonContentBlock,
  QuizQuestion,
  TextContentBlock,
  VideoContentBlock,
} from '../types';

interface LessonDisplayProps {
  lesson: {
    title: string;
    contentBlocks: LessonContentBlock[];
    quiz?: QuizQuestion[];
    attachments?: Attachment[]; // NEW: Optional array of attachments
  };
}

// Componente interno para YouTube Embed responsivo
const YouTubeEmbed: React.FC<{ url: string }> = ({ url }) => {
  // Extrai ID do vídeo da URL ou retorna null se inválido
  const getVideoId = (url: string) => {
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      return null;
    }
    const regExp =
      /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[1].length === 11 ? match[1] : null;
  };

  const videoId = getVideoId(url);
  if (!videoId) {
    // Se não for URL do YouTube, tenta exibir iframe direto (por exemplo, Vimeo ou outro)
    return (
      <iframe
        className="w-full h-full"
        src={url}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <div className="relative pt-[56.25%] h-0 overflow-hidden rounded-lg">
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

const LessonDisplay: React.FC<LessonDisplayProps> = ({ lesson }) => {
  return (
    <div className="space-y-8 mb-3">
      {lesson.contentBlocks.map((block) => (
        <div key={block.id} className="last:mb-0">
          {block.type === 'video' && (
            <div className="aspect-video rounded-lg overflow-hidden bg-fluency-gray-800">
              {/* Usar componente YouTubeEmbed */}
              <YouTubeEmbed url={(block as VideoContentBlock).url || ''} />
            </div>
          )}

          {block.type === 'text' && (
            <div className="prose max-w-none text-fluency-text-light dark:text-fluency-text-dark">
              <ReactMarkdown
                components={markdownComponents}
                remarkPlugins={[remarkGfm]}
              >
                {(block as TextContentBlock).content || ''}
              </ReactMarkdown>
            </div>
          )}
        </div>
      ))}

      {lesson.attachments && (
        <div className="border border-fluency-gray-200 dark:border-fluency-gray-700 rounded-lg p-4 bg-fluency-gray-50 dark:bg-fluency-gray-800">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-fluency-text-light dark:text-fluency-text-dark mb-3">
            <FiPaperclip className="w-5 h-5" /> Anexos
          </h3>
          <ul className="space-y-2">
            {lesson.attachments.map((att) => (
              <li key={att.id}>
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-fluency-blue-500 hover:text-fluency-blue-600 transition-colors text-sm"
                >
                  <FiPaperclip className="flex-shrink-0 w-4 h-4" />
                  <span>{att.name}</span>
                  <span className="text-fluency-text-secondary dark:text-fluency-text-dark-secondary text-xs">
                    ({(att.size / 1024).toFixed(1)} KB)
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LessonDisplay;
