import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LazyImage } from '@/components/ui/lazy-image';
import { apiRequest } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { 
  Search, 
  X, 
  Clock, 
  TrendingUp, 
  Package,
  Loader2 
} from 'lucide-react';

interface SearchSuggestion {
  type: 'product' | 'category' | 'query';
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  price?: number;
  badge?: string;
}

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  placeholder?: string;
  autoFocus?: boolean;
  showRecentSearches?: boolean;
  className?: string;
}

export function SearchBar({
  onSearch,
  onSuggestionSelect,
  placeholder = "Search for anxious superhero gear...",
  autoFocus = false,
  showRecentSearches = true,
  className
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions with debouncing
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: async () => {
      if (!query.trim() || query.length < 2) return [];
      
      const response = await apiRequest('GET', `/api/search/suggestions?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      
      return response.json() as Promise<SearchSuggestion[]>;
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Load recent searches from localStorage
  useEffect(() => {
    if (showRecentSearches && typeof window !== 'undefined') {
      const stored = localStorage.getItem('panickin-recent-searches');
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored));
        } catch {
          // Invalid JSON, ignore
        }
      }
    }
  }, [showRecentSearches]);

  // Save recent search
  const saveRecentSearch = useCallback((searchQuery: string) => {
    if (!showRecentSearches || !searchQuery.trim()) return;
    
    setRecentSearches(prev => {
      const updated = [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, 5);
      localStorage.setItem('panickin-recent-searches', JSON.stringify(updated));
      return updated;
    });
  }, [showRecentSearches]);

  // Handle search submission
  const handleSearch = useCallback((searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    
    saveRecentSearch(searchQuery);
    onSearch?.(searchQuery);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  }, [query, onSearch, saveRecentSearch]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
    if (suggestion.type === 'query') {
      setQuery(suggestion.title);
      handleSearch(suggestion.title);
    } else {
      onSuggestionSelect?.(suggestion);
      setIsOpen(false);
    }
  }, [onSuggestionSelect, handleSearch]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const suggestionsList = suggestions || [];
    const recentList = showRecentSearches && !query ? recentSearches.map(search => ({
      type: 'query' as const,
      id: search,
      title: search,
    })) : [];
    const allItems = [...suggestionsList, ...recentList];

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, allItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && allItems[selectedIndex]) {
          handleSuggestionSelect(allItems[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, suggestions, recentSearches, query, selectedIndex, handleSuggestionSelect, handleSearch, showRecentSearches]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prepare suggestions list
  const suggestionsList = suggestions || [];
  const recentList = showRecentSearches && !query ? recentSearches.slice(0, 3) : [];
  const hasContent = suggestionsList.length > 0 || recentList.length > 0;

  return (
    <div className={cn("relative w-full max-w-lg", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          className="pl-10 pr-10 h-12"
        />
        
        {/* Clear button */}
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              setSelectedIndex(-1);
              inputRef.current?.focus();
            }}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && hasContent && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {/* Recent Searches */}
            {!query && recentList.length > 0 && (
              <div className="p-3 border-b border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Recent Searches</span>
                </div>
                <div className="space-y-1">
                  {recentList.map((search, index) => (
                    <motion.button
                      key={search}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSuggestionSelect({
                        type: 'query',
                        id: search,
                        title: search,
                      })}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                        selectedIndex === suggestionsList.length + index
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      )}
                    >
                      {search}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {suggestionsList.length > 0 && (
              <div className="p-3">
                {query && (
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Suggestions</span>
                  </div>
                )}
                <div className="space-y-1">
                  {suggestionsList.map((suggestion, index) => (
                    <motion.button
                      key={suggestion.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className={cn(
                        "w-full text-left p-3 rounded-md transition-colors group",
                        selectedIndex === index
                          ? "bg-primary/10"
                          : "hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* Icon or Image */}
                        {suggestion.imageUrl ? (
                          <LazyImage
                            src={suggestion.imageUrl}
                            alt={suggestion.title}
                            className="w-8 h-8 rounded object-cover"
                            width={32}
                            height={32}
                          />
                        ) : (
                          <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">
                              {suggestion.title}
                            </span>
                            {suggestion.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {suggestion.badge}
                              </Badge>
                            )}
                          </div>
                          {suggestion.subtitle && (
                            <p className="text-xs text-muted-foreground truncate">
                              {suggestion.subtitle}
                            </p>
                          )}
                        </div>

                        {/* Price */}
                        {suggestion.price && (
                          <span className="text-sm font-bold text-primary">
                            ${suggestion.price}
                          </span>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {query && !isLoading && suggestionsList.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  No suggestions found for "{query}"
                </p>
                <Button
                  size="sm"
                  onClick={() => handleSearch()}
                  className="text-xs"
                >
                  Search anyway
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Quick search hook for integrating with product filters
export function useQuickSearch() {
  return {
    clearRecentSearches: () => {
      localStorage.removeItem('panickin-recent-searches');
    },
    getRecentSearches: () => {
      try {
        const stored = localStorage.getItem('panickin-recent-searches');
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
  };
}