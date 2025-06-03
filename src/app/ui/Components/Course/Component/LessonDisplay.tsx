// app/components/LessonDisplay.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownComponents } from '../../Workbook/MarkdownComponents';
import { FiPaperclip } from 'react-icons/fi';
import { Attachment, LessonContentBlock, QuizQuestion, TextContentBlock, VideoContentBlock } from '../types';

interface LessonDisplayProps {
  lesson: {
    title: string;
    contentBlocks: LessonContentBlock[];
    quiz?: QuizQuestion[];
    attachments?: Attachment[]; // NEW: Optional array of attachments
  };
}

const LessonDisplay: React.FC<LessonDisplayProps> = ({ lesson }) => {
  return (
    <div className="space-y-8 mb-3">
      {lesson.contentBlocks.map(block => (
        <div key={block.id} className="last:mb-0">
          {block.type === 'video' && (
            <div className="aspect-video rounded-lg overflow-hidden bg-fluency-gray-800">
              <iframe
                className="w-full h-full"
                src={(block as VideoContentBlock).url || ''}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
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
            {lesson.attachments.map(att => (
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