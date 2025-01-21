// IndividualComponent.jsx
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

export const IndividualComponent = ({
  data,
  filters,
  filterOptions,
  onFilterChange,
}) => {
  const filteredData = data.filter((record) => {
    const matchesTestCode =
      filters.testCode === "all" || record.testCode === filters.testCode;
    const matchesTestName =
      filters.testName === "all" || record.testName === filters.testName;
    const matchesSubmittedAt =
      filters.submittedAt === "all" ||
      new Date(record.submitter?.submittedAt).toLocaleDateString() ===
        filters.submittedAt;
    const matchesReportStatus =
      filters.reportStatus === "all" ||
      record.reportStatus?.toLowerCase() === filters.reportStatus?.toLowerCase();
    const matchesVendorStatus =
      filters.vendorStatus === "all" ||
      record.vendorStatus?.toLowerCase() === filters.vendorStatus?.toLowerCase();
    return (
      matchesTestCode &&
      matchesTestName &&
      matchesSubmittedAt &&
      matchesReportStatus &&
      matchesVendorStatus
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const statusColors = {
      submitted: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      active: "bg-purple-100 text-purple-800",
    };
    return statusColors[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Individual Test Records</CardTitle>
        <div className="flex flex-wrap gap-4 mt-4">
          <SearchableSelect
            options={filterOptions.testCodes}
            value={filters.testCode}
            onValueChange={(value) => onFilterChange("testCode", value)}
            placeholder="Filter by Test Code"
            allOptionLabel="All Test Codes"
          />
          <SearchableSelect
            options={filterOptions.testNames}
            value={filters.testName}
            onValueChange={(value) => onFilterChange("testName", value)}
            placeholder="Filter by Test Name"
            allOptionLabel="All Test Names"
          />
          <SearchableSelect
            options={filterOptions.submittedDates}
            value={filters.submittedAt}
            onValueChange={(value) => onFilterChange("submittedAt", value)}
            placeholder="Filter by Date"
            allOptionLabel="All Dates"
          />
          <SearchableSelect
            options={filterOptions.reportStatuses}
            value={filters.reportStatus}
            onValueChange={(value) => onFilterChange("reportStatus", value)}
            placeholder="Filter by Report Status"
            allOptionLabel="Report Status"
          />
          <SearchableSelect
            options={filterOptions.vendorStatuses}
            value={filters.vendorStatus}
            onValueChange={(value) => onFilterChange("vendorStatus", value)}
            placeholder="Filter by Vendor Status"
            allOptionLabel="Vendor Status"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Code</TableHead>
                <TableHead>Booking ID</TableHead>
                <TableHead>Patient Name</TableHead>
                <TableHead>Test Name</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Report Status</TableHead>
                <TableHead>Vendor Status</TableHead>
                <TableHead>Payment Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((record) => (
                  <TableRow key={record.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {record.testCode}
                    </TableCell>
                    <TableCell>{record.bookingId}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.name}</div>
                        <div className="text-sm text-gray-500">
                          {record.age} yrs, {record.gender}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{record.testName}</TableCell>
                    <TableCell>
                      {formatDate(record.submitter?.submittedAt)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${getStatusColor(record.reportStatus)}`}
                      >
                        {record.reportStatus}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${getStatusColor(record.vendorStatus)}`}
                      >
                        {record.vendorStatus}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium 
                          ${getStatusColor(record.paymentStatus)}`}
                        >
                          {record.paymentStatus}
                        </span>
                        <span className="text-xs text-gray-500">
                          {record.paymentMode} • ₹{record.price}
                        </span>
                      </div>
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