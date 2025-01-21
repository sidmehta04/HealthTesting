import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const vendors = [
  { label: "Red cliff", value: "RED_CLIFF" },
  { label: "Healthians", value: "HEALTHIANS" },
  { label: "Tata1mg", value: "TATA1MG" },
  { label: "Goraksh Diagnostic", value: "GORAKSH_DIAGNOSTIC" },
];

const VendorDetailsSection = ({ formData, handleChange, isCompleted }) => {
  const handleVendorSelect = (value) => {
    handleChange({
      target: {
        name: "vendorName",
        value: value
      }
    });
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Vendor Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Vendor
          </label>
          <Select
            value={formData.vendorName}
            onValueChange={handleVendorSelect}
            disabled={isCompleted}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select vendor" />
            </SelectTrigger>
            <SelectContent>
              {vendors.map((vendor) => (
                <SelectItem key={vendor.value} value={vendor.value}>
                  {vendor.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phlebotomist Name
          </label>
          <input
            type="text"
            name="phleboName"
            value={formData.phleboName}
            onChange={handleChange}
            required
            readOnly={isCompleted}
            className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 ${
              isCompleted
                ? "bg-gray-100"
                : "focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phlebotomist Mobile Number
          </label>
          <input
            type="tel"
            name="phleboMobileNo"
            value={formData.phleboMobileNo}
            onChange={handleChange}
            required
            pattern="[0-9]{10}"
            readOnly={isCompleted}
            className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 ${
              isCompleted
                ? "bg-gray-100"
                : "focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default VendorDetailsSection;