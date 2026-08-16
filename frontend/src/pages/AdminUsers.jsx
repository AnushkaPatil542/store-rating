
import { useEffect, useState } from "react";
import {
    ArrowLeft,
    Search,
    Users,
    Eye,
    X,
    MapPin,
    Mail,
    Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import Navbar from "../components/Navbar";

import "../styles/AdminUsers.css";

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

    useEffect(() => {

        let cancelled = false;

        const fetchUsers = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await api.get(
                    "/admin/users",
                    {
                        params: {
                            name: filters.name,
                            email: filters.email,
                            address: filters.address,
                            role: filters.role
                        }
                    }
                );

                if (!cancelled) {
                    setUsers(
                        response.data.users || []
                    );
                }

            } catch (error) {

                console.error(
                    "Failed to load users:",
                    error
                );

                if (cancelled) return;

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

        const timer = setTimeout(
            fetchUsers,
            300
        );

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


    const handleFilterChange = (e) => {

        const { name, value } = e.target;

        setFilters((previous) => ({
            ...previous,
            [name]: value
        }));
    };


    const clearFilters = () => {

        setFilters({
            name: "",
            email: "",
            address: "",
            role: ""
        });
    };


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


    const getRoleClass = (role) => {

        if (role === "ADMIN")
            return "role-admin";

        if (role === "STORE_OWNER")
            return "role-owner";

        return "role-user";
    };


    return (

        <div className="admin-users-page">

            <Navbar title="StoreRate Admin" />

            <main className="admin-users-content">

                {/* HEADER */}

                <div className="admin-users-header">

                    <div>

                        <button
                            className="admin-back-button"
                            onClick={() =>
                                navigate("/admin")
                            }
                        >
                            <ArrowLeft size={17} />
                            Dashboard
                        </button>

                        <div className="admin-users-title">

                            <div className="admin-users-icon">
                                <Users size={25} />
                            </div>

                            <div>

                                <h1>
                                    Manage Users
                                </h1>

                                <p>
                                    View, search and manage
                                    registered users
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                {/* FILTERS */}

                <section className="users-filter-card">

                    <div className="filter-heading">

                        <Search size={19} />

                        <div>
                            <h2>Search & Filter</h2>
                            <p>
                                Find users using the
                                available filters
                            </p>
                        </div>

                    </div>


                    <div className="users-filter-grid">

                        <div className="filter-field">

                            <label>Name</label>

                            <input
                                name="name"
                                placeholder="Search by name"
                                value={filters.name}
                                onChange={
                                    handleFilterChange
                                }
                            />

                        </div>


                        <div className="filter-field">

                            <label>Email</label>

                            <input
                                name="email"
                                placeholder="Search by email"
                                value={filters.email}
                                onChange={
                                    handleFilterChange
                                }
                            />

                        </div>


                        <div className="filter-field">

                            <label>Address</label>

                            <input
                                name="address"
                                placeholder="Search by address"
                                value={filters.address}
                                onChange={
                                    handleFilterChange
                                }
                            />

                        </div>


                        <div className="filter-field">

                            <label>Role</label>

                            <select
                                name="role"
                                value={filters.role}
                                onChange={
                                    handleFilterChange
                                }
                            >

                                <option value="">
                                    All Roles
                                </option>

                                <option value="USER">
                                    User
                                </option>

                                <option value="STORE_OWNER">
                                    Store Owner
                                </option>

                                <option value="ADMIN">
                                    Admin
                                </option>

                            </select>

                        </div>

                    </div>


                    <button
                        className="clear-filter-button"
                        onClick={clearFilters}
                    >
                        <X size={16} />
                        Clear Filters
                    </button>

                </section>


                {/* ERROR */}

                {error && (
                    <div className="admin-users-error">
                        {error}
                    </div>
                )}


                {/* USERS */}

                <section className="users-table-card">

                    <div className="users-table-header">

                        <div>

                            <h2>
                                All Users
                            </h2>

                            <p>
                                {users.length} users found
                            </p>

                        </div>

                        <span className="users-count">
                            {users.length}
                        </span>

                    </div>


                    {loading ? (

                        <div className="users-loading">
                            <div className="loading-spinner"></div>
                            <p>Loading users...</p>
                        </div>

                    ) : users.length === 0 ? (

                        <div className="users-empty">

                            <Users size={42} />

                            <h3>
                                No users found
                            </h3>

                            <p>
                                Try changing your
                                search filters.
                            </p>

                        </div>

                    ) : (

                        <div className="users-table-wrapper">

                            <table className="users-table">

                                <thead>

                                    <tr>

                                        <th>ID</th>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Address</th>
                                        <th>Role</th>
                                        <th>Action</th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {users.map((user) => (

                                        <tr key={user.id}>

                                            <td>
                                                #{user.id}
                                            </td>

                                            <td>

                                                <div className="user-name-cell">

                                                    <div className="user-avatar">
                                                        {user.name
                                                            ?.charAt(0)
                                                            ?.toUpperCase()}
                                                    </div>

                                                    <strong>
                                                        {user.name}
                                                    </strong>

                                                </div>

                                            </td>

                                            <td>
                                                {user.email}
                                            </td>

                                            <td>

                                                <span className="address-cell">

                                                    <MapPin size={14} />

                                                    {user.address ||
                                                        "Not provided"}

                                                </span>

                                            </td>

                                            <td>

                                                <span
                                                    className={`role-badge ${getRoleClass(
                                                        user.role
                                                    )}`}
                                                >
                                                    {user.role ===
                                                    "STORE_OWNER"
                                                        ? "Store Owner"
                                                        : user.role}
                                                </span>

                                            </td>

                                            <td>

                                                <button
                                                    className="view-user-button"
                                                    onClick={() =>
                                                        handleViewDetails(
                                                            user.id
                                                        )
                                                    }
                                                >

                                                    <Eye size={16} />

                                                    View

                                                </button>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>


                {/* USER DETAILS MODAL */}

                {selectedUser && (

                    <div
                        className="user-modal-overlay"
                        onClick={() =>
                            setSelectedUser(null)
                        }
                    >

                        <div
                            className="user-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="user-modal-header">

                                <div>

                                    <h2>
                                        User Details
                                    </h2>

                                    <p>
                                        Account information
                                    </p>

                                </div>

                                <button
                                    onClick={() =>
                                        setSelectedUser(null)
                                    }
                                >
                                    <X size={20} />
                                </button>

                            </div>


                            {detailsLoading ? (

                                <div className="modal-loading">
                                    Loading details...
                                </div>

                            ) : (

                                <div className="user-details">

                                    <div className="detail-avatar">

                                        {selectedUser.user.name
                                            ?.charAt(0)
                                            ?.toUpperCase()}

                                    </div>


                                    <h3>
                                        {selectedUser.user.name}
                                    </h3>


                                    <div className="detail-list">

                                        <div className="detail-item">

                                            <Mail size={18} />

                                            <div>
                                                <span>Email</span>
                                                <strong>
                                                    {selectedUser.user.email}
                                                </strong>
                                            </div>

                                        </div>


                                        <div className="detail-item">

                                            <MapPin size={18} />

                                            <div>
                                                <span>Address</span>
                                                <strong>
                                                    {selectedUser.user.address ||
                                                        "Not provided"}
                                                </strong>
                                            </div>

                                        </div>


                                        <div className="detail-item">

                                            <Shield size={18} />

                                            <div>
                                                <span>Role</span>
                                                <strong>
                                                    {selectedUser.user.role}
                                                </strong>
                                            </div>

                                        </div>

                                    </div>


                                    {selectedUser.user.role ===
                                        "STORE_OWNER" && (

                                        <div className="owner-rating-box">

                                            <span>
                                                Store Rating
                                            </span>

                                            <strong>
                                                ⭐{" "}
                                                {selectedUser.user.rating ??
                                                    0}
                                            </strong>

                                        </div>

                                    )}


                                </div>

                            )}

                        </div>

                    </div>

                )}

            </main>

        </div>
    );
}

export default AdminUsers;

