
import { useEffect, useState } from "react";
import {
    Users,
    Store,
    Star,
    UserPlus,
    Plus,
    ArrowRight
} from "lucide-react";
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

                const response =
                    await api.get("/admin/dashboard");


                if (!cancelled) {

                    setStats({
                        totalUsers:
                            response.data.totalUsers || 0,

                        totalStores:
                            response.data.totalStores || 0,

                        totalRatings:
                            response.data.totalRatings || 0
                    });

                }

            } catch (error) {

                console.error(
                    "Admin dashboard error:",
                    error
                );


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


                {/* ================= HEADER ================= */}

                <div className="admin-header">

                    <div>

                        <div className="admin-eyebrow">
                            ADMINISTRATION
                        </div>

                        <h1>
                            Admin Dashboard
                        </h1>

                        <p>
                            Manage users, stores and
                            monitor platform activity.
                        </p>

                    </div>

                </div>


                {/* ================= ERROR ================= */}

                {error && (

                    <div className="admin-error">
                        {error}
                    </div>

                )}


                {/* ================= LOADING ================= */}

                {loading ? (

                    <div className="admin-empty">

                        <div className="admin-loading-icon">
                            <Star size={28} />
                        </div>

                        <h3>
                            Loading dashboard
                        </h3>

                        <p>
                            Please wait while we fetch
                            the latest platform statistics.
                        </p>

                    </div>

                ) : (

                    <>


                        {/* ================= STATS ================= */}

                        <section className="admin-stats">


                            <div className="stat-card">

                                <div className="stat-icon users-icon">
                                    <Users size={23} />
                                </div>

                                <div className="stat-info">

                                    <span>
                                        Total Users
                                    </span>

                                    <strong>
                                        {stats.totalUsers}
                                    </strong>

                                    <small>
                                        Registered users
                                    </small>

                                </div>

                            </div>


                            <div className="stat-card">

                                <div className="stat-icon stores-icon">
                                    <Store size={23} />
                                </div>

                                <div className="stat-info">

                                    <span>
                                        Total Stores
                                    </span>

                                    <strong>
                                        {stats.totalStores}
                                    </strong>

                                    <small>
                                        Stores on platform
                                    </small>

                                </div>

                            </div>


                            <div className="stat-card">

                                <div className="stat-icon ratings-icon">
                                    <Star size={23} />
                                </div>

                                <div className="stat-info">

                                    <span>
                                        Total Ratings
                                    </span>

                                    <strong>
                                        {stats.totalRatings}
                                    </strong>

                                    <small>
                                        Ratings submitted
                                    </small>

                                </div>

                            </div>


                        </section>


                        {/* ================= MANAGEMENT ================= */}

                        <section className="admin-management">

                            <div className="management-header">

                                <div>

                                    <div className="admin-eyebrow">
                                        MANAGEMENT
                                    </div>

                                    <h2>
                                        Platform Management
                                    </h2>

                                    <p>
                                        Quickly access the areas
                                        you want to manage.
                                    </p>

                                </div>

                            </div>


                            <div className="admin-actions">


                                {/* USERS */}

                                <button
                                    type="button"
                                    className="admin-action-card"
                                    onClick={() =>
                                        navigate(
                                            "/admin/users"
                                        )
                                    }
                                >

                                    <div className="action-icon">
                                        <UserPlus size={24} />
                                    </div>

                                    <div className="action-content">

                                        <h3>
                                            Manage Users
                                        </h3>

                                        <p>
                                            View and manage
                                            registered users.
                                        </p>

                                    </div>

                                    <ArrowRight
                                        size={20}
                                        className="action-arrow"
                                    />

                                </button>


                                {/* STORES */}

                                <button
                                    type="button"
                                    className="admin-action-card"
                                    onClick={() =>
                                        navigate(
                                            "/admin/stores"
                                        )
                                    }
                                >

                                    <div className="action-icon store-action-icon">
                                        <Plus size={24} />
                                    </div>

                                    <div className="action-content">

                                        <h3>
                                            Manage Stores
                                        </h3>

                                        <p>
                                            Add, view and manage
                                            platform stores.
                                        </p>

                                    </div>

                                    <ArrowRight
                                        size={20}
                                        className="action-arrow"
                                    />

                                </button>


                            </div>

                        </section>


                        {/* ================= SUMMARY ================= */}

                        <section className="admin-summary">

                            <div className="summary-card">

                                <div className="summary-icon">
                                    <Star size={21} />
                                </div>

                                <div>

                                    <strong>
                                        {stats.totalRatings}
                                    </strong>

                                    <span>
                                        customer ratings
                                    </span>

                                </div>

                            </div>


                            <div className="summary-card">

                                <div className="summary-icon">
                                    <Users size={21} />
                                </div>

                                <div>

                                    <strong>
                                        {stats.totalUsers}
                                    </strong>

                                    <span>
                                        registered users
                                    </span>

                                </div>

                            </div>


                            <div className="summary-card">

                                <div className="summary-icon">
                                    <Store size={21} />
                                </div>

                                <div>

                                    <strong>
                                        {stats.totalStores}
                                    </strong>

                                    <span>
                                        active stores
                                    </span>

                                </div>

                            </div>

                        </section>


                    </>

                )}

            </main>

        </div>

    );

}


export default AdminDashboard;

