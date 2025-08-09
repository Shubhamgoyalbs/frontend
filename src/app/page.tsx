import Link from "next/link";
import HostelBitesLogo from "@/components/HostelBitesLogo";

export default function Home() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <HostelBitesLogo className="h-16 w-auto"/>
                </div>
                <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
                    Welcome
                </h1>
                <div className="space-y-4">
                    <Link
                        href="/login"
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors text-center block"
                    >
                        Login
                    </Link>
                    <Link
                        href="/register"
                        className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors text-center block"
                    >
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
}
