import { useAuthStore } from "../store";

export default function Profile() {
    const { user, logout } = useAuthStore();

    if (!user) {
        return (
            <div className="min-h-screen pt-24 text-center">
                <h1 className="text-2xl font-bold">Please log in to view your profile.</h1>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 px-4 bg-gray-50">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-2xl font-bold text-orange-600">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                        <p className="text-gray-500">{user.email}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-500 mb-1">Account ID</h3>
                        <p className="font-mono text-gray-900">{user.id || user._id}</p>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full py-3 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
