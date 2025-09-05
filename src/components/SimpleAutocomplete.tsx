import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  fetchSuggestions: (query: string) => Promise<any[]>;
  placeholder?: string;
  onSelect?: (suggestion: any) => void;
  renderSuggestion?: (suggestion: any) => React.ReactNode;
  className?: string;
}

export function SimpleAutocomplete({
  value,
  onChange,
  fetchSuggestions,
  placeholder,
  onSelect,
  renderSuggestion,
  className
}: SimpleAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions when value changes
  useEffect(() => {
    const fetchData = async () => {
      if (value.trim().length === 0) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      try {
        setLoading(true);
        const results = await fetchSuggestions(value);
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchData, 300);
    return () => clearTimeout(debounce);
  }, [value, fetchSuggestions]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelect(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleSelect = (suggestion: any) => {
    const newValue = typeof suggestion === 'string' ? suggestion : suggestion.name;
    onChange(newValue);
    if (onSelect) onSelect(suggestion);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    // Delay closing to allow click events on suggestions
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 200);
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && suggestionsRef.current) {
      const highlightedElement = suggestionsRef.current.children[highlightedIndex] as HTMLElement;
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
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder || 'Type to search...'}
          className="pr-10"
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {value && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto"
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
          <div className="max-h-64 overflow-y-auto">
            <div ref={suggestionsRef} className="py-1">
              {loading ? (
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <div
                    key={typeof suggestion === 'string' ? suggestion : suggestion.id}
                    className={cn(
                      'px-4 py-2 cursor-pointer text-sm hover:bg-accent',
                      highlightedIndex === index && 'bg-accent'
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(suggestion);
                    }}
                  >
                    {renderSuggestion ? (
                      renderSuggestion(suggestion)
                    ) : (
                      <span>{typeof suggestion === 'string' ? suggestion : suggestion.name}</span>
                    )}
                  </div>
                ))
              ) : (
                value.trim().length > 0 && (
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    No suggestions found
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
