"use client";
import React from 'react';
import { usePlayer } from '@/components/PlayerProvider';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Image from 'next/image';

export default function PodcastPlayer() {
    const { currentTrack, isPlaying, playNext, playPrev, pause, play } = usePlayer();

    if (!currentTrack) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-muted rounded-lg">
                <p className="font-semibold">Select an episode to play</p>
                <p className="text-sm text-muted-foreground">Your selection will appear here</p>
            </div>
        );
    }

    // Dummy values for progress and duration, as we can't access the YouTube player's state here.
    const progress = 0;
    const duration = 1;

    const formatTime = (time: number) => {
        if (isNaN(time) || time === 0) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    return (
        <div className="bg-card border-t border-border flex flex-col items-center p-4 rounded-lg">
            <div className="flex items-center gap-4 w-full">
                <Image src={currentTrack.coverImage || '/placeholder.svg'} alt={currentTrack.title || 'Track'} width={56} height={56} className="rounded-md object-cover" />
                <div className="min-w-0">
                    <p className="font-semibold truncate">{currentTrack.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{currentTrack.podcastTitle}</p>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 w-full mt-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={playPrev}><SkipBack className="h-5 w-5" /></Button>
                    <Button variant="hero" size="icon" className="w-12 h-12" onClick={() => isPlaying ? pause() : play(currentTrack)}>
                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={playNext}><SkipForward className="h-5 w-5" /></Button>
                </div>
                <div className="w-full max-w-xl flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">{formatTime(progress)}</span>
                    <Slider value={[progress]} max={duration} step={1} disabled />
                    <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
}
