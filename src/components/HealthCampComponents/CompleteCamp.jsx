import React, { useState, useEffect } from "react";
import { database } from "../../firebase/config";
import { ref, get, update } from "firebase/database";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import CampSearch from "./SubComponents/CampSearch";
import CampStatusView from "./IncompleteCamps";
import VendorDetailsSection from "./SubComponents/VendorDetails";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const DEFAULT_TEST_PRICE = 300;

const initialFormState = {
  // Camp Details (Auto-filled and read-only)
  campCode: "",
  date: "",
  clinicCode: "",
  address: "",
  district: "",
  state: "",
  pinCode: "",
  nurseName: "",
  mobileNo: "",
  tl: "",
  tlEmpId: "",
  dcName: "",
  dcEmpId: "",

  // Financial Details
  unitsSold: "",
  revenue: "",
  amountPaidToFinance: "",
  marketingExpense: "",
  operationalExpense: "",
  transactionId: "",

  // Partner Details
  partnerType: "",

  partnerName: "",
  partnerAdjustedCount: "",
  partnerAdjustmentAmount: "",

  // Phlebotomist Details
  vendorName: "", // Add this line

  phleboName: "",
  phleboMobileNo: "",
};

const CompleteCamp = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [campFound, setCampFound] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasPartnerAdjustment, setHasPartnerAdjustment] = useState(false);
  const [campKey, setCampKey] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [isCancelled, setIsCancelled] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const handleBackClick = () => {
    resetForm();
    navigate("/health-camp");
  };

  const fetchCampData = async (campCode) => {
    if (!campCode) return;

    setLoading(true);
    setError("");
    try {
      const campsRef = ref(database, "healthCamps");
      const snapshot = await get(campsRef);

      if (snapshot.exists()) {
        const camps = Object.entries(snapshot.val());
        const [key, camp] =
          camps.find(
            ([_, camp]) =>
              camp.campCode?.toUpperCase() === campCode.toUpperCase()
          ) || [];

        if (camp) {
          setCampKey(key);
          setCampFound(true);
          setIsCompleted(camp.status === "completed");
          setIsCancelled(camp.status === "cancelled");

          // Convert text data to uppercase when loading
          const uppercaseData = Object.entries(camp).reduce(
            (acc, [key, value]) => {
              if (
                typeof value === "string" &&
                ![
                  "completedAt",
                  "createdAt",
                  "lastModified",
                  "cancelledAt",
                ].includes(key) &&
                !value.includes("@")
              ) {
                acc[key] = value.toUpperCase();
              } else {
                acc[key] = value;
              }
              return acc;
            },
            {}
          );

          if (camp.status === "completed" || camp.status === "cancelled") {
            setFormData({ ...initialFormState, ...uppercaseData });
            setHasPartnerAdjustment(!!camp.partnerName);
          } else {
            setFormData({
              ...initialFormState,
              ...uppercaseData,
              // Reset financial and partner fields for incomplete camps
              unitsSold: "",
              revenue: "",
              amountPaidToFinance: "",
              marketingExpense: "",
              operationalExpense: "",
              transactionId: "",
              partnerName: "",
              partnerAdjustedCount: "",
              partnerAdjustmentAmount: "",
              phleboName: "",
              phleboMobileNo: "",
            });
          }
        } else {
          setError("Camp not found");
          setCampFound(false);
          setIsCompleted(false);
          setIsCancelled(false);
          setFormData(initialFormState);
        }
      }
    } catch (err) {
      console.error("Error fetching camp data:", err);
      setError("Error fetching camp data: " + err.message);
      setFormData(initialFormState);
    } finally {
      setLoading(false);
    }
  };
  const handleCancelCamp = async () => {
    setLoading(true);
    setError("");

    try {
      const updates = {
        status: "cancelled",
        cancelledBy: currentUser.email,
        cancelledAt: new Date().toISOString(),
      };

      const campRef = ref(database, `healthCamps/${campKey}`);
      await update(campRef, updates);

      alert("Camp cancelled successfully!");
      resetForm();
      navigate("/health-camp");
    } catch (err) {
      setError("Failed to cancel camp: " + err.message);
    } finally {
      setLoading(false);
      setShowCancelDialog(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (isCompleted) return;

    let processedValue = value;
    let updates = {};

    // Convert text inputs to uppercase, leave numbers as is
    if (
      ![
        "unitsSold",
        "revenue",
        "amountPaidToFinance",
        "marketingExpense",
        "operationalExpense",
        "partnerAdjustedCount",
        "partnerAdjustmentAmount",
        "partnerType", // Add partnerType to excluded list
      ].includes(name)
    ) {
      processedValue = value.toUpperCase();
    }

    updates[name] = processedValue;

    // Calculate revenue based on units sold
    if (name === "unitsSold") {
      const units = parseInt(value) || 0;
      const testPrice =
        formData.partnerType === "HUMANA" ? 500 : DEFAULT_TEST_PRICE;
      updates.revenue = (units * testPrice).toString();
    }

    // Calculate partner adjustment amount based on partner type and count
    if (name === "partnerAdjustedCount" || name === "partnerType") {
      const count =
        name === "partnerType"
          ? parseInt(formData.partnerAdjustedCount) || 0
          : parseInt(value) || 0;

      const partnerType = name === "partnerType" ? value : formData.partnerType;

      if (partnerType === "PAHAL") {
        updates.partnerAdjustmentAmount = (count * 150).toString();
      } else if (partnerType === "HUMANA") {
        updates.partnerAdjustmentAmount = (count * 500).toString();
        // Update revenue if partner type changes to HUMANA
        if (name === "partnerType" && formData.unitsSold) {
          updates.revenue = (parseInt(formData.unitsSold) * 500).toString();
        }
      }
    }

    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const validateFinancials = () => {
    const {
      revenue,
      amountPaidToFinance,
      marketingExpense,
      operationalExpense,
      partnerAdjustmentAmount,
    } = formData;

    const baseExpenses =
      parseInt(amountPaidToFinance || 0) +
      parseInt(marketingExpense || 0) +
      parseInt(operationalExpense || 0);

    if (hasPartnerAdjustment && partnerAdjustmentAmount) {
      const totalExpenses =
        baseExpenses + parseInt(partnerAdjustmentAmount || 0);
      return totalExpenses === parseInt(revenue || 0);
    }

    return baseExpenses === parseInt(revenue || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFinancials()) {
      setError("Total expenses must equal revenue");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const updates = {
        status: "completed",
        unitsSold: formData.unitsSold,
        revenue: formData.revenue,
        amountPaidToFinance: formData.amountPaidToFinance,
        marketingExpense: formData.marketingExpense,
        operationalExpense: formData.operationalExpense,
        transactionId: formData.transactionId,
        vendorName: formData.vendorName,
        phleboName: formData.phleboName,
        phleboMobileNo: formData.phleboMobileNo,
        completedBy: currentUser.email,
        completedAt: new Date().toISOString(),
      };

      if (hasPartnerAdjustment) {
        updates.partnerName = formData.partnerName;
        updates.partnerAdjustedCount = formData.partnerAdjustedCount;
        updates.partnerAdjustmentAmount = formData.partnerAdjustmentAmount;
      }

      const campRef = ref(database, `healthCamps/${campKey}`);
      await update(campRef, updates);

      alert("Camp completed successfully!");
      resetForm();
      navigate("/health-camp");
    } catch (err) {
      setError("Failed to complete camp: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setCampFound(false);
    setError("");
    setHasPartnerAdjustment(false);
    setCampKey(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9v4a1 1 0 102 0V9a1 1 0 10-2 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      <CampStatusView
        activeContext="complete"
        onCampCodeClick={(campCode) => {
          // Handle camp code click, e.g., populate search
          setFormData((prev) => ({ ...prev, campCode }));
          fetchCampData(campCode);
        }}
      />
      {/* Camp Code Search */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Search Camp</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Camp Code
            {campFound && (
              <span
                className={`ml-2 text-xs ${
                  isCompleted ? "text-orange-600" : "text-green-600"
                }`}
              >
                {isCompleted ? "✓ Camp Already Completed" : "✓ Camp Found"}
              </span>
            )}
          </label>
          <CampSearch
            value={formData.campCode}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, campCode: value }))
            }
            onCampFound={(key, camp) => {
              setCampKey(key);
              setCampFound(true);
              setIsCompleted(camp.status === "completed");

              if (camp.status === "completed") {
                setFormData((prev) => ({
                  ...prev,
                  ...camp,
                }));
                setHasPartnerAdjustment(!!camp.partnerName);
              } else {
                setFormData((prev) => ({
                  ...prev,
                  ...camp,
                  unitsSold: "",
                  revenue: "",
                  amountPaidToFinance: "",
                  marketingExpense: "",
                  operationalExpense: "",
                  transactionId: "",
                  partnerName: "",
                  partnerAdjustedCount: "",
                  partnerAdjustmentAmount: "",
                  phleboName: "",
                  phleboMobileNo: "",
                }));
              }
              setError("");
            }}
            onError={setError}
            onLoading={setLoading}
            checkCompletion={false}
          />
        </div>
      </div>

      {campFound && (
        <>
          {/* Camp Details Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Camp Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Same camp details fields as before, all read-only */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="text"
                  value={formData.date}
                  readOnly
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Clinic Code
                </label>
                <input
                  type="text"
                  value={formData.clinicCode}
                  readOnly
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  readOnly
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  District
                </label>
                <input
                  type="text"
                  value={formData.district}
                  readOnly
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  readOnly
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pin Code
                </label>
                <input
                  type="text"
                  value={formData.pinCode}
                  readOnly
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100"
                />
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center gap-4 mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Partner Adjustment
              </h3>
              <div className="flex items-center">
                <label className="mr-2 text-md font-medium text-black">
                  Enable
                </label>
                <input
                  type="checkbox"
                  checked={hasPartnerAdjustment}
                  onChange={(e) =>
                    !isCompleted && setHasPartnerAdjustment(e.target.checked)
                  }
                  disabled={isCompleted}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
            </div>

            {hasPartnerAdjustment && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Partner Type
                  </label>
                  <select
                    name="partnerType"
                    value={formData.partnerType}
                    onChange={handleChange}
                    required={hasPartnerAdjustment}
                    disabled={isCompleted}
                    className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 ${
                      isCompleted
                        ? "bg-gray-100"
                        : "focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    }`}
                  >
                    <option value="">Select Partner</option>
                    <option value="PAHAL">PAHAL</option>
                    <option value="HUMANA">HUMANA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Partner Adjusted Count
                  </label>
                  <input
                    type="number"
                    name="partnerAdjustedCount"
                    value={formData.partnerAdjustedCount}
                    onChange={handleChange}
                    required={hasPartnerAdjustment}
                    min="0"
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
                    Partner Adjustment Amount
                  </label>
                  <input
                    type="number"
                    name="partnerAdjustmentAmount"
                    value={formData.partnerAdjustmentAmount}
                    readOnly
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Financial Details Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Financial Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tests Done
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="unitsSold"
                  value={formData.unitsSold}
                  onChange={handleChange}
                  required
                  readOnly={isCompleted}
                  className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    isCompleted
                      ? "bg-gray-100"
                      : "focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Revenue
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  name="revenue"
                  value={formData.revenue}
                  readOnly
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Transaction ID
                </label>
                <input
                  type="text"
                  name="transactionId"
                  value={formData.transactionId}
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
                  Amount Paid to Finance
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="amountPaidToFinance"
                  value={formData.amountPaidToFinance}
                  onChange={handleChange}
                  required
                  readOnly={isCompleted}
                  className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    isCompleted
                      ? "bg-gray-100"
                      : "focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Marketing Expense
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="marketingExpense"
                  value={formData.marketingExpense}
                  onChange={handleChange}
                  required
                  readOnly={isCompleted}
                  className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    isCompleted
                      ? "bg-gray-100"
                      : "focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Operational Expense
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="operationalExpense"
                  value={formData.operationalExpense}
                  onChange={handleChange}
                  required
                  readOnly={isCompleted}
                  className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    isCompleted
                      ? "bg-gray-100"
                      : "focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  }`}
                />
              </div>
            </div>
          </div>

          <VendorDetailsSection
            formData={formData}
            handleChange={handleChange}
            isCompleted={isCompleted}
          />

          {/* Financial Summary */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900 mb-4">
              Financial Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-blue-700">Total Revenue:</span>
                <span className="ml-2 font-medium">₹{formData.revenue}</span>
              </div>
              <div>
                <span className="text-sm text-blue-700">Amount Matched:</span>
                <span className="ml-2 font-medium">
                  ₹
                  {(
                    parseInt(formData.amountPaidToFinance || 0) +
                    parseInt(formData.marketingExpense || 0) +
                    parseInt(formData.operationalExpense || 0) +
                    (hasPartnerAdjustment
                      ? parseInt(formData.partnerAdjustmentAmount || 0)
                      : 0)
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Form Controls */}
          <div className="flex justify-end space-x-4 mt-8">
            {!isCompleted && !isCancelled && (
              <>
                {/* Cancel Camp Button */}
                {campFound && (
                  <button
                    type="button"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={loading}
                    className="bg-red-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      "Cancel Camp"
                    )}
                  </button>
                )}

                {/* Clear Form Button */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      campCode: "",
                      date: "",
                      clinicCode: "",
                      address: "",
                      district: "",
                      state: "",
                      pinCode: "",
                      nurseName: "",
                      mobileNo: "",
                      tl: "",
                      tlEmpId: "",
                      dcName: "",
                      dcEmpId: "",
                      unitsSold: "",
                      revenue: "",
                      amountPaidToFinance: "",
                      marketingExpense: "",
                      operationalExpense: "",
                      transactionId: "",
                      partnerName: "",
                      partnerAdjustedCount: "",
                      partnerAdjustmentAmount: "",
                      phleboName: "",
                      phleboMobileNo: "",
                    });
                    setCampFound(false);
                    setError("");
                    setHasPartnerAdjustment(false);
                  }}
                  disabled={loading}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear Form
                </button>

                {/* Complete Camp Button */}
                <button
                  type="submit"
                  disabled={loading || !campFound}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Complete Camp"
                  )}
                </button>
              </>
            )}

            {/* Back/Cancel Button */}
            <button
              type="button"
              onClick={handleBackClick}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              {isCompleted || isCancelled ? "Back" : "Cancel"}
            </button>
          </div>

          {/* Status Notifications */}
          {isCompleted && (
            <div className="mt-4 bg-orange-50 border-l-4 border-orange-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-orange-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-orange-700">
                    This camp has already been completed. All fields are
                    read-only.
                  </p>
                  <p className="text-sm text-orange-700 mt-1">
                    Completed by: {formData.completedBy} on{" "}
                    {new Date(formData.completedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cancelled Camp Notification */}
          {isCancelled && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    This camp has been cancelled. All fields are read-only.
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    Cancelled by: {formData.cancelledBy} on{" "}
                    {new Date(formData.cancelledAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cancel Confirmation Dialog */}
          <AlertDialog
            open={showCancelDialog}
            onOpenChange={setShowCancelDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Camp</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel this camp? This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No, keep camp</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={handleCancelCamp}
                >
                  Yes, cancel camp
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </form>
  );
};

export default CompleteCamp;
