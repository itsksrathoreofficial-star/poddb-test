import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlatformLinkInputProps {
  platform: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const platformValidators: Record<string, { 
  pattern: RegExp; 
  example: string; 
  icon: React.ComponentType<any>;
  baseUrl: string;
  name: string;
}> = {
  spotify: {
    pattern: /^https?:\/\/(open\.)?spotify\.com\/show\/[a-zA-Z0-9]+\/?$/,
    example: 'https://open.spotify.com/show/showid',
    icon: () => <span className="text-green-500">🎵</span>,
    baseUrl: 'https://open.spotify.com/show/',
    name: 'Spotify'
  },
  apple: {
    pattern: /^https?:\/\/(podcasts\.)?apple\.com\/podcast\/[a-zA-Z0-9-]+\/?$/,
    example: 'https://podcasts.apple.com/podcast/podcastid',
    icon: () => <span className="text-gray-800">🍎</span>,
    baseUrl: 'https://podcasts.apple.com/podcast/',
    name: 'Apple Podcasts'
  },
  jiosaavn: {
    pattern: /^https?:\/\/(www\.)?jiosaavn\.com\/podcast\/[a-zA-Z0-9-]+\/?$/,
    example: 'https://www.jiosaavn.com/podcast/podcastid',
    icon: () => <span className="text-blue-600">🎧</span>,
    baseUrl: 'https://www.jiosaavn.com/podcast/',
    name: 'JioSaavn'
  },
  amazon: {
    pattern: /^https?:\/\/(music\.)?amazon\.com\/podcasts\/[a-zA-Z0-9-]+\/?$/,
    example: 'https://music.amazon.com/podcasts/podcastid',
    icon: () => <span className="text-orange-500">📦</span>,
    baseUrl: 'https://music.amazon.com/podcasts/',
    name: 'Amazon Music'
  }
};

export function PlatformLinkInput({
  platform,
  value,
  onChange,
  placeholder,
  className,
  required = false
}: PlatformLinkInputProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [showError, setShowError] = useState(false);

  const validator = platformValidators[platform.toLowerCase()];
  const Icon = validator?.icon || (() => <span>🔗</span>);

  const validateUrl = (url: string) => {
    if (!url.trim()) {
      setIsValid(null);
      return;
    }

    if (!validator) {
      setIsValid(true);
      return;
    }

    const isValidUrl = validator.pattern.test(url);
    setIsValid(isValidUrl);
    setShowError(!isValidUrl && url.trim().length > 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    validateUrl(newValue);
  };

  const handleBlur = () => {
    validateUrl(value);
  };

  const handleFocus = () => {
    setShowError(false);
  };

  const getInputClass = () => {
    if (isValid === null) return '';
    return isValid ? 'border-green-500 focus:border-green-500' : 'border-red-500 focus:border-red-500';
  };

  const getStatusIcon = () => {
    if (isValid === null) return null;
    if (isValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusText = () => {
    if (isValid === null) return '';
    if (isValid) {
      return 'Valid URL';
    }
    return `Invalid ${validator?.name || platform} URL`;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={`${platform}-input`} className="flex items-center space-x-2">
        <Icon />
        <span>{validator?.name || platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
        {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id={`${platform}-input`}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder || validator?.example || `Enter ${platform} URL`}
          className={cn("pr-10", getInputClass())}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {getStatusIcon()}
        </div>
      </div>

      {showError && validator && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Please enter a valid {validator.name} URL. Example: {validator.example}
          </AlertDescription>
        </Alert>
      )}

      {isValid !== null && (
        <div className={cn(
          "text-xs flex items-center space-x-1",
          isValid ? "text-green-600" : "text-red-600"
        )}>
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </div>
      )}

      {validator && (
        <p className="text-xs text-muted-foreground">
          Format: {validator.example}
        </p>
      )}
    </div>
  );
}
