import { useEffect, useState } from "react";
import { Users, Store, Star, UserPlus, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStores: 0,
        totalRatings: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/admin/dashboard");

                if (!cancelled) {
                    setStats({
                        totalUsers: response.data.totalUsers || 0,
                        totalStores: response.data.totalStores || 0,
                        totalRatings: response.data.totalRatings || 0
                    });
                }
            } catch (error) {
                console.error(error);

                if (
                    error.response?.status === 401 ||
                    error.response?.status === 403
                ) {
                    localStorage.clear();
                    navigate("/login");
                    return;
                }

                if (!cancelled) {
                    setError(
                        error.response?.data?.message ||
                        "Unable to load admin dashboard"
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadDashboard();

        return () => {
            cancelled = true;
        };
    }, [navigate]);

    return (
        <div className="admin-page">

            <Navbar title="StoreRate Admin" />

            <main className="admin-content">

                <div className="admin-header">
                    <div>
                        <h1>Admin Dashboard</h1>
                        <p>
                            Manage users, stores and ratings
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="admin-error">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="admin-empty">
                        Loading dashboard...
                    </div>
                ) : (
                    <>
                        <div className="admin-stats">

                            <div className="stat-card">
                                <Users size={28} />

                                <div>
                                    <span>Total Users</span>
                                    <strong>
                                        {stats.totalUsers}
                                    </strong>
                                </div>
                            </div>

                            <div className="stat-card">
                                <Store size={28} />

                                <div>
                                    <span>Total Stores</span>
                                    <strong>
                                        {stats.totalStores}
                                    </strong>
                                </div>
                            </div>

                            <div className="stat-card">
                                <Star size={28} />

                                <div>
                                    <span>Total Ratings</span>
                                    <strong>
                                        {stats.totalRatings}
                                    </strong>
                                </div>
                            </div>

                        </div>

                        <div className="admin-actions">

                            <button
                                onClick={() =>
                                    navigate("/admin/users")
                                }
                            >
                                <UserPlus size={18} />
                                Manage Users
                            </button>

                            <button
                                onClick={() =>
                                    navigate("/admin/stores")
                                }
                            >
                                <Plus size={18} />
                                Manage Stores
                            </button>

                        </div>

                    </>
                )}

            </main>

        </div>
    );
}

export default AdminDashboard;