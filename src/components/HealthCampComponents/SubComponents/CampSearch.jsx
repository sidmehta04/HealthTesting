import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { database } from "../../../firebase/config";
import { ref, get } from "firebase/database";

const CampSearch = ({ 
  onCampFound, 
  onError, 
  onLoading,
  value,
  onChange,
  disabled = false,
  checkCompletion = false 
}) => {
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setSearchTerm(value || "");
  }, [value]);

  const fetchCampData = async (campCode) => {
    if (!campCode || campCode.length < 7) return;

    onLoading?.(true);
    try {
      const campsRef = ref(database, "healthCamps");
      const snapshot = await get(campsRef);

      if (snapshot.exists()) {
        const camps = Object.entries(snapshot.val());
        const [key, camp] = camps.find(([_, camp]) => camp.campCode === campCode) || [];

        if (camp) {
          if (checkCompletion && camp.status === "completed") {
            onError?.("This camp has already been completed");
            return;
          }
          onCampFound?.(key, camp);
        } else {
          onError?.("Camp not found");
        }
      }
    } catch (err) {
      console.error("Error fetching camp data:", err);
      onError?.("Error fetching camp data: " + err.message);
    } finally {
      onLoading?.(false);
    }
  };

  const fetchSuggestions = async (searchText) => {
    if (!searchText || searchText.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const campsRef = ref(database, "healthCamps");
      const snapshot = await get(campsRef);

      if (snapshot.exists()) {
        const camps = Object.values(snapshot.val());
        const filteredCamps = camps
          .filter(camp => {
            const matchesSearch = camp.campCode?.toLowerCase().includes(searchText.toLowerCase());
            if (checkCompletion) {
              return matchesSearch && camp.status !== "completed";
            }
            return matchesSearch;
          })
          .slice(0, 5)
          .map(camp => camp.campCode);
        
        setSuggestions(filteredCamps);
      }
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange?.(newValue);
    setShowSuggestions(true);
    fetchSuggestions(newValue);
    
    if (newValue.length >= 7) {
      fetchCampData(newValue);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    onChange?.(suggestion);
    setShowSuggestions(false);
    fetchCampData(suggestion);
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          disabled={disabled}
          placeholder="Enter camp code (e.g., MSHC)"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
        />
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50"
            >
              <span className="block truncate">{suggestion}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampSearch;