"use client";

import {useRouter} from 'next/navigation';
import {RegisterDetails} from "@/types/RegisterDetails"
import {useState} from "react";
import Link from "next/link";
import HostelBitesLogo from "@/components/HostelBitesLogo";
import api from "@/utils/axios";
import axios from "axios";

export default function Register() {
    const [formData, setFormData] = useState<RegisterDetails>({
        username: "",
        email: "",
        password: "",
        phoneNo: "",
        location: "",
        role: "USER",
        roomNo: "",
        hostelName: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const router = useRouter();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.username.trim()) {
            newErrors.username = "Username is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }

        if (!formData.phoneNo.trim()) {
            newErrors.phoneNo = "Phone number is required";
        }

        if (!formData.location.trim()) {
            newErrors.location = "Location is required";
        }

        if (!formData.role.trim()) {
            newErrors.role = "Role is required";
        }

        if (!formData.roomNo.trim()) {
            newErrors.roomNo = "Room number is required";
        }

        if (!formData.hostelName.trim()) {
            newErrors.hostelName = "Hostel name is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {

        console.log("registering...")
        console.log(formData)

        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post(
                "/auth/register",
                formData
            );

            if (response.status == 201) {
                console.log("Registration successful:", JSON.stringify(response.data));
                alert("Registration successful!");
            }
            await router.push("/login");

        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error("Server responded with error:", error.response?.data);
                alert(
                    error.response?.data?.message ||
                    JSON.stringify(error.response?.data) || // fallback to raw data
                    "Registration failed"
                );
            } else {
                console.error("Error making request:", error);
                alert("An error occurred. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleRegister = () => {
        console.log("Google register clicked");
        alert("Google OAuth registration would be implemented here!");
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
                <div
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
                <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
            </div>

            {/* Floating translucent panel */}
            <div
                className="max-w-lg w-full space-y-8 relative z-10 backdrop-blur-lg bg-white/30 border border-white/20 rounded-2xl p-8 shadow-2xl shadow-black/10">
                <div>
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <HostelBitesLogo className="h-16 w-auto"/>
                    </div>
                    <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-800">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-700">
                        Or{" "}
                        <Link
                            href="/login"
                            className="font-medium text-blue-700 hover:text-blue-600 transition-colors relative group"
                        >
              <span className="relative">
                sign in to your existing account
                <span
                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </span>
                        </Link>
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    {/* Google Register Button */}
                    <div>
                        <button
                            type="button"
                            onClick={handleGoogleRegister}
                            className="group relative w-full flex justify-center py-3 px-4 border border-white/30 text-sm font-medium rounded-xl text-gray-700 bg-white/40 backdrop-blur-sm hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                        >
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Continue with Google
                            </div>
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/30"/>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white/20 backdrop-blur-sm rounded-lg text-gray-700">Or register with email</span>
                        </div>
                    </div>

                    {/* Registration Form */}
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            {/* Username */}
                            <div className="relative">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className={`peer w-full px-3 pt-6 pb-2 border ${
                                        errors.username ? 'border-red-400' : 'border-white/30'
                                    } text-gray-800 bg-white/20 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200`}
                                    placeholder=" "
                                />
                                <label
                                    htmlFor="username"
                                    className={`absolute left-3 top-2 text-xs font-medium text-gray-600 transition-all duration-200 pointer-events-none
                    peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500
                    peer-focus:text-xs peer-focus:top-2 peer-focus:text-blue-600
                    ${formData.username ? 'text-xs top-2 text-blue-600' : ''}`}
                                >
                                    Username
                                </label>
                                {errors.username && (
                                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="relative">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`peer w-full px-3 pt-6 pb-2 border ${
                                        errors.email ? 'border-red-400' : 'border-white/30'
                                    } text-gray-800 bg-white/20 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200`}
                                    placeholder=" "
                                />
                                <label
                                    htmlFor="email"
                                    className={`absolute left-3 top-2 text-xs font-medium text-gray-600 transition-all duration-200 pointer-events-none
                    peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500
                    peer-focus:text-xs peer-focus:top-2 peer-focus:text-blue-600
                    ${formData.email ? 'text-xs top-2 text-blue-600' : ''}`}
                                >
                                    Email Address
                                </label>
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`peer w-full px-3 pt-6 pb-2 border ${
                                        errors.password ? 'border-red-400' : 'border-white/30'
                                    } text-gray-800 bg-white/20 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200`}
                                    placeholder=" "
                                />
                                <label
                                    htmlFor="password"
                                    className={`absolute left-3 top-2 text-xs font-medium text-gray-600 transition-all duration-200 pointer-events-none
                    peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500
                    peer-focus:text-xs peer-focus:top-2 peer-focus:text-blue-600
                    ${formData.password ? 'text-xs top-2 text-blue-600' : ''}`}
                                >
                                    Password
                                </label>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div className="relative">
                                <input
                                    id="phoneNo"
                                    name="phoneNo"
                                    type="text"
                                    required
                                    value={formData.phoneNo}
                                    onChange={handleInputChange}
                                    className={`peer w-full px-3 pt-6 pb-2 border ${
                                        errors.phoneNo ? 'border-red-400' : 'border-white/30'
                                    } text-gray-800 bg-white/20 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200`}
                                    placeholder=" "
                                />
                                <label
                                    htmlFor="phoneNo"
                                    className={`absolute left-3 top-2 text-xs font-medium text-gray-600 transition-all duration-200 pointer-events-none
                    peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500
                    peer-focus:text-xs peer-focus:top-2 peer-focus:text-blue-600
                    ${formData.phoneNo ? 'text-xs top-2 text-blue-600' : ''}`}
                                >
                                    Phone Number
                                </label>
                                {errors.phoneNo && (
                                    <p className="mt-1 text-sm text-red-600">{errors.phoneNo}</p>
                                )}
                            </div>

                            {/* Location */}
                            <div className="relative">
                                <input
                                    id="location"
                                    name="location"
                                    type="text"
                                    required
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    className={`peer w-full px-3 pt-6 pb-2 border ${
                                        errors.location ? 'border-red-400' : 'border-white/30'
                                    } text-gray-800 bg-white/20 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200`}
                                    placeholder=" "
                                />
                                <label
                                    htmlFor="location"
                                    className={`absolute left-3 top-2 text-xs font-medium text-gray-600 transition-all duration-200 pointer-events-none
                    peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500
                    peer-focus:text-xs peer-focus:top-2 peer-focus:text-blue-600
                    ${formData.location ? 'text-xs top-2 text-blue-600' : ''}`}
                                >
                                    Location
                                </label>
                                {errors.location && (
                                    <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                                )}
                            </div>

                            {/* Role */}
                            <div className="relative">
                                <select
                                    id="role"
                                    name="role"
                                    required
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className={`peer w-full px-3 pt-6 pb-2 border ${
                                        errors.role ? 'border-red-400' : 'border-white/30'
                                    } text-gray-800 bg-white/20 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 appearance-none`}
                                >
                                    <option value="USER">User</option>
                                    <option value="SELLER">Seller</option>
                                </select>
                                <label
                                    htmlFor="role"
                                    className={`absolute left-3 top-2 text-xs font-medium text-gray-600 transition-all duration-200 pointer-events-none
                    ${formData.role ? 'text-xs top-2 text-blue-600' : 'text-sm top-4 text-gray-500'}`}
                                >
                                    Role
                                </label>
                                {errors.role && (
                                    <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                                )}
                            </div>

                            {/* Room Number */}
                            <div className="relative">
                                <input
                                    id="roomNo"
                                    name="roomNo"
                                    type="text"
                                    required
                                    value={formData.roomNo}
                                    onChange={handleInputChange}
                                    className={`peer w-full px-3 pt-6 pb-2 border ${
                                        errors.roomNo ? 'border-red-400' : 'border-white/30'
                                    } text-gray-800 bg-white/20 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200`}
                                    placeholder=" "
                                />
                                <label
                                    htmlFor="roomNo"
                                    className={`absolute left-3 top-2 text-xs font-medium text-gray-600 transition-all duration-200 pointer-events-none
                    peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500
                    peer-focus:text-xs peer-focus:top-2 peer-focus:text-blue-600
                    ${formData.roomNo ? 'text-xs top-2 text-blue-600' : ''}`}
                                >
                                    Room Number
                                </label>
                                {errors.roomNo && (
                                    <p className="mt-1 text-sm text-red-600">{errors.roomNo}</p>
                                )}
                            </div>

                            {/* Hostel Name */}
                            <div className="relative">
                                <input
                                    id="hostelName"
                                    name="hostelName"
                                    type="text"
                                    required
                                    value={formData.hostelName}
                                    onChange={handleInputChange}
                                    className={`peer w-full px-3 pt-6 pb-2 border ${
                                        errors.hostelName ? 'border-red-400' : 'border-white/30'
                                    } text-gray-800 bg-white/20 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200`}
                                    placeholder=" "
                                />
                                <label
                                    htmlFor="hostelName"
                                    className={`absolute left-3 top-2 text-xs font-medium text-gray-600 transition-all duration-200 pointer-events-none
                    peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500
                    peer-focus:text-xs peer-focus:top-2 peer-focus:text-blue-600
                    ${formData.hostelName ? 'text-xs top-2 text-blue-600' : ''}`}
                                >
                                    Hostel Name
                                </label>
                                {errors.hostelName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.hostelName}</p>
                                )}
                            </div>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="flex items-center">
                            <input
                                id="agree-terms"
                                name="agree-terms"
                                type="checkbox"
                                required
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-white/30 rounded bg-white/20 backdrop-blur-sm"
                            />
                            <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-800">
                                I agree to the{" "}
                                <a href="#"
                                   className="text-blue-700 hover:text-blue-600 transition-colors relative group">
                  <span className="relative">
                    Terms and Conditions
                    <span
                        className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                  </span>
                                </a>{" "}
                                and{" "}
                                <a href="#"
                                   className="text-blue-700 hover:text-blue-600 transition-colors relative group">
                  <span className="relative">
                    Privacy Policy
                    <span
                        className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                  </span>
                                </a>
                            </label>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/25"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div
                                            className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creating account...
                                    </div>
                                ) : (
                                    "Create account"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
