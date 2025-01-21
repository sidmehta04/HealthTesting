// Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { database } from "../firebase/config";
import { ref, onValue } from "firebase/database";
import { HealthCampComponent } from "./DataBaseRetrival/HealthEntries";
import { IndividualComponent } from "./DataBaseRetrival/IndividualEntries";

const Dashboard = () => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();

  // Data states
  const [healthCampData, setHealthCampData] = useState([]);
  const [individualData, setIndividualData] = useState([]);

  // Filter values states with safe defaults
  const [healthCampFilters, setHealthCampFilters] = useState({
    campCode: "all",
    clinicCode: "all",
    date: "all",
    status: "all",
  });

  const [individualFilters, setIndividualFilters] = useState({
    testCode: "all",
    testName: "all",
    submittedAt: "all",
    reportStatus: "all",
    vendorStatus: "all",
  });

  // Updated filter options state
  const [filterOptions, setFilterOptions] = useState({
    campCodes: [],
    clinicCodes: [],
    dates: [],
    statuses: [],
    testCodes: [],
    testNames: [],
    submittedDates: [],
    reportStatuses: [],
    vendorStatuses: [],
  });

  useEffect(() => {
    // Fetch health camp data if user has appropriate role
    if (userRole === "health-camp-admin" || userRole === "superadmin") {
      const healthCampRef = ref(database, "healthCamps");
      onValue(healthCampRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const formattedData = Object.entries(data).map(([id, camp]) => ({
            id,
            ...camp,
          }));
          setHealthCampData(formattedData);

          // Extract unique values for filters
          const uniqueStatuses = [
            ...new Set(
              formattedData.map((camp) => camp.status).filter(Boolean)
            ),
          ].sort();

          setFilterOptions((prev) => ({
            ...prev,
            campCodes: [
              ...new Set(
                formattedData.map((camp) => camp.campCode).filter(Boolean)
              ),
            ].sort(),
            clinicCodes: [
              ...new Set(
                formattedData.map((camp) => camp.clinicCode).filter(Boolean)
              ),
            ].sort(),
            dates: [
              ...new Set(
                formattedData.map((camp) => camp.date).filter(Boolean)
              ),
            ].sort(),
            statuses: uniqueStatuses,
          }));
        }
      });
    }

    // Fetch individual test data if user has appropriate role
    if (
      userRole === "health-camp-admin" ||
      userRole === "individual-camp-admin" ||
      userRole === "superadmin"
    ) {
      const testEntriesRef = ref(database, "testEntries");
      onValue(testEntriesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const formattedData = Object.entries(data).map(([id, entry]) => ({
            id,
            ...entry,
          }));
          setIndividualData(formattedData);

          // Extract unique values for filters
          const uniqueReportStatuses = [
            ...new Set(
              formattedData.map((entry) => entry.reportStatus).filter(Boolean)
            ),
          ].sort();

          const uniqueVendorStatuses = [
            ...new Set(
              formattedData.map((entry) => entry.vendorStatus).filter(Boolean)
            ),
          ].sort();

          setFilterOptions((prev) => ({
            ...prev,
            testCodes: [
              ...new Set(
                formattedData.map((entry) => entry.testCode).filter(Boolean)
              ),
            ].sort(),
            testNames: [
              ...new Set(
                formattedData.map((entry) => entry.testName).filter(Boolean)
              ),
            ].sort(),
            submittedDates: [
              ...new Set(
                formattedData
                  .map((entry) =>
                    entry.submitter?.submittedAt
                      ? new Date(entry.submitter.submittedAt).toLocaleDateString()
                      : ""
                  )
                  .filter(Boolean)
              ),
            ].sort(),
            reportStatuses: uniqueReportStatuses,
            vendorStatuses: uniqueVendorStatuses,
          }));
        }
      });
    }
  }, [userRole]);

  const handleHealthCampFilterChange = (filterKey, value) => {
    setHealthCampFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  const handleIndividualFilterChange = (filterKey, value) => {
    setIndividualFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-12xl">
        <div className="px-4 py-6 sm:px-0">
          {(userRole === "health-camp-admin" || userRole === "superadmin") && (
            <HealthCampComponent
              data={healthCampData}
              filters={healthCampFilters}
              filterOptions={filterOptions}
              onFilterChange={handleHealthCampFilterChange}
            />
          )}

          {(userRole === "health-camp-admin" ||
            userRole === "individual-camp-admin" ||
            userRole === "superadmin") && (
            <IndividualComponent
              data={individualData}
              filters={individualFilters}
              filterOptions={filterOptions}
              onFilterChange={handleIndividualFilterChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;