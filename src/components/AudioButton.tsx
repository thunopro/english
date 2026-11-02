import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface AudioButtonProps {
  word: string;
  audioUrl?: string;
  isPlaying: boolean;
  onPlay: (word: string, audioUrl?: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  word,
  audioUrl,
  isPlaying,
  onPlay,
  size = 'md',
  className = '',
  showLabel = false,
}) => {
  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'px-4 py-2.5 text-base',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onPlay(word, audioUrl);
      }}
      title={audioUrl ? 'Nghe phát âm chuẩn (MP3)' : 'Nghe phát âm (Speech Synthesis)'}
      aria-label={`Nghe phát âm từ ${word}`}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full font-medium transition-all duration-200 cursor-pointer ${
        isPlaying
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 ring-2 ring-indigo-400 animate-pulse'
          : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 active:scale-95'
      } ${sizeClasses[size]} ${className}`}
    >
      {isPlaying ? (
        <div className="flex items-center gap-0.5 px-0.5">
          <span className="w-1 bg-white rounded-full animate-wave-1" style={{ height: '14px' }}></span>
          <span className="w-1 bg-white rounded-full animate-wave-2" style={{ height: '10px' }}></span>
          <span className="w-1 bg-white rounded-full animate-wave-3" style={{ height: '16px' }}></span>
        </div>
      ) : (
        <Volume2 size={iconSizes[size]} />
      )}
      {showLabel && (
        <span className="ml-1 text-xs font-semibold">
          {isPlaying ? 'Đang phát...' : 'Phát âm'}
        </span>
      )}
    </button>
  );
};
