"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Track {
  id: string;
  title: string;
  youtube_video_id: string;
  coverImage?: string;
  podcastTitle?: string;
}

interface PlayerContextType {
  currentTrack: Track | null;
  playlist: Track[];
  isPlaying: boolean;
  play: (track: Track, playlist?: Track[]) => void;
  pause: () => void;
  playNext: () => void;
  playPrev: () => void;
  closePlayer: () => void;
  loadTrack: (track: Track, playlist?: Track[]) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // Persist player state across page navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load state from localStorage on mount
      const savedTrack = localStorage.getItem('player_current_track');
      const savedPlaylist = localStorage.getItem('player_playlist');
      const savedIsPlaying = localStorage.getItem('player_is_playing');

      if (savedTrack) {
        try {
          setCurrentTrack(JSON.parse(savedTrack));
        } catch (e) {
          console.warn('Failed to parse saved track:', e);
        }
      }

      if (savedPlaylist) {
        try {
          setPlaylist(JSON.parse(savedPlaylist));
        } catch (e) {
          console.warn('Failed to parse saved playlist:', e);
        }
      }

      if (savedIsPlaying) {
        setIsPlaying(savedIsPlaying === 'true');
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentTrack) {
        localStorage.setItem('player_current_track', JSON.stringify(currentTrack));
      } else {
        localStorage.removeItem('player_current_track');
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (playlist.length > 0) {
        localStorage.setItem('player_playlist', JSON.stringify(playlist));
      } else {
        localStorage.removeItem('player_playlist');
      }
    }
  }, [playlist]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('player_is_playing', isPlaying.toString());
    }
  }, [isPlaying]);

  const loadTrack = React.useCallback((track: Track, newPlaylist?: Track[]) => {
    setCurrentTrack(track);
    if (newPlaylist) {
      setPlaylist(newPlaylist);
    } else if (playlist.length === 0) {
      setPlaylist([track]);
    }
    setIsPlaying(false);
  }, [playlist.length]);

  const play = React.useCallback((track: Track, newPlaylist?: Track[]) => {
    setCurrentTrack(track);
    if (newPlaylist) {
      setPlaylist(newPlaylist);
    } else if (playlist.length === 0) {
      setPlaylist([track]);
    }
    setIsPlaying(true);
  }, [playlist.length]);

  const pause = () => {
    setIsPlaying(false);
  };

  const playNext = () => {
    if (!currentTrack) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
      setCurrentTrack(playlist[currentIndex + 1]);
      setIsPlaying(true);
    } else {
      // Optionally, stop playing or loop
      setIsPlaying(false);
    }
  };

  const playPrev = () => {
    if (!currentTrack) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    if (currentIndex > 0) {
      setCurrentTrack(playlist[currentIndex - 1]);
      setIsPlaying(true);
    }
  };

  const closePlayer = () => {
    setCurrentTrack(null);
    setPlaylist([]);
    setIsPlaying(false);
  };

  const value = {
    currentTrack,
    playlist,
    isPlaying,
    play,
    pause,
    playNext,
    playPrev,
    closePlayer,
    loadTrack,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};
