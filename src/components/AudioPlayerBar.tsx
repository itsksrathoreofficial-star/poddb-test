"use client";
import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '@/components/PlayerProvider';
import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

export default function AudioPlayerBar() {
    const { currentTrack, isPlaying, playNext, playPrev, pause, play, closePlayer } = usePlayer();
    const [player, setPlayer] = useState<any>(null);
    const [isReady, setIsReady] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const intervalRef = useRef<any>();
    const playerRef = useRef<HTMLDivElement>(null);

    const onPlayerReady = React.useCallback((event: any) => {
        const playerInstance = event.target;
        if (playerInstance && typeof playerInstance.getDuration === 'function') {
            setPlayer(playerInstance);
            setDuration(playerInstance.getDuration());
            setIsReady(true);
            if (isPlaying && typeof playerInstance.playVideo === 'function') {
                try {
                    playerInstance.playVideo();
                } catch (error) {
                    console.error('Error playing video on ready:', error);
                }
            }
        }
    }, [isPlaying]);

    const onPlayerStateChange = React.useCallback((event: any) => {
        if (event.data === window.YT.PlayerState.PLAYING) {
            if (!isPlaying) play(currentTrack!);
            clearInterval(intervalRef.current);
            intervalRef.current = setInterval(() => {
                try {
                    if (event.target && typeof event.target.getCurrentTime === 'function') {
                        const currentTime = event.target.getCurrentTime();
                        setProgress(currentTime);
                    }
                } catch (error) {
                    console.error('Error getting current time:', error);
                    clearInterval(intervalRef.current);
                }
            }, 500);
        } else if (event.data === window.YT.PlayerState.PAUSED) {
            if (isPlaying) pause();
            clearInterval(intervalRef.current);
        } else if (event.data === window.YT.PlayerState.ENDED) {
            playNext();
        }
    }, [isPlaying, currentTrack, play, pause, playNext]);

    const loadPlayer = React.useCallback((videoId: string) => {
        // Reset player state first
        setPlayer(null);
        setIsReady(false);
        
        // Get current player reference without causing dependency issues
        const currentPlayer = player;
        if (currentPlayer) {
            try {
                currentPlayer.destroy();
            } catch (e) {
                console.error("Error destroying previous player instance", e);
            }
        }
        
        if (playerRef.current && window.YT && window.YT.Player) {
            try {
                const playerInstance = new window.YT.Player(playerRef.current, {
                    height: '0',
                    width: '0',
                    videoId: videoId,
                    playerVars: { 'autoplay': 1, 'controls': 0, 'origin': window.location.origin },
                    events: {
                        'onReady': onPlayerReady,
                        'onStateChange': onPlayerStateChange
                    }
                });
                setPlayer(playerInstance);
            } catch (error) {
                console.error('Error creating YouTube player:', error);
            }
        } else {
            console.warn('YouTube API not ready or Player constructor not available');
        }
    }, [onPlayerReady, onPlayerStateChange]); // Removed 'player' from dependencies

    useEffect(() => {
        // Only run when currentTrack changes and exists
        if (!currentTrack) {
            return;
        }

        if (!window.YT) {
            // Check if script is already being loaded
            const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
            if (!existingScript) {
                const tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                tag.async = true;
                window.onYouTubeIframeAPIReady = () => {
                    console.log('YouTube API loaded');
                    loadPlayer(currentTrack.youtube_video_id);
                };
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
            } else {
                // Script is loading, wait for it
                const checkYT = setInterval(() => {
                    if (window.YT) {
                        clearInterval(checkYT);
                        loadPlayer(currentTrack.youtube_video_id);
                    }
                }, 100);
                
                // Cleanup interval after 10 seconds
                setTimeout(() => clearInterval(checkYT), 10000);
            }
        } else {
            loadPlayer(currentTrack.youtube_video_id);
        }

        return () => {
            clearInterval(intervalRef.current);
            // Cleanup will be handled by the next effect
        };
    }, [currentTrack?.youtube_video_id, loadPlayer]); // Only depend on video ID and loadPlayer

    useEffect(() => {
        if (isReady && player && player !== null && typeof player.playVideo === 'function' && typeof player.pauseVideo === 'function') {
            try {
                if (isPlaying) {
                    player.playVideo();
                } else {
                    player.pauseVideo();
                }
            } catch (error) {
                console.error('Error controlling YouTube player:', error);
            }
        }
    }, [isPlaying, isReady, player]);

    // Cleanup effect - runs when component unmounts or currentTrack becomes null
    useEffect(() => {
        return () => {
            clearInterval(intervalRef.current);
            if (player) {
                try {
                    player.destroy();
                } catch (e) {
                    console.error("Error destroying YouTube player", e);
                }
            }
        };
    }, [player]);

    const handleSeek = (value: number[]) => {
        if (!isReady || !player || typeof player.seekTo !== 'function') return;
        const newTime = value[0];
        try {
            player.seekTo(newTime, true);
            setProgress(newTime);
        } catch (error) {
            console.error('Error seeking in YouTube player:', error);
        }
    };

    const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!isReady || !player || typeof player.seekTo !== 'function') return;
        
        const rect = event.currentTarget.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = percentage * duration;
        
        try {
            player.seekTo(newTime, true);
            setProgress(newTime);
        } catch (error) {
            console.error('Error seeking in YouTube player:', error);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time) || time === 0) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    // Only show AudioPlayerBar when there's a current track AND it's playing
    if (!currentTrack || !isPlaying) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 h-20 md:h-24 bg-card border-t border-border z-50 flex items-center px-2 md:px-4 lg:px-6">
            <div ref={playerRef} className="absolute top-[-9999px] left-[-9999px]"></div>
            {/* Mobile Layout */}
            <div className="flex items-center gap-2 md:gap-4 w-full md:w-1/4">
                <Image src={currentTrack.coverImage || ''} alt={currentTrack.title} width={40} height={40} className="rounded-md object-cover md:w-14 md:h-14" />
                <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate text-sm md:text-base">{currentTrack.title}</p>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">{currentTrack.podcastTitle}</p>
                </div>
            </div>
            
            {/* Desktop Controls */}
            <div className="hidden md:flex flex-col items-center justify-center flex-1 w-1/2">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={playPrev}><SkipBack className="h-5 w-5" /></Button>
                    <Button variant="hero" size="icon" className="w-12 h-12" onClick={() => isPlaying ? pause() : play(currentTrack)}>
                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={playNext}><SkipForward className="h-5 w-5" /></Button>
                </div>
                <div className="w-full max-w-xl flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">{formatTime(progress)}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full cursor-pointer" onClick={handleProgressClick}>
                        <div 
                            className="h-full bg-primary rounded-full transition-all duration-300" 
                            style={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }}
                        />
                    </div>
                    <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
                </div>
            </div>
            
            {/* Mobile Controls */}
            <div className="flex md:hidden items-center gap-2">
                <Button variant="ghost" size="icon" onClick={playPrev}><SkipBack className="h-4 w-4" /></Button>
                <Button variant="hero" size="icon" className="w-10 h-10" onClick={() => isPlaying ? pause() : play(currentTrack)}>
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={playNext}><SkipForward className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={closePlayer}><X className="h-4 w-4" /></Button>
            </div>
            
            {/* Desktop Close Button */}
            <div className="hidden md:flex items-center justify-end gap-4 w-1/4">
                <Button variant="ghost" size="icon" onClick={closePlayer}><X className="h-5 w-5" /></Button>
            </div>
        </div>
    );
}
