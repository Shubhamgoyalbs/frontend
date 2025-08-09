import {Loader2, Package, ShoppingBag, Users} from "lucide-react";

interface LoadingPageProps {
    message?: string;
    fullScreen?: boolean;
}

export function LoadingPage({
                                message = "Loading marketplace data...",
                                fullScreen = true
                            }: LoadingPageProps) {
    const containerClasses = fullScreen
        ? "min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center"
        : "p-8 flex items-center justify-center";

    return (
        <div className={containerClasses}>
            <div className="text-center max-w-md mx-auto">
                {/* Main Loading Animation */}
                <div className="relative mb-8">
                    {/* Outer rotating ring */}
                    <div className="w-24 h-24 mx-auto relative">
                        <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-spin">
                            <div
                                className="absolute top-0 left-1/2 w-2 h-2 bg-blue-600 rounded-full -translate-x-1/2 -translate-y-1"></div>
                        </div>

                        {/* Inner pulsing circle */}
                        <div
                            className="absolute inset-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center animate-pulse">
                            <ShoppingBag className="w-6 h-6 text-white"/>
                        </div>
                    </div>

                    {/* Floating icons */}
                    <div
                        className="absolute -top-4 -left-4 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center animate-bounce"
                        style={{animationDelay: '0.5s'}}>
                        <Users className="w-4 h-4 text-blue-600"/>
                    </div>
                    <div
                        className="absolute -top-4 -right-4 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center animate-bounce"
                        style={{animationDelay: '1s'}}>
                        <Package className="w-4 h-4 text-blue-600"/>
                    </div>
                </div>

                {/* Loading Text */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
                        Hostel Bites
                    </h2>
                    <p className="text-gray-600 text-lg font-medium">{message}</p>
                </div>

                {/* Progress Dots */}
                <div className="flex items-center justify-center space-x-2 mb-8">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                         style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                         style={{animationDelay: '0.4s'}}></div>
                </div>

                {/* Loading Stats Skeleton */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-100">
                        <div className="animate-pulse">
                            <div className="h-3 bg-blue-200 rounded mb-2"></div>
                            <div className="h-6 bg-blue-300 rounded w-8 mx-auto"></div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-100">
                        <div className="animate-pulse">
                            <div className="h-3 bg-green-200 rounded mb-2"></div>
                            <div className="h-6 bg-green-300 rounded w-10 mx-auto"></div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-100">
                        <div className="animate-pulse">
                            <div className="h-3 bg-purple-200 rounded mb-2"></div>
                            <div className="h-6 bg-purple-300 rounded w-6 mx-auto"></div>
                        </div>
                    </div>
                </div>

                {/* Loading Messages */}
                <div className="text-sm text-gray-500 space-y-1">
                    <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin"/>
                        <span>Fetching data...</span>
                    </div>
                    <div className="text-xs text-gray-400">
                        This may take a few moments
                    </div>
                </div>
            </div>
        </div>
    );
}

export function LoadingSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
            {/* Header Skeleton */}
            <header className="bg-white/80 backdrop-blur-md border-b border-blue-100">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="animate-pulse">
                            <div className="h-8 bg-blue-200 rounded w-64 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-48"></div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
                            <div className="h-10 bg-blue-200 rounded w-20 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Skeleton */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                            <div className="animate-pulse">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                        <div className="h-8 bg-blue-200 rounded w-12"></div>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Cards Skeleton */}
                <div className="mb-8">
                    <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                                <div className="animate-pulse">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-16 h-16 bg-blue-200 rounded-full"></div>
                                        <div className="flex-1">
                                            <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                                        </div>
                                        <div className="h-6 bg-blue-200 rounded-full w-16"></div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-4 bg-gray-200 rounded"></div>
                                        <div className="h-4 bg-gray-200 rounded"></div>
                                        <div className="h-4 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="mt-6">
                                        <div className="h-10 bg-blue-200 rounded-xl"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
