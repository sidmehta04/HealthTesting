// HealthCampComponent.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SearchableSelect from "./SearchableSelect";

export const HealthCampComponent = ({
  data,
  filters,
  filterOptions,
  onFilterChange,
}) => {
  const filteredData = data.filter((camp) => {
    const matchesCampCode =
      filters.campCode === "all" || camp.campCode === filters.campCode;
    const matchesClinicCode =
      filters.clinicCode === "all" || camp.clinicCode === filters.clinicCode;
    const matchesDate = filters.date === "all" || camp.date === filters.date;
    const matchesStatus =
      filters.status === "all" ||
      camp.status?.toLowerCase() === filters.status?.toLowerCase();
    return matchesCampCode && matchesClinicCode && matchesDate && matchesStatus;
  });

  const getStatusColor = (status) => {
    const statusColors = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      active: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return statusColors[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Health Camp Records</CardTitle>
        <div className="flex flex-wrap gap-4 mt-4">
          <SearchableSelect
            options={filterOptions.campCodes}
            value={filters.campCode}
            onValueChange={(value) => onFilterChange("campCode", value)}
            placeholder="Filter by Camp Code"
            allOptionLabel="All Camp Codes"
          />
          <SearchableSelect
            options={filterOptions.clinicCodes}
            value={filters.clinicCode}
            onValueChange={(value) => onFilterChange("clinicCode", value)}
            placeholder="Filter by Clinic Code"
            allOptionLabel="All Clinic Codes"
          />
          <SearchableSelect
            options={filterOptions.dates}
            value={filters.date}
            onValueChange={(value) => onFilterChange("date", value)}
            placeholder="Filter by Date"
            allOptionLabel="All Dates"
          />
          <SearchableSelect
            options={filterOptions.statuses}
            value={filters.status}
            onValueChange={(value) => onFilterChange("status", value)}
            placeholder="Filter by Status"
            allOptionLabel="All Statuses"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Camp Code</TableHead>
                <TableHead>Clinic Code</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Tests Sold</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((camp) => (
                  <TableRow key={camp.id} className="hover:bg-gray-50">
                    <TableCell>{camp.campCode}</TableCell>
                    <TableCell>{camp.clinicCode}</TableCell>
                    <TableCell>{camp.date}</TableCell>
                    <TableCell className="text-right">{camp.unitsSold}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${getStatusColor(camp.status)}`}
                      >
                        {camp.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};