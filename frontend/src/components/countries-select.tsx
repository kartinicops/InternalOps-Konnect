// Modified CountriesSelect.jsx component
"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { MapPin, Search, ChevronDown, X } from "lucide-react"
// Import countries from data file
import { countries } from "@/data/countries"

// Use named export to match the import in the page
export const CountriesSelect = ({ value, onChange, required = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCountries, setFilteredCountries] = useState(countries)
  const [isSearchMode, setIsSearchMode] = useState(false)
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)
  const triggerRef = useRef(null)

  // Filter countries based on search term
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredCountries(countries)
    } else {
      const filtered = countries.filter((country) => 
        country.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCountries(filtered)
    }
  }, [searchTerm])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          triggerRef.current && !triggerRef.current.contains(event.target)) {
        setIsOpen(false)
        setIsSearchMode(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Focus search input when search mode is activated
  useEffect(() => {
    if (isSearchMode && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchMode])

  // Toggle dropdown and search mode
  const toggleDropdown = () => {
    if (!isOpen) {
      setIsOpen(true)
      setIsSearchMode(true)
      setSearchTerm("")
      setFilteredCountries(countries)
    } else if (!isSearchMode) {
      setIsSearchMode(true)
    }
  }

  // Select a country
  const selectCountry = (country) => {
    onChange(country)
    setIsOpen(false)
    setIsSearchMode(false)
  }

  // Close search and dropdown
  const handleClose = () => {
    setIsOpen(false)
    setIsSearchMode(false)
  }

  // Determine dropdown container style based on filtered items count
  const getDropdownListStyle = () => {
    // If there are 4 or fewer countries, use auto height (flexible)
    // Each item is approximately 40px tall (padding + text)
    if (filteredCountries.length <= 4) {
      return { maxHeight: "auto", overflow: "auto" }
    }
    // Otherwise use fixed height with scrolling
    return { maxHeight: "120px", overflow: "auto" }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Select trigger/search input */}
      <div
        ref={triggerRef}
        className={`flex items-center justify-between h-10 px-3 border transition-all 
          ${isOpen 
            ? "rounded-t-lg rounded-b-none border-blue-500 shadow-sm" 
            : "rounded-lg border-gray-300 hover:border-gray-400"
          } cursor-pointer bg-white`}
        onClick={toggleDropdown}
      >
        {isSearchMode ? (
          // Search mode - show input
          <div className="flex items-center w-full">
            <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 shadow-none focus:ring-0 p-0 h-8 text-sm w-full"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          // Normal mode - show selected value or placeholder
          <>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-blue-500" />
              <span className={`text-sm ${value ? "font-medium text-gray-900" : "text-gray-500"}`}>
                {value || "Please select..."}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </>
        )}
        {required && !value && <input required className="sr-only" />}
      </div>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="absolute z-50 w-full bg-white border border-gray-200 border-t-0 rounded-b-lg shadow-lg"
        >
          {/* Country list */}
          <div style={getDropdownListStyle()} className="py-1">
            {filteredCountries.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {filteredCountries.map((country) => (
                  <div
                    key={country}
                    className={`px-3 py-2 text-sm cursor-pointer transition-colors
                      ${value === country 
                        ? "bg-blue-50 text-blue-700 font-medium" 
                        : "text-gray-700 hover:bg-gray-50"
                      }`}
                    onClick={() => selectCountry(country)}
                  >
                    {country}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-3 py-3 text-sm text-gray-500 text-center">
                No countries found
              </div>
            )}
          </div>
          
          {/* Footer with count */}
          <div className="p-1.5 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 text-right">
            {filteredCountries.length} countries
          </div>
        </div>
      )}
    </div>
  )
}