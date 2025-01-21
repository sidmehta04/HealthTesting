import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

const SearchableSelect = ({
  options,
  value,
  onValueChange,
  placeholder,
  allOptionLabel,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  
  // Update searchTerm when value changes
  useEffect(() => {
    if (value === "all") {
      setSearchTerm("");
    } else {
      setSearchTerm(value);
    }
  }, [value]);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    // Only show dropdown if there's text in the search box and there are matching options
    setIsOpen(newSearchTerm.length > 0 && filteredOptions.length > 0);
  };

  const handleOptionClick = (selectedValue) => {
    onValueChange(selectedValue);
    setIsOpen(false);
  };

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".searchable-select")) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-64 searchable-select">
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        className="w-full"
      />
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="py-1">
            {searchTerm.length > 0 && (
              <div
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleOptionClick("all")}
              >
                {allOptionLabel}
              </div>
            )}
            {filteredOptions.map((option) => (
              <div
                key={option}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;