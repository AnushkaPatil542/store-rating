import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminUsers() {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);

    const [filters, setFilters] = useState({
        name: "",
        email: "",
        address: "",
        role: ""
    });

    const [selectedUser, setSelectedUser] = useState(null);

    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [error, setError] = useState("");

    // =====================================================
    // LOAD USERS
    // =====================================================

    useEffect(() => {
        let cancelled = false;

        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/admin/users", {
                    params: {
                        name: filters.name,
                        email: filters.email,
                        address: filters.address,
                        role: filters.role
                    }
                });

                if (!cancelled) {
                    setUsers(response.data.users || []);
                }

            } catch (error) {
                console.error("Failed to load users:", error);

                if (cancelled) {
                    return;
                }

                if (
                    error.response?.status === 401 ||
                    error.response?.status === 403
                ) {
                    localStorage.clear();
                    navigate("/login");
                    return;
                }

                setError(
                    error.response?.data?.message ||
                    "Failed to load users"
                );

            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        const timer = setTimeout(() => {
            fetchUsers();
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };

    }, [
        filters.name,
        filters.email,
        filters.address,
        filters.role,
        navigate
    ]);

    // =====================================================
    // FILTER CHANGE
    // =====================================================

    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        setFilters((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // =====================================================
    // CLEAR FILTERS
    // =====================================================

    const clearFilters = () => {
        setFilters({
            name: "",
            email: "",
            address: "",
            role: ""
        });
    };

    // =====================================================
    // VIEW USER DETAILS
    // =====================================================

    const handleViewDetails = async (userId) => {
        try {
            setDetailsLoading(true);
            setError("");

            const response = await api.get(
                `/admin/users/${userId}`
            );

            setSelectedUser(response.data);

        } catch (error) {
            console.error(
                "Failed to load user details:",
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

            setError(
                error.response?.data?.message ||
                "Failed to load user details"
            );

        } finally {
            setDetailsLoading(false);
        }
    };

    return (
        <div className="admin-page">

            <main className="admin-content">

                {/* HEADER */}

                <div className="admin-header">

                    <div>
                        <h1>Manage Users</h1>

                        <p>
                            View and filter all users
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin")
                        }
                    >
                        ← Dashboard
                    </button>

                </div>

                {/* FILTERS */}

                <section className="admin-section">

                    <h2>Filters</h2>

                    <div className="admin-toolbar">

                        <input
                            type="text"
                            name="name"
                            placeholder="Filter by name"
                            value={filters.name}
                            onChange={handleFilterChange}
                        />

                        <input
                            type="text"
                            name="email"
                            placeholder="Filter by email"
                            value={filters.email}
                            onChange={handleFilterChange}
                        />

                        <input
                            type="text"
                            name="address"
                            placeholder="Filter by address"
                            value={filters.address}
                            onChange={handleFilterChange}
                        />

                        <select
                            name="role"
                            value={filters.role}
                            onChange={handleFilterChange}
                        >
                            <option value="">
                                All Roles
                            </option>

                            <option value="USER">
                                USER
                            </option>

                            <option value="STORE_OWNER">
                                STORE OWNER
                            </option>

                            <option value="ADMIN">
                                ADMIN
                            </option>
                        </select>

                        <button
                            type="button"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>

                    </div>

                </section>

                {/* ERROR */}

                {error && (
                    <div className="admin-error">
                        {error}
                    </div>
                )}

                {/* LOADING */}

                {loading && (
                    <div className="admin-empty">
                        Loading users...
                    </div>
                )}

                {/* USERS TABLE */}

                {!loading && !error && (
                    <section className="admin-section">

                        <div className="section-title">

                            <h2>
                                Users
                            </h2>

                            <span>
                                {users.length}
                            </span>

                        </div>

                        <div className="table-container">

                            <table>

                                <thead>

                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Address</th>
                                        <th>Role</th>
                                        <th>Details</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {users.length > 0 ? (

                                        users.map((user) => (

                                            <tr key={user.id}>

                                                <td>
                                                    {user.id}
                                                </td>

                                                <td>
                                                    {user.name}
                                                </td>

                                                <td>
                                                    {user.email}
                                                </td>

                                                <td>
                                                    {user.address}
                                                </td>

                                                <td>
                                                    <span className="role-badge">
                                                        {user.role}
                                                    </span>
                                                </td>

                                                <td>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleViewDetails(
                                                                user.id
                                                            )
                                                        }
                                                    >
                                                        View Details
                                                    </button>

                                                </td>

                                            </tr>

                                        ))

                                    ) : (

                                        <tr>

                                            <td colSpan="6">
                                                No users found
                                            </td>

                                        </tr>

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </section>
                )}

                {/* DETAILS LOADING */}

                {detailsLoading && (
                    <div className="admin-empty">
                        Loading user details...
                    </div>
                )}

                {/* USER DETAILS */}

                {selectedUser && !detailsLoading && (

                    <section className="admin-section">

                        <div className="section-title">

                            <h2>
                                User Details
                            </h2>

                        </div>

                        <div>

                            <p>
                                <strong>Name:</strong>{" "}
                                {selectedUser.user.name}
                            </p>

                            <p>
                                <strong>Email:</strong>{" "}
                                {selectedUser.user.email}
                            </p>

                            <p>
                                <strong>Address:</strong>{" "}
                                {selectedUser.user.address}
                            </p>

                            <p>
                                <strong>Role:</strong>{" "}
                                {selectedUser.user.role}
                            </p>

                            {selectedUser.user.role ===
                                "STORE_OWNER" && (

                                <p>
                                    <strong>
                                        Rating:
                                    </strong>{" "}
                                    ⭐{" "}
                                    {selectedUser.user.rating ?? 0}
                                </p>

                            )}

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedUser(null)
                                }
                            >
                                Close
                            </button>

                        </div>

                    </section>

                )}

            </main>

        </div>
    );
}

export default AdminUsers;

