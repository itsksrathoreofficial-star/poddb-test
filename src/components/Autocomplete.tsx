import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  fetchSuggestions: (query: string) => Promise<any[]>;
  placeholder?: string;
  onSelect?: (suggestion: any) => void;
  renderSuggestion?: (suggestion: any) => React.ReactNode;
}

export function Autocomplete({
  value,
  onChange,
  fetchSuggestions,
  placeholder,
  onSelect,
  renderSuggestion,
}: AutocompleteProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (value.trim().length === 0) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      try {
        const results = await fetchSuggestions(value);
        setSuggestions(results);
        setIsOpen(results.length > 0 && value.trim().length > 0);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setIsOpen(false);
      }
    };

    const debounce = setTimeout(fetchData, 300); // Balanced debounce for responsiveness
    return () => clearTimeout(debounce);
  }, [value, fetchSuggestions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      const selected = suggestions[highlightedIndex];
      onChange(typeof selected === 'string' ? selected : selected.name);
      if (onSelect) onSelect(selected);
      setIsOpen(false);
      setHighlightedIndex(-1);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Only show suggestions if there's text AND user is actively typing
    if (newValue.trim().length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setSuggestions([]);
    }
  };

  const handleBlur = () => {
    // Delay closing to allow click events on suggestions
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 150);
  };

  const handleFocus = () => {
    // Don't open suggestions on focus - only when typing
    // This prevents the suggestion box from interfering with typing
  };

  // Ensure suggestions scroll into view when highlighted
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && suggestionsRef.current) {
      const highlightedElement = suggestionsRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement) {
        // Use a more reliable scrolling method
        const container = highlightedElement.parentElement;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const elementRect = highlightedElement.getBoundingClientRect();
          
          if (elementRect.bottom > containerRect.bottom) {
            highlightedElement.scrollIntoView({ block: 'end', behavior: 'smooth' });
          } else if (elementRect.top < containerRect.top) {
            highlightedElement.scrollIntoView({ block: 'start', behavior: 'smooth' });
          }
        }
      }
    }
  }, [highlightedIndex, isOpen]);

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={(open) => setIsOpen(open && value.trim().length > 0)}>
        <PopoverTrigger asChild>
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
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <div className="max-h-64 overflow-y-auto">
            <div ref={suggestionsRef} className="py-1">
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <div
                    key={typeof suggestion === 'string' ? suggestion : suggestion.id}
                    className={cn(
                      'px-4 py-2 cursor-pointer text-sm hover:bg-accent',
                      highlightedIndex === index && 'bg-accent'
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent blur from closing the popover
                      handleSelect(suggestion);
                    }}
                  >
                    {renderSuggestion ? (
                      renderSuggestion(suggestion)
                    ) : (
                      <div className="flex items-center justify-between">
                        <span>{typeof suggestion === 'string' ? suggestion : suggestion.name}</span>
                        {highlightedIndex === index && <Check className="h-4 w-4 text-primary" />}
                      </div>
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
        </PopoverContent>
      </Popover>
    </div>
  );
}