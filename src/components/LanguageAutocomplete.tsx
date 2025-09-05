import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, X, Plus, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface Language {
  code: string;
  name: string;
  native_name: string;
}

interface LanguageAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function LanguageAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Select or enter language...",
  className
}: LanguageAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Language[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync input value with prop value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (inputValue.trim().length === 0) {
        setSuggestions([]);
        setShowCreateNew(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase.rpc('get_language_suggestions', {
          search_term: inputValue.trim()
        } as any);

        if (error) throw error;

        const languages = (data || []) as Language[];
        setSuggestions(languages);
        setShowCreateNew(languages.length === 0 || !languages.some(lang => 
          lang.name.toLowerCase() === inputValue.toLowerCase() || 
          lang.code.toLowerCase() === inputValue.toLowerCase()
        ));
      } catch (error) {
        console.error('Error fetching language suggestions:', error);
        setSuggestions([]);
        setShowCreateNew(true);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [inputValue]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const totalItems = suggestions.length + (showCreateNew ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < totalItems - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      if (highlightedIndex < suggestions.length) {
        const selected = suggestions[highlightedIndex];
        handleSelect(selected);
      } else if (showCreateNew) {
        handleCreateNew();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleSelect = (language: Language) => {
    onChange(language.name);
    if (onSelect) {
      onSelect(language.name);
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
    setSuggestions([]);
  };

  const handleCreateNew = async () => {
    if (!inputValue.trim()) return;

    try {
      setLoading(true);
      // Add new language to database
      const { data, error } = await (supabase.rpc as any)('add_language_if_not_exists', {
        lang_code: inputValue.trim().toLowerCase().substring(0, 2),
        lang_name: inputValue.trim(),
        lang_native_name: inputValue.trim()
      });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Failed to create language');
      }

      console.log('Language created successfully:', data);
      toast.success('Language created successfully!');
      onChange(inputValue.trim());
      setIsOpen(false);
      setHighlightedIndex(-1);
      setSuggestions([]);
    } catch (error: any) {
      console.error('Error creating new language:', error);
      // Show user-friendly error message
      const errorMessage = error.message || 'Failed to create language. Please try again.';
      toast.error('Error creating language', {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    
    // Only show suggestions if there's text AND user is actively typing
    if (newValue.trim().length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setSuggestions([]);
      setShowCreateNew(false);
    }
  };

  const handleFocus = () => {
    // Don't open suggestions on focus - only when typing
    // This prevents the suggestion box from interfering with typing
  };

  const handleBlur = () => {
    // Delay closing to allow for clicks on suggestions
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 150);
  };

  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && suggestionsRef.current) {
      const highlightedElement = suggestionsRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="pr-10"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {value && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1"
              onClick={() => {
                onChange('');
                setSuggestions([]);
                setIsOpen(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      {/* Suggestions dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
          <ScrollArea className="max-h-64">
            <div ref={suggestionsRef} className="py-1">
              {loading ? (
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((language, index) => (
                  <div
                    key={language.code}
                    className={cn(
                      'px-4 py-2 cursor-pointer text-sm hover:bg-accent',
                      highlightedIndex === index && 'bg-accent'
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(language);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{language.name}</div>
                          {language.native_name && language.native_name !== language.name && (
                            <div className="text-xs text-muted-foreground">
                              {language.native_name}
                            </div>
                          )}
                        </div>
                      </div>
                      {highlightedIndex === index && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </div>
                ))
              ) : null}
              
              {showCreateNew && inputValue.trim().length > 0 && (
                <div
                  className={cn(
                    'px-4 py-2 cursor-pointer text-sm hover:bg-accent border-t',
                    highlightedIndex === suggestions.length && 'bg-accent'
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleCreateNew();
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <Plus className="h-4 w-4 text-primary" />
                    <span className="text-primary">Create &quot;{inputValue.trim()}&quot;</span>
                  </div>
                </div>
              )}
              
              {!loading && suggestions.length === 0 && !showCreateNew && inputValue.trim().length > 0 && (
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  No languages found
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
