import React, { useState, useEffect } from 'react';
import { database } from "../../../firebase/config";
import { ref, get, set } from "firebase/database";
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const StaffSearch = ({ 
  onSelect, 
  value = "", 
  role = "", 
  label = "Select staff",
  readOnly = false,
  className = "",
  error = false
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isValidSelection, setIsValidSelection] = useState(true);

  // Initialize searchQuery with current value
  useEffect(() => {
    setSearchQuery(value || "");
  }, [value]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const path = role ? `staffData/${role}` : 'staffFlattened';
        const staffRef = ref(database, path);
        const snapshot = await get(staffRef);
        
        if (snapshot.exists()) {
          const staffData = snapshot.val();
          const staffArray = Object.values(staffData || {});
          setStaff(staffArray);
        } else {
          setStaff([]);
        }
      } catch (error) {
        console.error('Error fetching staff:', error);
        setStaff([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [role]);

  const handleInputChange = (e) => {
    const input = e.target.value;
    setSearchQuery(input);
    setShowDropdown(true);
    setIsValidSelection(false); // Reset validation on manual input
    onSelect(input); // Pass raw input to parent
  };

  const handleSelect = (person) => {
    setSearchQuery(person.displayName);
    setIsValidSelection(true);
    onSelect(person.displayName);
    setShowDropdown(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  // Filter staff based on search query
  const filteredStaff = searchQuery ? staff.filter(person => 
    person.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.empCode.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder={`${label} - Format: NAME (CODE)`}
        value={searchQuery}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className={cn(
          "w-full",
          readOnly && "bg-gray-100 cursor-not-allowed",
          error && "border-red-500"
        )}
        disabled={loading || readOnly}
      />
      {showDropdown && searchQuery && !readOnly && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-md border shadow-lg">
          <ScrollArea className="h-auto max-h-48">
            {filteredStaff.length === 0 ? (
              <div className="py-2 px-3 text-sm text-gray-500">
                Enter in format: NAME (CODE) or select from list
              </div>
            ) : (
              <div className="py-1">
                {filteredStaff.map((person) => (
                  <button
                    key={person.empCode}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100",
                      value === person.displayName && "bg-gray-100"
                    )}
                    onClick={() => handleSelect(person)}
                  >
                    {person.displayName}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default StaffSearch;