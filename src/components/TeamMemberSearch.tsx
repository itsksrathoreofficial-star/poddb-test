import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronDown, X, Plus, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Person {
  id: string;
  name: string;
  photo_urls?: string[];
  bio?: string;
  roles?: string[];
}

interface TeamMemberSearchProps {
  onSelectUser: (person: Person) => void;
  onCreateNew: () => void;
  placeholder?: string;
  className?: string;
}

export function TeamMemberSearch({
  onSelectUser,
  onCreateNew,
  placeholder = "Search for existing people...",
  className
}: TeamMemberSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [people, setPeople] = useState<Person[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchPeople = async () => {
      if (searchTerm.trim().length === 0) {
        setPeople([]);
        setIsOpen(false);
        return;
      }

      try {
        setLoading(true);
        // Search for people in the people table
        const { data, error } = await supabase
          .from('people')
          .select('id, full_name, photo_urls, bio')
          .ilike('full_name', `%${searchTerm.trim()}%`)
          .limit(10);

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        // Transform the data to match our Person interface
        const transformedPeople = (data || []).map((person: any) => ({
          id: person.id,
          name: person.full_name,
          photo_urls: person.photo_urls || [],
          bio: person.bio || '',
          roles: [] // People table doesn't have roles, so we'll use empty array
        }));

        setPeople(transformedPeople);
        // Keep suggestions open if there are results or if user is still typing
        setIsOpen(transformedPeople.length > 0 || searchTerm.trim().length > 0);
      } catch (error) {
        console.error('Error searching people:', error);
        setPeople([]);
        setIsOpen(false);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchPeople, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

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

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < people.length ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      const selected = people[highlightedIndex];
      handleSelectPerson(selected);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleSelectPerson = (person: Person) => {
    onSelectUser(person);
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    setPeople([]);
  };

  const handleCreateNew = () => {
    onCreateNew();
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    setPeople([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    // Keep suggestions open when there's text, even if typing stops
    if (newValue.trim().length > 0) {
      setIsOpen(true);
      // Don't clear people array immediately - let the debounced search handle it
    } else {
      setIsOpen(false);
      setPeople([]);
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
    }, 300);
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
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="pr-10"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1"
              onClick={() => {
                setSearchTerm('');
                setPeople([]);
                setIsOpen(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      {/* Suggestions dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
          <ScrollArea className="max-h-64">
            <div ref={suggestionsRef} className="py-1">
              {loading ? (
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  Searching...
                </div>
              ) : people.length > 0 ? (
                people.map((person, index) => (
                  <div
                    key={person.id}
                    className={cn(
                      'px-4 py-3 cursor-pointer hover:bg-accent',
                      highlightedIndex === index && 'bg-accent'
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectPerson(person);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={person.photo_urls?.[0]} alt={person.name} />
                        <AvatarFallback>
                          {person.name?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {person.name || 'Unnamed Person'}
                        </div>
                        {person.bio && (
                          <div className="text-xs text-muted-foreground truncate">
                            {person.bio}
                          </div>
                        )}
                        {person.roles && person.roles.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {person.roles.slice(0, 2).map((role, roleIndex) => (
                              <Badge key={roleIndex} variant="secondary" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                            {person.roles.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{person.roles.length - 2} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      {highlightedIndex === index && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </div>
                ))
              ) : null}
              
              {searchTerm.trim().length > 0 && (
                <div
                  className={cn(
                    'px-4 py-3 cursor-pointer hover:bg-accent border-t',
                    highlightedIndex === people.length && 'bg-accent'
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleCreateNew();
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Plus className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-primary">
                        Create New Member
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Add &quot;{searchTerm.trim()}&quot; as a new team member
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {!loading && people.length === 0 && searchTerm.trim().length > 0 && (
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  No people found
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
