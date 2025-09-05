import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialMediaInputProps {
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
}> = {
  instagram: {
    pattern: /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/,
    example: 'https://www.instagram.com/username',
    icon: () => <span className="text-pink-500">📷</span>,
    baseUrl: 'https://www.instagram.com/'
  },
  youtube: {
    pattern: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/,
    example: 'https://www.youtube.com/c/channelname',
    icon: () => <span className="text-red-500">📺</span>,
    baseUrl: 'https://www.youtube.com/'
  },
  x: {
    pattern: /^https?:\/\/(www\.)?(x\.com|twitter\.com)\/[a-zA-Z0-9._]+\/?$/,
    example: 'https://x.com/username',
    icon: () => <span className="text-black">𝕏</span>,
    baseUrl: 'https://x.com/'
  },
  facebook: {
    pattern: /^https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9._]+\/?$/,
    example: 'https://www.facebook.com/username',
    icon: () => <span className="text-blue-500">📘</span>,
    baseUrl: 'https://www.facebook.com/'
  },
  linkedin: {
    pattern: /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9._-]+\/?$/,
    example: 'https://www.linkedin.com/in/username',
    icon: () => <span className="text-blue-600">💼</span>,
    baseUrl: 'https://www.linkedin.com/'
  },
  threads: {
    pattern: /^https?:\/\/(www\.)?threads\.net\/@[a-zA-Z0-9._]+\/?$/,
    example: 'https://www.threads.net/@username',
    icon: () => <span className="text-black">🧵</span>,
    baseUrl: 'https://www.threads.net/@'
  },
  pinterest: {
    pattern: /^https?:\/\/(www\.)?pinterest\.com\/[a-zA-Z0-9._]+\/?$/,
    example: 'https://www.pinterest.com/username',
    icon: () => <span className="text-red-600">📌</span>,
    baseUrl: 'https://www.pinterest.com/'
  }
};

export function SocialMediaInput({
  platform,
  value,
  onChange,
  placeholder,
  className,
  required = false
}: SocialMediaInputProps) {
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
    return `Invalid ${platform} URL`;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={`${platform}-input`} className="flex items-center space-x-2">
        <Icon />
        <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
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
            Please enter a valid {platform} URL. Example: {validator.example}
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
