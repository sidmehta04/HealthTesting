import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  CheckCircle2,
  FileBarChart2,
  User,
  ChevronRight,
  LockKeyhole,
  LogOut,
} from "lucide-react";
import TestEntry from "./TestComponents/TestEntry";
import VendorCheck from "./TestComponents/SubComponents/VendorCheck";
import ReportStatus from "./TestComponents/ReportStatus";
import { useAuth } from "../context/AuthContext";

const IndividualHealthCampForm = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("test-entry");
  const { currentUser } = useAuth();

  const isIndividualCampAdmin = currentUser?.role === "individual-camp-admin";

  const tabs = [
    {
      id: "test-entry",
      name: "Test Entry",
      component: TestEntry,
      icon: ClipboardList,
      description: "Record and manage test results",
      restricted: false,
    },
    {
      id: "vendor-check",
      name: "Vendor Booking",
      component: VendorCheck,
      icon: CheckCircle2,
      description: "Verify and manage vendors",
      restricted: isIndividualCampAdmin,
    },
    {
      id: "report-status",
      name: "Report Status",
      component: ReportStatus,
      icon: FileBarChart2,
      description: "Track report generation progress",
      restricted: isIndividualCampAdmin,
    },
  ];

  React.useEffect(() => {
    if (tabs.find((tab) => tab.id === activeTab)?.restricted) {
      setActiveTab("test-entry");
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100">
      {/* Improved Header with better spacing and visual hierarchy */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 px-8 py-6 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/15 rounded-xl backdrop-blur-sm">
                <ClipboardList className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  Test Management System
                </h1>
                <p className="text-blue-100 text-sm mt-1.5">
                  Streamlined healthcare test management
                </p>
              </div>
            </div>

            {/* Enhanced user profile section */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-2.5 backdrop-blur-sm">
                <User className="w-5 h-5 text-white" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">
                    {currentUser?.email}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="max-w-9xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Enhanced breadcrumb */}
            <div className="px-8 py-4 border-b border-gray-100 flex items-center space-x-2 text-sm bg-gray-50/50">
              <span className="text-gray-600">Dashboard</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-blue-600 font-medium">Test Management</span>
            </div>

            <div className="p-8">
              {/* Improved tab navigation with better visual feedback */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-3 rounded-xl">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => !tab.restricted && setActiveTab(tab.id)}
                    disabled={tab.restricted}
                    className={`
                      relative flex flex-col items-center
                      rounded-xl py-4 px-6
                      transition-all duration-300 ease-out
                      ${tab.restricted ? "opacity-50 cursor-not-allowed" : ""}
                      ${
                        activeTab === tab.id
                          ? "bg-white shadow-lg ring-2 ring-blue-600/10 scale-100"
                          : "hover:bg-white/80 hover:shadow-md hover:scale-102"
                      }
                    `}
                  >
                    <div
                      className={`
                      p-3 rounded-xl relative
                      transition-colors duration-200
                      ${
                        activeTab === tab.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }
                    `}
                    >
                      <tab.icon className="w-6 h-6" />
                      {tab.restricted && (
                        <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                          <LockKeyhole className="w-3 h-3 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="text-center mt-3">
                      <div
                        className={`
                        font-medium text-base
                        ${
                          activeTab === tab.id
                            ? "text-blue-600"
                            : "text-gray-700"
                        }
                      `}
                      >
                        {tab.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1.5 max-w-xs">
                        {tab.restricted ? "Access restricted" : tab.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Enhanced content area with smooth transitions */}
              <div className="mt-8">
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={`
                      transform transition-all duration-500 ease-in-out
                      ${
                        activeTab === tab.id
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-4 hidden"
                      }
                    `}
                  >
                    <div className="bg-white rounded-xl p-8 ring-1 ring-gray-100 shadow-sm">
                      <tab.component />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IndividualHealthCampForm;
