'use client'

import React from 'react';
import { format } from 'date-fns';
import { Session } from 'next-auth'; // Import Session type

// Define the type for a single Podcast object
type Podcast = {
  id: string;
  title: string;
  description: string;
  language: string;
  level: string;
  labels?: string[];
  transcription?: string;
  mediaUrl: string;
  mediaType: 'audio' | 'video';
  coverUrl?: string;
  createdAt?: { seconds: number };
  // Duration will be fetched from progress data
  duration?: number;
  resumeTime?: number | null;
  completed?: boolean;
  hasResumed?: boolean; // To track if resume has happened for this card's display
  showDetails?: boolean; // Added to pass initial showDetails state to player
};

// Define the props for the PodcastCard component
interface PodcastCardProps {
  podcast: Podcast;
  session: Session | null; // Pass the session object
  setNowPlaying: (podcast: Podcast | null) => void; // Function to set the currently playing podcast
  formatTime: (time: number) => string; // Function to format time
}

export default function PodcastCard({
  podcast,
  session,
  setNowPlaying,
  formatTime,
}: PodcastCardProps) {
  return (
    <article
      key={podcast.id}
      className="group bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col"
    >
      <div className="relative aspect-video bg-fluency-gray-200 dark:bg-fluency-gray-600">
        {podcast.coverUrl ? (
          <img
            src={podcast.coverUrl}
            alt="Cover"
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-6xl">
            🎧
          </div>
        )}
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium bg-blue-500/15 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-md w-fit hover:bg-blue-500/25 transition-colors">
            {podcast.language}
          </span>
            {session?.user?.id && podcast.completed && (
              <div className="text-xs font-medium bg-green-500/15 text-green-700 dark:text-green-400 px-2 py-1 rounded-md w-fit hover:bg-green-500/25 transition-colors">
                Podcast completo ✓
              </div>
            )}
        </div>

        <h2 className="text-xl font-semibold line-clamp-2">
          {podcast.title}
        </h2>
        <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
          {podcast.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
         {/* Progress Information and Resume Button */}
          {session?.user?.id && podcast.resumeTime !== null && podcast.resumeTime! > 5 && !podcast.completed ? (
            <button
                  onClick={() => setNowPlaying(podcast)}
                  className="flex flex-row items-center text-sm font-medium bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2 py-2 rounded-md w-fit hover:bg-amber-500/25 transition-colors"
                >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Continuar de {formatTime(podcast.resumeTime!)}
            </button>
          ):(
            <button
              onClick={() => {
                // If the podcast is completed, set resumeTime to 0 when setting nowPlaying
                if (session?.user?.id && podcast.completed) {
                  setNowPlaying({ ...podcast, resumeTime: 0 });
                } else {
                  // Otherwise, set nowPlaying with the existing podcast data (including any resumeTime)
                  setNowPlaying(podcast);
                }
              }}
              className="flex flex-row items-center text-sm font-medium bg-blue-500/15 text-blue-700 dark:text-blue-400 px-2 py-2 rounded-md w-fit hover:bg-blue-500/25 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              {session?.user?.id && podcast.completed ? 'Ouvir novamente' : 'Play'}
            </button>
          )}

          {podcast.transcription && (
            <button
              className="text-sm text-blue-600 flex items-center"
            >
              Transcrição ✓
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
