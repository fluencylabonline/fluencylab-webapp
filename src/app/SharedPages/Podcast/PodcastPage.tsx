"use client";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDocsFromServer,
  DocumentData,
  QueryDocumentSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/app/firebase";
import { format } from "date-fns";
import CustomAudioPlayer from "./CustomAudioPlayer";
import CustomVideoPlayer from "./CustomVideoPlayer";
import { useSession } from "next-auth/react";
import PodcastCard from "./PodcastCard";

type Podcast = {
  id: string;
  title: string;
  description: string;
  language: string;
  level: string;
  labels?: string[];
  transcription?: string;
  mediaUrl: string;
  mediaType: "audio" | "video";
  coverUrl?: string;
  createdAt?: { seconds: number };
  resumeTime?: number | null;
  completed?: boolean;
  hasResumed?: boolean;
  duration?: number;
};

export default function PodcastPage() {
  const { data: session } = useSession(); // Get user session

  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterLanguage, setFilterLanguage] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [search, setSearch] = useState("");
  const [nowPlaying, setNowPlaying] = useState<Podcast | null>(null);
  const [showDetails, setShowDetails] = useState(false); // This state seems unused in the provided code for the cards themselves
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [availableLevels, setAvailableLevels] = useState<string[]>([]);

  // Function to fetch available languages and levels for filters
  const fetchFilters = async () => {
    try {
      const snapshot = await getDocsFromServer(collection(db, "podcasts"));
      const langs = new Set<string>();
      const levels = new Set<string>();
      snapshot.docs.forEach((doc) => {
        const data = doc.data() as Podcast;
        langs.add(data.language);
        levels.add(data.level);
      });
      setAvailableLanguages(Array.from(langs).sort());
      setAvailableLevels(Array.from(levels).sort());
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  };

  // Function to fetch podcasts, optionally loading more
  const fetchPodcasts = async (isLoadMore = false) => {
    setLoading(true);
    try {
      let q = query(
        collection(db, "podcasts"),
        orderBy("createdAt", "desc"),
        limit(6)
      );
      if (isLoadMore && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      let docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Podcast[];

      // --- Fetch Progress Data for Each Podcast ---
      if (session?.user?.id) {
        const progressPromises = docs.map(async (podcast) => {
          const progressDocRef = doc(
            db,
            "users",
            session.user.id!,
            "podcastProgress",
            podcast.id
          );
          const progressDocSnap = await getDoc(progressDocRef);
          if (progressDocSnap.exists()) {
            const progressData = progressDocSnap.data();
            return {
              ...podcast,
              resumeTime: progressData.progress || null,
              completed: progressData.completed || false,
              hasResumed: false, // Initialize hasResumed as false for display in the card
            };
          }
          return {
            ...podcast,
            resumeTime: null,
            completed: false,
            hasResumed: false,
          }; // No progress found
        });

        docs = await Promise.all(progressPromises); // Wait for all progress fetches
      } else {
        // If user is not logged in, initialize progress fields to default values
        docs = docs.map((podcast) => ({
          ...podcast,
          resumeTime: null,
          completed: false,
          hasResumed: false,
        }));
      }

      if (isLoadMore) {
        setPodcasts((prev) => [...prev, ...docs]);
      } else {
        setPodcasts(docs);
      }
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
    } catch (error) {
      console.error("Error fetching podcasts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch of filters and podcasts
  useEffect(() => {
    fetchFilters();
    fetchPodcasts();
  }, [session]); // Refetch podcasts when session changes (login/logout)

  // Filter podcasts based on search and selected filters
  const filtered = podcasts.filter((p) => {
    return (
      (!filterLanguage || p.language === filterLanguage) &&
      (!filterLevel || p.level === filterLevel) &&
      (!search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.description &&
          p.description.toLowerCase().includes(search.toLowerCase())) || // Check if description exists
        (p.transcription &&
          p.transcription.toLowerCase().includes(search.toLowerCase()))) // Check if transcription exists
    );
  });

  // Function to format time in MM:SS format
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pb-32 pt-2 relative">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="md:col-span-2 relative">
          <input
            className="w-full bg-fluency-pages-light dark:bg-fluency-pages-dark px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Procurar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg
            className="absolute right-3 top-3 h-6 w-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <select
          className="bg-fluency-pages-light dark:bg-fluency-pages-dark px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={filterLanguage}
          onChange={(e) => setFilterLanguage(e.target.value)}
        >
          <option value="">Todos idiomas</option>
          {availableLanguages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>

        <select
          className="bg-fluency-pages-light dark:bg-fluency-pages-dark px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
        >
          <option value="">Todos níveis</option>
          {availableLevels.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </select>
      </div>

      {/* Podcast Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm"
            >
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200  dark:bg-gray-700 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎧</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum podcast encontrado.
          </h3>
          <p className="text-gray-600">
            Tente ajustar seus filtros ou pesquise termos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((podcast) => (
            <PodcastCard
              key={podcast.id}
              podcast={podcast}
              session={session} // Pass the session object
              setNowPlaying={setNowPlaying} // Pass the setNowPlaying function
              formatTime={formatTime} // Pass the formatTime function
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {lastDoc && (
        <div className="text-center mt-6">
          <button
            onClick={() => fetchPodcasts(true)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 hover:dark:bg-gray-900 rounded transition-colors"
          >
            Carregar mais
          </button>
        </div>
      )}

      {/* Sticky Footer Player */}
      {nowPlaying && (
        <div className="fixed bottom-0 inset-x-0 z-50 px-4 md:px-6 pb-4 pointer-events-none">
          <div className="pointer-events-auto rounded-xl max-w-4xl mx-auto border border-white/20 dark:border-white/10 bg-white/60 dark:bg-white/10 backdrop-blur-xl shadow-2xl overflow-visible">
            {nowPlaying.mediaType === "audio" ? (
              <CustomAudioPlayer
                src={nowPlaying.mediaUrl}
                title={nowPlaying.title}
                description={nowPlaying.description}
                transcription={nowPlaying.transcription}
                showDetails={showDetails}
                onClose={() => {
                  setNowPlaying(null);
                  setShowDetails(false);
                }}
                podcastId={nowPlaying.id}
                resumeTime={nowPlaying.resumeTime}
              />
            ) : (
              <CustomVideoPlayer
                src={nowPlaying.mediaUrl}
                title={nowPlaying.title}
                description={nowPlaying.description}
                transcription={nowPlaying.transcription}
                showDetails={showDetails}
                onClose={() => {
                  setNowPlaying(null);
                  setShowDetails(false);
                }}
                podcastId={nowPlaying.id}
                resumeTime={nowPlaying.resumeTime}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
