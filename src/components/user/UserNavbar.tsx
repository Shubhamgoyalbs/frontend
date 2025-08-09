"use client";

import {useState} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import HostelBitesLogo from "@/components/HostelBitesLogo";

export default function UserNavbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const NavLink = ({href, children, isMobile = false}: {
        href: string;
        children: React.ReactNode;
        isMobile?: boolean
    }) => {
        const isActive = pathname === href;
        return (
            <Link
                href={href}
                className={`font-medium transition-colors relative group ${
                    isMobile ? 'block py-2 px-2 rounded-lg hover:bg-white/40' : ''
                } ${
                    isActive ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
            >
                {isMobile ? (
                    children
                ) : (
                    <span className="relative">
            {children}
                        <span className={`absolute bottom-0 left-0 h-0.5 bg-blue-600 transition-all duration-300 ${
                            isActive ? 'w-full' : 'w-0 group-hover:w-full'
                        }`}></span>
          </span>
                )}
            </Link>
        );
    };

    return (
        <nav
            className="fixed top-3 left-3 right-3 z-50 backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-saturate-200">
            <div className="flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center">
                    <HostelBitesLogo className="h-8 w-auto"/>
                </div>

                {/* Desktop Navigation Links */}
                <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center space-x-8">
                    <NavLink href="/user/home">Home</NavLink>
                    <NavLink href="/login">Login</NavLink>
                    <NavLink href="/user/orders">Orders</NavLink>
                </div>

                {/* Desktop Right Side - Cart and Profile */}
                <div className="hidden md:flex items-center space-x-3">
                    <Link href="/user/cart"
                          className="flex items-center justify-center w-10 h-10 bg-white/30 backdrop-blur-sm rounded-xl hover:bg-white/40 transition-all duration-200 group border border-white/20">
                        <svg className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors" fill="none"
                             stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.68 3.4a1 1 0 00.9 1.6h9.78M7 13v6a2 2 0 002 2h4a2 2 0 002-2v-6m-6 0a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                    </Link>
                    <Link href="/user/profile" className="flex items-center group">
                        <div
                            className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform duration-200 shadow-lg">
                            👤
                        </div>
                    </Link>
                </div>

                {/* Mobile Hamburger Menu */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden flex items-center justify-center w-10 h-10 bg-white/30 backdrop-blur-sm rounded-xl hover:bg-white/40 transition-all duration-200 border border-white/20"
                >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isMobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"/>
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M4 6h16M4 12h16M4 18h16"/>
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden absolute top-full right-0 mt-2 w-48 backdrop-blur-xl bg-white/90 border border-white/30 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-saturate-200 z-50">
                    <div className="p-3 space-y-1 ">
                        <NavLink href="/user/home" isMobile={true}>Home</NavLink>
                        <NavLink href="/login" isMobile={true}>Login</NavLink>
                        <NavLink href="/user/orders" isMobile={true}>Orders</NavLink>

                        <Link href="/user/cart"
                              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors font-medium py-2 px-2 rounded-lg hover:bg-white/40">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.68 3.4a1 1 0 00.9 1.6h9.78M7 13v6a2 2 0 002 2h4a2 2 0 002-2v-6m-6 0a2 2 0 012-2h2a2 2 0 012 2"/>
                            </svg>
                            <span>Cart</span>
                        </Link>

                        <Link href="/user/profile"
                              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors font-medium py-2 px-2 rounded-lg hover:bg-white/40">
                            <div
                                className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">
                                👤
                            </div>
                            <span>Profile</span>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}