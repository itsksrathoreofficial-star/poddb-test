import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, ChevronDown, X, Plus, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';

interface Location {
  id: string;
  name: string;
  country: string;
  state?: string;
  type: 'country' | 'state' | 'city';
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onRequestLocation?: () => void;
}

// Sample data - in a real app, this would come from an API
const LOCATIONS: Location[] = [
  // Countries
  { id: 'US', name: 'United States', country: 'United States', type: 'country' },
  { id: 'IN', name: 'India', country: 'India', type: 'country' },
  { id: 'GB', name: 'United Kingdom', country: 'United Kingdom', type: 'country' },
  { id: 'CA', name: 'Canada', country: 'Canada', type: 'country' },
  { id: 'AU', name: 'Australia', country: 'Australia', type: 'country' },
  { id: 'DE', name: 'Germany', country: 'Germany', type: 'country' },
  { id: 'FR', name: 'France', country: 'France', type: 'country' },
  { id: 'JP', name: 'Japan', country: 'Japan', type: 'country' },
  { id: 'BR', name: 'Brazil', country: 'Brazil', type: 'country' },
  { id: 'MX', name: 'Mexico', country: 'Mexico', type: 'country' },
  
  // US States
  { id: 'CA-US', name: 'California', country: 'United States', state: 'California', type: 'state' },
  { id: 'NY-US', name: 'New York', country: 'United States', state: 'New York', type: 'state' },
  { id: 'TX-US', name: 'Texas', country: 'United States', state: 'Texas', type: 'state' },
  { id: 'FL-US', name: 'Florida', country: 'United States', state: 'Florida', type: 'state' },
  { id: 'IL-US', name: 'Illinois', country: 'United States', state: 'Illinois', type: 'state' },
  { id: 'PA-US', name: 'Pennsylvania', country: 'United States', state: 'Pennsylvania', type: 'state' },
  { id: 'OH-US', name: 'Ohio', country: 'United States', state: 'Ohio', type: 'state' },
  { id: 'GA-US', name: 'Georgia', country: 'United States', state: 'Georgia', type: 'state' },
  { id: 'NC-US', name: 'North Carolina', country: 'United States', state: 'North Carolina', type: 'state' },
  { id: 'MI-US', name: 'Michigan', country: 'United States', state: 'Michigan', type: 'state' },
  
  // Indian States
  { id: 'MH-IN', name: 'Maharashtra', country: 'India', state: 'Maharashtra', type: 'state' },
  { id: 'UP-IN', name: 'Uttar Pradesh', country: 'India', state: 'Uttar Pradesh', type: 'state' },
  { id: 'DL-IN', name: 'Delhi', country: 'India', state: 'Delhi', type: 'state' },
  { id: 'KA-IN', name: 'Karnataka', country: 'India', state: 'Karnataka', type: 'state' },
  { id: 'TN-IN', name: 'Tamil Nadu', country: 'India', state: 'Tamil Nadu', type: 'state' },
  { id: 'GJ-IN', name: 'Gujarat', country: 'India', state: 'Gujarat', type: 'state' },
  { id: 'RJ-IN', name: 'Rajasthan', country: 'India', state: 'Rajasthan', type: 'state' },
  { id: 'WB-IN', name: 'West Bengal', country: 'India', state: 'West Bengal', type: 'state' },
  { id: 'MP-IN', name: 'Madhya Pradesh', country: 'India', state: 'Madhya Pradesh', type: 'state' },
  { id: 'AP-IN', name: 'Andhra Pradesh', country: 'India', state: 'Andhra Pradesh', type: 'state' },
  
  // Major Cities
  { id: 'NYC-US', name: 'New York City', country: 'United States', state: 'New York', type: 'city' },
  { id: 'LA-US', name: 'Los Angeles', country: 'United States', state: 'California', type: 'city' },
  { id: 'CHI-US', name: 'Chicago', country: 'United States', state: 'Illinois', type: 'city' },
  { id: 'HOU-US', name: 'Houston', country: 'United States', state: 'Texas', type: 'city' },
  { id: 'PHX-US', name: 'Phoenix', country: 'United States', state: 'Arizona', type: 'city' },
  { id: 'PHI-US', name: 'Philadelphia', country: 'United States', state: 'Pennsylvania', type: 'city' },
  { id: 'SA-US', name: 'San Antonio', country: 'United States', state: 'Texas', type: 'city' },
  { id: 'SD-US', name: 'San Diego', country: 'United States', state: 'California', type: 'city' },
  { id: 'DAL-US', name: 'Dallas', country: 'United States', state: 'Texas', type: 'city' },
  { id: 'SJ-US', name: 'San Jose', country: 'United States', state: 'California', type: 'city' },
  
  { id: 'MUM-IN', name: 'Mumbai', country: 'India', state: 'Maharashtra', type: 'city' },
  { id: 'DEL-IN', name: 'Delhi', country: 'India', state: 'Delhi', type: 'city' },
  { id: 'BAN-IN', name: 'Bangalore', country: 'India', state: 'Karnataka', type: 'city' },
  { id: 'HYD-IN', name: 'Hyderabad', country: 'India', state: 'Telangana', type: 'city' },
  { id: 'AHM-IN', name: 'Ahmedabad', country: 'India', state: 'Gujarat', type: 'city' },
  { id: 'CHE-IN', name: 'Chennai', country: 'India', state: 'Tamil Nadu', type: 'city' },
  { id: 'KOL-IN', name: 'Kolkata', country: 'India', state: 'West Bengal', type: 'city' },
  { id: 'PUN-IN', name: 'Pune', country: 'India', state: 'Maharashtra', type: 'city' },
  { id: 'JAI-IN', name: 'Jaipur', country: 'India', state: 'Rajasthan', type: 'city' },
  { id: 'LUC-IN', name: 'Lucknow', country: 'India', state: 'Uttar Pradesh', type: 'city' },
  
  // Other countries' major cities
  { id: 'LON-GB', name: 'London', country: 'United Kingdom', state: 'England', type: 'city' },
  { id: 'TOR-CA', name: 'Toronto', country: 'Canada', state: 'Ontario', type: 'city' },
  { id: 'SYD-AU', name: 'Sydney', country: 'Australia', state: 'New South Wales', type: 'city' },
  { id: 'BER-DE', name: 'Berlin', country: 'Germany', state: 'Berlin', type: 'city' },
  { id: 'PAR-FR', name: 'Paris', country: 'France', state: 'Île-de-France', type: 'city' },
  { id: 'TOK-JP', name: 'Tokyo', country: 'Japan', state: 'Tokyo', type: 'city' },
  { id: 'SAO-BR', name: 'São Paulo', country: 'Brazil', state: 'São Paulo', type: 'city' },
  { id: 'MEX-MX', name: 'Mexico City', country: 'Mexico', state: 'Mexico City', type: 'city' },
];

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Search for location...",
  className,
  onRequestLocation
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync input value with prop value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (inputValue.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    const filtered = LOCATIONS.filter(location =>
      location.name.toLowerCase().includes(inputValue.toLowerCase()) ||
      location.country.toLowerCase().includes(inputValue.toLowerCase()) ||
      (location.state && location.state.toLowerCase().includes(inputValue.toLowerCase()))
    ).slice(0, 10); // Limit to 10 suggestions

    setSuggestions(filtered);
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

    const totalItems = suggestions.length + (onRequestLocation ? 1 : 0);

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
      } else if (onRequestLocation) {
        handleRequestLocation();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleSelect = (location: Location) => {
    const displayValue = location.state 
      ? `${location.name}, ${location.state}, ${location.country}`
      : `${location.name}, ${location.country}`;
    
    onChange(displayValue);
    setIsOpen(false);
    setHighlightedIndex(-1);
    setSuggestions([]);
  };

  const handleRequestLocation = () => {
    if (onRequestLocation) {
      onRequestLocation();
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    
    if (newValue.trim().length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setSuggestions([]);
    }
  };

  const handleFocus = () => {
    if (inputValue.trim().length > 0) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
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

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'country':
        return '🌍';
      case 'state':
        return '🏛️';
      case 'city':
        return '🏙️';
      default:
        return '📍';
    }
  };

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
              {suggestions.length > 0 ? (
                suggestions.map((location, index) => (
                  <div
                    key={location.id}
                    className={cn(
                      'px-4 py-2 cursor-pointer text-sm hover:bg-accent',
                      highlightedIndex === index && 'bg-accent'
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(location);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getLocationIcon(location.type)}</span>
                        <div>
                          <div className="font-medium">{location.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {location.state 
                              ? `${location.state}, ${location.country}`
                              : location.country
                            }
                          </div>
                        </div>
                      </div>
                      {highlightedIndex === index && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </div>
                ))
              ) : inputValue.trim().length > 0 ? (
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  No locations found
                </div>
              ) : null}
              
              {onRequestLocation && inputValue.trim().length > 0 && (
                <div
                  className={cn(
                    'px-4 py-2 cursor-pointer text-sm hover:bg-accent border-t',
                    highlightedIndex === suggestions.length && 'bg-accent'
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleRequestLocation();
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <Plus className="h-4 w-4 text-primary" />
                    <span className="text-primary">Request &quot;{inputValue.trim()}&quot; to be added</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
