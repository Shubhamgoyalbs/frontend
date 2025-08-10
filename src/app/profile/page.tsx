"use client"

import {useEffect, useState, useCallback} from "react";
import axios, {AxiosError} from "axios";
import {
    AlertCircle,
    Camera,
    Check,
    Edit3,
    Home,
    LogOut,
    Mail,
    MapPin,
    Phone,
    RefreshCw,
    Save,
    Shield,
    Upload,
    User,
    X
} from "lucide-react";
import {useRouter} from "next/navigation";
import {LoadingPage} from "@/components/LoadingPage";
import {useAuth} from "@/context/AuthContext";
import {SellerInfo} from "@/types/ProductSeller";
import {getUserIdFromToken} from "@/utils/jwtUtils";
import api from "@/utils/axios";
import UserNavbar from "@/components/user/UserNavbar";
import SellerNavbar from "@/components/seller/SellerNavbar";
import Image from "next/image"; // Import the Next.js Image component

export default function Profile() {
    const router = useRouter();

    // State management
    const [profile, setProfile] = useState<SellerInfo | null>(null);
    const [originalProfile, setOriginalProfile] = useState<SellerInfo | null>(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [saving, setSaving] = useState(false);
    const [editingFields, setEditingFields] = useState<Set<string>>(new Set());
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [hasChanges, setHasChanges] = useState(false);
    const {role, token, logout, loading} = useAuth();
    const CLOUDINARY_CLOUD_NAME = "dsly26h0t"
    const CLOUDINARY_UPLOAD_PRESET = "unsigned_profile_uploads"

    // Get userId from token safely
    const userId: number | null = token ? getUserIdFromToken(token) : null;

    // Fix: Wrap fetchProfile in useCallback to prevent it from changing on every render.
    const fetchProfile = useCallback(async () => {
        // Safety check for userId
        if (!userId) {
            setError("User ID not found. Please login again.");
            setPageLoading(false);
            return;
        }

        try {
            setPageLoading(true);
            setError("");
            const response = await api.get(`/api/profile/fetch/${userId}`);
            setProfile(response.data);
            setOriginalProfile(response.data);
        } catch (err) {
            setError("Failed to fetch profile");
            console.error("Error fetching profile:", err);
        } finally {
            setPageLoading(false);
        }
    }, [userId]);

    // Fetch profile on the component load
    useEffect(() => {
        // Wait for auth loading to complete
        if (loading) return;

        // If no token, logout user
        if (!token) {
            logout();
            return;
        }

        // If token exists but no userId found, handle error
        if (token && !userId) {
            setError("Invalid user session. Please login again.");
            setPageLoading(false);
            return;
        }

        // Only fetch if we have a valid userId
        if (userId) {
            fetchProfile();
        }
    }, [token, userId, loading, logout, fetchProfile]);

    // Check for changes
    useEffect(() => {
        if (profile && originalProfile) {
            const hasProfileChanges = (
                profile.username !== originalProfile.username ||
                profile.phoneNo !== originalProfile.phoneNo ||
                profile.hostelName !== originalProfile.hostelName ||
                profile.roomNumber !== originalProfile.roomNumber ||
                profile.location !== originalProfile.location ||
                profile.profileImage !== originalProfile.profileImage
            );
            setHasChanges(hasProfileChanges);
        }
    }, [profile, originalProfile]);

    const handleFieldEdit = (fieldName: string) => {
        setEditingFields(prev => new Set([...prev, fieldName]));
    };

    const handleFieldCancel = (fieldName: keyof SellerInfo) => {
        if (profile && originalProfile) {
            setProfile({...profile, [fieldName]: originalProfile[fieldName]});
        }
        setEditingFields(prev => {
            const newSet = new Set(prev);
            newSet.delete(fieldName);
            return newSet;
        });
    };

    // Fix: Use keyof SellerInfo to avoid TypeScript error
    const handleFieldChange = (fieldName: keyof SellerInfo, value: string) => {
        if (profile) {
            setProfile({...profile, [fieldName]: value});
        }
    };

    const handleSaveChanges = async () => {
        if (!profile || !hasChanges || !userId) return;

        // Additional safety checks
        if (!token) {
            setError("Session expired. Please login again.");
            logout();
            return;
        }

        try {
            setSaving(true);
            setError("");

            const updateData: Partial<SellerInfo> = {};

            // Only include changed fields
            updateData.username = profile.username;
            updateData.phoneNo = profile.phoneNo;
            updateData.hostelName = profile.hostelName;
            updateData.roomNumber = profile.roomNumber;
            updateData.location = profile.location;
            updateData.profileImage = profile.profileImage;

            const response = await api.put(`/api/profile/update/${userId}`, updateData);

            setOriginalProfile(response.data.profile);
            setEditingFields(new Set());
            setError("");
        } catch (err: unknown) { // Fix: Changed 'any' to 'unknown'
            let errorMessage = "Failed to save changes";
            if (axios.isAxiosError(err) && err.response?.data?.error) {
                errorMessage = err.response.data.error;
            }
            setError(errorMessage);
            console.error("Error saving profile:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleCancelChanges = () => {
        if (originalProfile) {
            setProfile({...originalProfile});
            setEditingFields(new Set());
        }
    };

    const handleLogout = async () => {
        if (!window.confirm("Are you sure you want to logout?")) {
            return;
        }

        try {
            logout()
        } catch (err) {
            console.error("Error logging out:", err);
            // Still redirect even if logout API fails
            router.push("/");
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError("Please select a valid image file");
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError("File size must be less than 5MB");
                return;
            }

            setSelectedFile(file);

            // Create preview URL directly from the file
            const fileUrl = URL.createObjectURL(file);
            setPreviewUrl(fileUrl);
            setError("");
        }
    };

    const clearSelectedFile = () => {
        setSelectedFile(null);
        setPreviewUrl("");
        setError("");
    };

    const handleImageUpload = async () => {
        if (!selectedFile || !userId) {
            setError(!selectedFile ? "Please select an image file" : "User ID not found");
            return;
        }

        // Check for valid session
        if (!token) {
            setError("Session expired. Please login again.");
            logout();
            return;
        }

        try {
            setSaving(true);

            /// Step 1: Upload image to Cloudinary
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
            formData.append("cloud_name", CLOUDINARY_CLOUD_NAME);

            const cloudinaryResponse = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                formData,
                {
                    headers: {"X-Requested-With": "XMLHttpRequest"}
                }
            );

            const imageUrl = cloudinaryResponse.data.secure_url;
            console.log("Cloudinary URL:", imageUrl);

            if (!profile) {
                return;
            }

            profile.profileImage = imageUrl;

            await api.put(`/api/profile/update/${userId}`, profile);

            setProfile(prev => prev ? {...prev, profileImage: imageUrl} : null);
            setOriginalProfile(prev => prev ? {...prev, profileImage: imageUrl} : null);

            setIsImageModalOpen(false);
            clearSelectedFile();
            setError("");
        } catch (err: unknown) { // Fix: Changed 'any' to 'unknown'
            let errorMessage = "Failed to process image";
            if (axios.isAxiosError(err) && err.response?.data?.error) {
                errorMessage = err.response.data.error;
            }
            setError(errorMessage);
            console.error("Error processing image:", err);
            setSaving(false);
        }
    };

    const isFieldEditing = (fieldName: string) => editingFields.has(fieldName);

    // Show loading while auth is being checked
    if (loading || pageLoading) {
        return <LoadingPage/>;
    }

    // If no token after auth loading is complete, don't render anything (logout will redirect)
    if (!token || !userId) {
        return <LoadingPage/>;
    }

    if (!profile) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4"/>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
                    <p className="text-gray-600 mb-6">Unable to load profile information.</p>
                    <button
                        onClick={() => router.push("/")}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 bg-gradient-to-br from-blue-50 via-white to-blue-50">

            {/*navbar*/}

            {role === "USER" && <UserNavbar/>}
            {role === "SELLER" && <SellerNavbar/>}

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500"/>
                        <p className="text-red-700">{error}</p>
                        <button
                            onClick={() => setError("")}
                            className="ml-auto text-red-500 hover:text-red-700"
                        >
                            <X className="w-4 h-4"/>
                        </button>
                    </div>
                )}

                {/* Profile Card */}
                <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 text-white">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div
                                    className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-2 border-white/30">
                                    {profile.profileImage ? (
                                        <Image
                                            src={profile.profileImage}
                                            alt={profile.username}
                                            width={80}
                                            height={80}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-10 h-10 text-white"/>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsImageModalOpen(true)}
                                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                                >
                                    <Camera className="w-3 h-3"/>
                                </button>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{profile.username}</h2>
                                <p className="text-blue-100">{profile.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Shield className="w-4 h-4"/>
                                    <span className="text-sm bg-white/20 px-2 py-1 rounded-full capitalize">
                    {role}
                  </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Fields */}
                    <div className="p-6 space-y-6">
                        {/* Username */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3 flex-1">
                                <User className="w-5 h-5 text-blue-500"/>
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-600">Username</label>
                                    {isFieldEditing("username") ? (
                                        <div className="flex items-center gap-2 mt-1">
                                            <input
                                                type="text"
                                                value={profile.username}
                                                onChange={(e) => handleFieldChange("username", e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                onClick={() => setEditingFields(prev => {
                                                    const newSet = new Set(prev);
                                                    newSet.delete("username");
                                                    return newSet;
                                                })}
                                                className="p-2 text-green-600 hover:text-green-700"
                                            >
                                                <Check className="w-4 h-4"/>
                                            </button>
                                            <button
                                                onClick={() => handleFieldCancel("username")}
                                                className="p-2 text-red-600 hover:text-red-700"
                                            >
                                                <X className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="font-semibold text-gray-900 mt-1">{profile.username}</p>
                                    )}
                                </div>
                            </div>
                            {!isFieldEditing("username") && (
                                <button
                                    onClick={() => handleFieldEdit("username")}
                                    className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    <Edit3 className="w-4 h-4"/>
                                </button>
                            )}
                        </div>

                        {/* Email (Non-editable) */}
                        <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                            <div className="flex items-center gap-3 flex-1">
                                <Mail className="w-5 h-5 text-gray-400"/>
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-600">Email</label>
                                    <p className="font-semibold text-gray-700 mt-1">{profile.email}</p>
                                </div>
                            </div>
                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">Non-editable</span>
                        </div>

                        {/* Phone Number */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3 flex-1">
                                <Phone className="w-5 h-5 text-blue-500"/>
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-600">Phone Number</label>
                                    {isFieldEditing("phoneNo") ? (
                                        <div className="flex items-center gap-2 mt-1">
                                            <input
                                                type="tel"
                                                value={profile.phoneNo}
                                                onChange={(e) => handleFieldChange("phoneNo", e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                onClick={() => setEditingFields(prev => {
                                                    const newSet = new Set(prev);
                                                    newSet.delete("phoneNo");
                                                    return newSet;
                                                })}
                                                className="p-2 text-green-600 hover:text-green-700"
                                            >
                                                <Check className="w-4 h-4"/>
                                            </button>
                                            <button
                                                onClick={() => handleFieldCancel("phoneNo")}
                                                className="p-2 text-red-600 hover:text-red-700"
                                            >
                                                <X className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="font-semibold text-gray-900 mt-1">{profile.phoneNo}</p>
                                    )}
                                </div>
                            </div>
                            {!isFieldEditing("phoneNo") && (
                                <button
                                    onClick={() => handleFieldEdit("phoneNo")}
                                    className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    <Edit3 className="w-4 h-4"/>
                                </button>
                            )}
                        </div>

                        {/* Hostel Name */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3 flex-1">
                                <Home className="w-5 h-5 text-blue-500"/>
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-600">Hostel Name</label>
                                    {isFieldEditing("hostelName") ? (
                                        <div className="flex items-center gap-2 mt-1">
                                            <input
                                                type="text"
                                                value={profile.hostelName}
                                                onChange={(e) => handleFieldChange("hostelName", e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                onClick={() => setEditingFields(prev => {
                                                    const newSet = new Set(prev);
                                                    newSet.delete("hostelName");
                                                    return newSet;
                                                })}
                                                className="p-2 text-green-600 hover:text-green-700"
                                            >
                                                <Check className="w-4 h-4"/>
                                            </button>
                                            <button
                                                onClick={() => handleFieldCancel("hostelName")}
                                                className="p-2 text-red-600 hover:text-red-700"
                                            >
                                                <X className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="font-semibold text-gray-900 mt-1">{profile.hostelName}</p>
                                    )}
                                </div>
                            </div>
                            {!isFieldEditing("hostelName") && (
                                <button
                                    onClick={() => handleFieldEdit("hostelName")}
                                    className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    <Edit3 className="w-4 h-4"/>
                                </button>
                            )}
                        </div>

                        {/* Room Number */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3 flex-1">
                                <Home className="w-5 h-5 text-blue-500"/>
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-600">Room Number</label>
                                    {isFieldEditing("roomNumber") ? (
                                        <div className="flex items-center gap-2 mt-1">
                                            <input
                                                type="text"
                                                value={profile.roomNumber}
                                                onChange={(e) => handleFieldChange("roomNumber", e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                onClick={() => setEditingFields(prev => {
                                                    const newSet = new Set(prev);
                                                    newSet.delete("roomNumber");
                                                    return newSet;
                                                })}
                                                className="p-2 text-green-600 hover:text-green-700"
                                            >
                                                <Check className="w-4 h-4"/>
                                            </button>
                                            <button
                                                onClick={() => handleFieldCancel("roomNumber")}
                                                className="p-2 text-red-600 hover:text-red-700"
                                            >
                                                <X className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="font-semibold text-gray-900 mt-1">{profile.roomNumber}</p>
                                    )}
                                </div>
                            </div>
                            {!isFieldEditing("roomNumber") && (
                                <button
                                    onClick={() => handleFieldEdit("roomNumber")}
                                    className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    <Edit3 className="w-4 h-4"/>
                                </button>
                            )}
                        </div>

                        {/* Role (Non-editable) */}
                        <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                            <div className="flex items-center gap-3 flex-1">
                                <Shield className="w-5 h-5 text-gray-400"/>
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-600">Role</label>
                                    <p className="font-semibold text-gray-700 mt-1 capitalize">{role}</p>
                                </div>
                            </div>
                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">Non-editable</span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3 flex-1">
                                <MapPin className="w-5 h-5 text-blue-500"/>
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-600">Location</label>
                                    {isFieldEditing("location") ? (
                                        <div className="flex items-center gap-2 mt-1">
                                            <input
                                                type="text"
                                                value={profile.location || ""}
                                                onChange={(e) => handleFieldChange("location", e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter location"
                                            />
                                            <button
                                                onClick={() => setEditingFields(prev => {
                                                    const newSet = new Set(prev);
                                                    newSet.delete("location");
                                                    return newSet;
                                                })}
                                                className="p-2 text-green-600 hover:text-green-700"
                                            >
                                                <Check className="w-4 h-4"/>
                                            </button>
                                            <button
                                                onClick={() => handleFieldCancel("location")}
                                                className="p-2 text-red-600 hover:text-red-700"
                                            >
                                                <X className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="font-semibold text-gray-900 mt-1">{profile.location || "Not specified"}</p>
                                    )}
                                </div>
                            </div>
                            {!isFieldEditing("location") && (
                                <button
                                    onClick={() => handleFieldEdit("location")}
                                    className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    <Edit3 className="w-4 h-4"/>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-4">
                        <button
                            onClick={handleCancelChanges}
                            disabled={!hasChanges || saving}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                                hasChanges && !saving
                                    ? "bg-gray-500 hover:bg-gray-600 text-white"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                        >
                            <X className="w-4 h-4"/>
                            Cancel Changes
                        </button>

                        <button
                            onClick={handleSaveChanges}
                            disabled={!hasChanges || saving}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                                hasChanges && !saving
                                    ? "bg-green-500 hover:bg-green-600 text-white hover:shadow-lg hover:shadow-green-500/30"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                        >
                            {saving ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin"/>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4"/>
                                    Save Changes
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30"
                        >
                            <LogOut className="w-4 h-4"/>
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Image Upload Modal */}
            {isImageModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-backdrop-enter"
                        onClick={() => setIsImageModalOpen(false)}
                    />

                    {/* Modal */}
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-modal-enter">
                        {/* Header */}
                        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Upload Profile Image</h3>
                            <button
                                onClick={() => setIsImageModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5"/>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Image File
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                                    >
                                        <div className="text-center">
                                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2"/>
                                            <span className="text-sm text-gray-600">
                        {selectedFile ? selectedFile.name : "Click to select an image"}
                      </span>
                                            <p className="text-xs text-gray-400 mt-1">
                                                PNG, JPG, GIF up to 5MB
                                            </p>
                                        </div>
                                    </label>
                                </div>
                                {selectedFile && (
                                    <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                                        <span>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                        <button
                                            onClick={clearSelectedFile}
                                            className="text-red-600 hover:text-red-700 transition-colors"
                                        >
                                            <X className="w-4 h-4"/>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {previewUrl && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Preview
                                    </label>
                                    <div
                                        className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 mx-auto border-2 border-blue-200">
                                        <Image
                                            src={previewUrl}
                                            alt="Preview"
                                            width={96}
                                            height={96}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setIsImageModalOpen(false);
                                        clearSelectedFile();
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleImageUpload}
                                    disabled={!selectedFile || saving}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                                        selectedFile && !saving
                                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                                >
                                    {saving ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin"/>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4"/>
                                            Upload Image
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}