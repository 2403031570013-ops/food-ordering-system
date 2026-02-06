import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Store, ShieldCheck } from "lucide-react";
import api from "../api";
import { useAuthStore } from "../store";

export default function SelectRole() {
    const navigate = useNavigate();
    const { setUser } = useAuthStore();

    const handleRoleSelect = async (role) => {
        try {
            if (role === "restaurant") {
                // Redirect to restaurant registration, they will become owner
                navigate("/partner-with-us");
                return;
            }

            if (role === "admin") {
                // Assuming admin is pre-created or specific flow.
                // If we want to allow selecting 'admin' role directly (insecure for real app, but per prompt)
                // But prompt says "Admin Login (restricted)". 
                // Let's redirect to login for admin validation if they seek admin access, 
                // OR if they selected it, maybe just redirect to admin dashboard if they are already admin? 
                // But here we are setting the role for a NEW user. 
                // A new user cannot just BECOME admin. 
                // So for "Admin", we probably shouldn't allow setting it via API for security.
                // Let's just alert or redirect.
                alert("Admin access requires special credentials. Please contact support.");
                return;
            }

            // For User role, we update the backend
            const res = await api.put("/auth/set-role", { role });
            setUser(res.data.user);
            navigate("/"); // Go to home as Customer

        } catch (error) {
            console.error("Failed to set role", error);
            alert("Failed to update role. Please try again.");
        }
    };

    const roles = [
        {
            id: "user",
            title: "Hungry Customer",
            description: "I want to browse delicious food and order.",
            icon: User,
            color: "blue",
        },
        {
            id: "restaurant",
            title: "Restaurant Owner",
            description: "I want to list my restaurant and sell food.",
            icon: Store,
            color: "orange",
        },
        {
            id: "admin",
            title: "FoodHub Admin",
            description: "I am part of the FoodHub team.",
            icon: ShieldCheck,
            color: "purple",
        },
    ];

    return (
        <div className="min-h-screen pt-20 flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-5xl w-full">
                <div className="text-center mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold text-slate-900 mb-4"
                    >
                        Who are you?
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-600"
                    >
                        Select your profile type to get started
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {roles.map((role, index) => (
                        <motion.div
                            key={role.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            whileHover={{ scale: 1.03, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleRoleSelect(role.id)}
                            className="glass-card p-8 cursor-pointer hover:shadow-2xl transition-all relative overflow-hidden group"
                        >
                            <div className={`absolute top-0 left-0 w-2 h-full bg-${role.color}-500`}></div>

                            <div className={`w-16 h-16 rounded-2xl bg-${role.color}-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <role.icon className={`w-8 h-8 text-${role.color}-600`} />
                            </div>

                            <h3 className="text-2xl font-bold text-slate-900 mb-2">{role.title}</h3>
                            <p className="text-slate-600">{role.description}</p>

                            <div className="mt-8 flex items-center text-sm font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">
                                Select Profile →
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
