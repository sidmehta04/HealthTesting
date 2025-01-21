import React, { useState, useEffect } from "react";
import { database } from "../../firebase/config";
import { ref, push, get, set } from "firebase/database";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import StaffSearch from "./SubComponents/StaffSearch";
import {cn} from "@/lib/utils"

const ScheduledCamp = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isExistingClinic, setIsExistingClinic] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    date: "",
    campCode: "",
    clinicCode: "",
    address: "",
    district: "",
    state: "",
    pinCode: "",
    mobileNo: "",
    nurseName: "",
    teamLeader: "",
    dcName: "",
    agentName: "",
    roName: "",
    somName: "",
  });

  // Generate camp code when date changes
  useEffect(() => {
    if (formData.date) {
      const generateCampCode = () => {
        const dateStr = formData.date.replace(/-/g, "");
        const uniqueNum = Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0");
        return `MSHC${dateStr}${uniqueNum}`;
      };
      setFormData((prev) => ({ ...prev, campCode: generateCampCode() }));
    }
  }, [formData.date]);

  const resetForm = () => {
    setFormData({
      date: "",
      campCode: "",
      clinicCode: "",
      address: "",
      district: "",
      state: "",
      pinCode: "",
      mobileNo: "",
      nurseName: "",
      teamLeader: "",
      dcName: "",
      agentName: "",
      roName: "",
      somName: "",
    });
    setIsExistingClinic(false);
    setError("");
    setFormErrors({});
  };

  const validateStaffEntry = (value, field) => {
    if (!value) return false;
    const match = value.match(/^(.+)\s*\(([A-Z0-9]+)\)$/i);
    if (!match) return false;
    return true;
  };

  const addNewStaffMember = async (staffValue, role) => {
    const match = staffValue.match(/^(.+)\s*\(([A-Z0-9]+)\)$/i);
    if (!match) return false;

    const [_, name, empCode] = match;
    const roleType = role.replace(/s$/, '').toUpperCase();
    const displayName = `${name.trim()} (${empCode.toUpperCase()})`;

    try {
      const newStaffMember = {
        name: name.trim(),
        empCode: empCode.toUpperCase(),
        role: roleType,
        displayName
      };

      // Add to role-specific collection
      const roleRef = ref(database, `staffData/${role}/${empCode}`);
      await set(roleRef, newStaffMember);

      // Add to flattened collection
      const flattenedRef = ref(database, `staffFlattened/${empCode}`);
      await set(flattenedRef, newStaffMember);

      return true;
    } catch (error) {
      console.error('Error adding staff member:', error);
      return false;
    }
  };

  const fetchClinicData = async (clinicCode) => {
    if (!clinicCode) return;
    setLoading(true);
    try {
      const normalizedClinicCode = clinicCode.toUpperCase();
      
      // Check in clinics collection
      const clinicRef = ref(database, `clinics/${normalizedClinicCode}`);
      const clinicSnapshot = await get(clinicRef);
      
      if (clinicSnapshot.exists()) {
        const clinicInfo = clinicSnapshot.val();
        updateFormWithClinicData(clinicInfo);
        setIsExistingClinic(true);
        return;
      }

      // Check in previous camps
      const previousCampRef = ref(database, "healthCamps");
      const previousCampsSnapshot = await get(previousCampRef);
      
      if (previousCampsSnapshot.exists()) {
        const camps = Object.values(previousCampsSnapshot.val());
        const matchingCamp = camps.find(
          (camp) => camp.clinicCode?.toUpperCase() === normalizedClinicCode
        );
        
        if (matchingCamp) {
          updateFormWithClinicData(matchingCamp);
          setIsExistingClinic(true);
          
          // Store clinic data
          const newClinicRef = ref(database, `clinics/${normalizedClinicCode}`);
          await set(newClinicRef, {
            clinicCode: normalizedClinicCode,
            address: matchingCamp.address.toUpperCase(),
            district: matchingCamp.district.toUpperCase(),
            state: matchingCamp.state.toUpperCase(),
            pinCode: matchingCamp.pinCode.toUpperCase(),
            mobileNo: matchingCamp.mobileNo.toUpperCase(),
            nurseName: matchingCamp.nurseName,
            teamLeader: matchingCamp.teamLeader,
            dcName: matchingCamp.dcName,
            agentName: matchingCamp.agentName,
            roName: matchingCamp.roName,
            somName: matchingCamp.somName,
            lastUpdated: new Date().toISOString(),
          });
          return;
        }
      }
      
      // If no existing clinic is found
      setIsExistingClinic(false);
      setFormData(prev => ({
        ...prev,
        address: "",
        district: "",
        state: "",
        pinCode: "",
        mobileNo: "",
        nurseName: "",
        teamLeader: "",
        dcName: "",
        agentName: "",
        roName: "",
        somName: "",
      }));
      
    } catch (err) {
      console.error("Error fetching clinic data:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch clinic data: " + err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormWithClinicData = (data) => {
    setFormData((prev) => ({
      ...prev,
      address: (data.address || "").toUpperCase(),
      district: (data.district || "").toUpperCase(),
      state: (data.state || "").toUpperCase(),
      pinCode: (data.pinCode || "").toUpperCase(),
      mobileNo: (data.mobileNo || "").toUpperCase(),
      nurseName: data.nurseName || "",
      teamLeader: data.teamLeader || "",
      dcName: data.dcName || "",
      agentName: data.agentName || "",
      roName: data.roName || "",
      somName: data.somName || "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const upperValue = value.toUpperCase();
    
    if (name === "clinicCode" && value.length >= 3) {
      fetchClinicData(upperValue);
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: upperValue,
    }));
  };

  const validateForm = () => {
    const errors = {};

    // Required field validation
    const requiredFields = [
      'date', 'clinicCode', 'address', 'district', 
      'state', 'pinCode', 'mobileNo'
    ];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        errors[field] = 'This field is required';
      }
    });

    // Pin code validation
    if (formData.pinCode && !/^\d{6}$/.test(formData.pinCode)) {
      errors.pinCode = 'Pin code must be 6 digits';
    }

    // Mobile number validation
    if (formData.mobileNo && !/^\d{10}$/.test(formData.mobileNo)) {
      errors.mobileNo = 'Mobile number must be 10 digits';
    }

    // Staff validation
    const staffFields = {
      nurseName: 'nurses',
      teamLeader: 'teamLeaders',
      dcName: 'districtCoordinators',
      agentName: 'agents',
      roName: 'regionalOfficers',
      somName: 'salesOfficerManagers'
    };

    for (const [field, role] of Object.entries(staffFields)) {
      if (!formData[field]) {
        errors[field] = 'Staff member is required';
      } else if (!validateStaffEntry(formData[field], field)) {
        errors[field] = 'Invalid staff format. Use: NAME (CODE)';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      // If not an existing clinic, add new staff members
      if (!isExistingClinic) {
        const staffFields = {
          nurseName: 'nurses',
          teamLeader: 'teamLeaders',
          dcName: 'districtCoordinators',
          agentName: 'agents',
          roName: 'regionalOfficers',
          somName: 'salesOfficerManagers'
        };

        for (const [field, role] of Object.entries(staffFields)) {
          if (formData[field]) {
            const success = await addNewStaffMember(formData[field], role);
            if (!success) {
              setError(`Failed to add ${field} to staff database`);
              setLoading(false);
              return;
            }
          }
        }
      }

      // Prepare camp data
      const newCamp = {
        ...formData,
        status: "scheduled",
        createdBy: currentUser.email,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      // Save camp data
      const campRef = ref(database, "healthCamps");
      await push(campRef, newCamp);

      // Save or update clinic data
      const clinicRef = ref(database, `clinics/${formData.clinicCode}`);
      await set(clinicRef, {
        clinicCode: formData.clinicCode,
        address: formData.address,
        district: formData.district,
        state: formData.state,
        pinCode: formData.pinCode,
        mobileNo: formData.mobileNo,
        nurseName: formData.nurseName,
        teamLeader: formData.teamLeader,
        dcName: formData.dcName,
        agentName: formData.agentName,
        roName: formData.roName,
        somName: formData.somName,
        lastUpdated: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Camp scheduled successfully!",
      });
      alert("Camp scheduled Successfully")
      
      resetForm();
      
    } catch (err) {
      console.error("Error scheduling camp:", err);
      setError("Failed to schedule camp: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <Card className="w-full max-w-8xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Schedule New Health Camp
          </CardTitle>
          <CardDescription>
            Fill in the details for a new health camp scheduling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Camp Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Calendar className="mr-2 text-primary" />
                  Camp Details
                </h3>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className={formErrors.date ? "border-red-500" : ""}
                  />
                  {formErrors.date && (
                    <span className="text-xs text-red-500">{formErrors.date}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Camp Code</Label>
                  <Input
                    type="text"
                    value={formData.campCode}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center">
                    Clinic Code
                    {isExistingClinic && (
                      <span className="ml-2 text-green-600 text-xs">
                        ✓ Clinic Found
                      </span>
                    )}
                  </Label>
                  <Input
                    type="text"
                    name="clinicCode"
                    value={formData.clinicCode}
                    onChange={handleChange}
                    required
                    className={formErrors.clinicCode ? "border-red-500" : ""}
                  />
                  {formErrors.clinicCode && (
                    <span className="text-xs text-red-500">{formErrors.clinicCode}</span>
                  )}
                </div>
              </div>

              {/* Location Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <MapPin className="mr-2 text-primary" />
                  Location Details
                </h3>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    readOnly={isExistingClinic}
                    className={cn(
                      formErrors.address ? "border-red-500" : "",
                      isExistingClinic && "bg-gray-100"
                    )}
                  />
                  {formErrors.address && (
                    <span className="text-xs text-red-500">{formErrors.address}</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>District</Label>
                    <Input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      required
                      readOnly={isExistingClinic}
                      className={cn(
                        formErrors.district ? "border-red-500" : "",
                        isExistingClinic && "bg-gray-100"
                      )}
                    />
                    {formErrors.district && (
                      <span className="text-xs text-red-500">{formErrors.district}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      readOnly={isExistingClinic}
                      className={cn(
                        formErrors.state ? "border-red-500" : "",
                        isExistingClinic && "bg-gray-100"
                      )}
                    />
                    {formErrors.state && (
                      <span className="text-xs text-red-500">{formErrors.state}</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pin Code</Label>
                    <Input
                      type="text"
                      name="pinCode"
                      value={formData.pinCode}
                      onChange={handleChange}
                      required
                      pattern="[0-9]{6}"
                      readOnly={isExistingClinic}
                      className={cn(
                        formErrors.pinCode ? "border-red-500" : "",
                        isExistingClinic && "bg-gray-100"
                      )}
                    />
                    {formErrors.pinCode && (
                      <span className="text-xs text-red-500">{formErrors.pinCode}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Mobile Number</Label>
                    <Input
                      type="tel"
                      name="mobileNo"
                      value={formData.mobileNo}
                      onChange={handleChange}
                      required
                      pattern="[0-9]{10}"
                      readOnly={isExistingClinic}
                      className={cn(
                        formErrors.mobileNo ? "border-red-500" : "",
                        isExistingClinic && "bg-gray-100"
                      )}
                    />
                    {formErrors.mobileNo && (
                      <span className="text-xs text-red-500">{formErrors.mobileNo}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Staff Details Section */}
            <div className="space-y-4 pt-6">
              <h3 className="text-lg font-semibold flex items-center">
                <User className="mr-2 text-primary" />
                Staff Details
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Nurse Name</Label>
                  <StaffSearch
                    value={formData.nurseName}
                    onSelect={(value) =>
                      setFormData((prev) => ({ ...prev, nurseName: value }))
                    }
                    role="nurses"
                    label="Select Nurse"
                    readOnly={isExistingClinic}
                    error={!!formErrors.nurseName}
                  />
                  {formErrors.nurseName && (
                    <span className="text-xs text-red-500">{formErrors.nurseName}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Team Leader</Label>
                  <StaffSearch
                    value={formData.teamLeader}
                    onSelect={(value) =>
                      setFormData((prev) => ({ ...prev, teamLeader: value }))
                    }
                    role="teamLeaders"
                    label="Select Team Leader"
                    readOnly={isExistingClinic}
                    error={!!formErrors.teamLeader}
                  />
                  {formErrors.teamLeader && (
                    <span className="text-xs text-red-500">{formErrors.teamLeader}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>DC Name</Label>
                  <StaffSearch
                    value={formData.dcName}
                    onSelect={(value) =>
                      setFormData((prev) => ({ ...prev, dcName: value }))
                    }
                    role="districtCoordinators"
                    label="Select DC"
                    readOnly={isExistingClinic}
                    error={!!formErrors.dcName}
                  />
                  {formErrors.dcName && (
                    <span className="text-xs text-red-500">{formErrors.dcName}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Agent Name</Label>
                  <StaffSearch
                    value={formData.agentName}
                    onSelect={(value) =>
                      setFormData((prev) => ({ ...prev, agentName: value }))
                    }
                    role="agents"
                    label="Select Agent"
                    readOnly={isExistingClinic}
                    error={!!formErrors.agentName}
                  />
                  {formErrors.agentName && (
                    <span className="text-xs text-red-500">{formErrors.agentName}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>RO Name</Label>
                  <StaffSearch
                    value={formData.roName}
                    onSelect={(value) =>
                      setFormData((prev) => ({ ...prev, roName: value }))
                    }
                    role="regionalOfficers"
                    label="Select RO"
                    readOnly={isExistingClinic}
                    error={!!formErrors.roName}
                  />
                  {formErrors.roName && (
                    <span className="text-xs text-red-500">{formErrors.roName}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>SOM Name</Label>
                  <StaffSearch
                    value={formData.somName}
                    onSelect={(value) =>
                      setFormData((prev) => ({ ...prev, somName: value }))
                    }
                    role="salesOfficerManagers"
                    label="Select SOM"
                    readOnly={isExistingClinic}
                    error={!!formErrors.somName}
                  />
                  {formErrors.somName && (
                    <span className="text-xs text-red-500">{formErrors.somName}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Form Controls */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  navigate("/health-camp");
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4">●</div>
                    Scheduling...
                  </>
                ) : (
                  "Schedule Camp"
                )}
              </Button>
            </div>

            {/* Existing Clinic Notification */}
            {isExistingClinic && (
              <Alert className="mt-4">
                <AlertTitle>Existing Clinic Found</AlertTitle>
                <AlertDescription>
                  All details have been auto-filled and locked based on previous clinic data.
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduledCamp;