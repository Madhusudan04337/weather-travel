import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "../../hooks/useDebounce";
import { cityApi } from "../../services/cityApi";
import type { CitySuggestion } from "../../services/cityApi";

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
}

export function CityAutocomplete({ value, onChange, error, label = "Destination City" }: CityAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearchTerm = useDebounce(inputValue, 300);

  const { data: suggestions = [], isFetching } = useQuery({
    queryKey: ["cities", debouncedSearchTerm],
    queryFn: () => cityApi.searchCities(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length >= 3,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Sync external value changes
  useEffect(() => {
    if (value !== inputValue) {
      // Prevent overwriting a rich display string (e.g., "City, State") with the short form value ("City")
      if (inputValue.startsWith(value) && inputValue.includes(",")) {
        return;
      }
      setInputValue(value || "");
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatCityName = (city: CitySuggestion) => {
    return [city.name, city.state, city.country].filter(Boolean).join(", ");
  };

  const handleSelect = (city: CitySuggestion) => {
    const formatted = formatCityName(city);
    setInputValue(formatted);
    onChange(city.name); // Store only the city name in the form
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setIsOpen(true);
    setSelectedIndex(-1);
    if (val === "") {
      onChange(""); // Clear the value if emptied
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || debouncedSearchTerm.length < 3) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {label} <span className="text-danger">*</span>
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder="Type to search cities..."
          className={`
            w-full bg-surface border rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors
            ${error ? "border-danger focus:ring-danger/50 focus:border-danger" : "border-border"}
          `}
        />
        {isFetching && debouncedSearchTerm.length >= 3 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-danger mt-1.5">{error}</p>}

      {isOpen && inputValue.length >= 3 && !isFetching && (
        <div className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((city, index) => (
                <li
                  key={`${city.latitude}-${city.longitude}`}
                  className={`
                    px-4 py-2 cursor-pointer flex items-center gap-2
                    ${index === selectedIndex ? "bg-surface-hover text-primary" : "text-foreground hover:bg-surface-hover"}
                  `}
                  onClick={() => handleSelect(city)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <span className="text-muted text-sm">📍</span>
                  {formatCityName(city)}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-muted">No cities found.</div>
          )}
        </div>
      )}
    </div>
  );
}
