
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/AdminStores.css";

function AdminStores() {
    const navigate = useNavigate();

    const [stores, setStores] = useState([]);
    const [owners, setOwners] = useState([]);

    const [filters, setFilters] = useState({
        name: "",
        email: "",
        address: ""
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        address: "",
        owner_id: ""
    });

    const [formMessage, setFormMessage] = useState("");
    const [formError, setFormError] = useState("");
    const [creating, setCreating] = useState(false);

    // =====================================================
    // LOAD STORES
    // =====================================================

    const loadStores = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/admin/stores", {
                params: filters
            });

            setStores(
                response.data.stores ||
                response.data ||
                []
            );

        } catch (error) {
            console.error("Failed to load stores:", error);

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
                "Failed to load stores"
            );

        } finally {
            setLoading(false);
        }
    }, [filters, navigate]);

    // =====================================================
    // LOAD STORE OWNERS
    // =====================================================

    const loadOwners = useCallback(async () => {
        try {
            const response = await api.get("/admin/users", {
                params: {
                    role: "STORE_OWNER"
                }
            });

            setOwners(response.data.users || []);

        } catch (error) {
            console.error(
                "Failed to load store owners:",
                error
            );

            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                localStorage.clear();
                navigate("/login");
            }
        }
    }, [navigate]);

    // =====================================================
    // LOAD STORES WHEN FILTERS CHANGE
    // =====================================================

    useEffect(() => {
        const timer = setTimeout(() => {
            loadStores();
        }, 300);

        return () => {
            clearTimeout(timer);
        };
    }, [loadStores]);

    // =====================================================
    // LOAD OWNERS
    // Delayed callback avoids direct state update from effect
    // =====================================================

    useEffect(() => {
        const timer = setTimeout(() => {
            loadOwners();
        }, 0);

        return () => {
            clearTimeout(timer);
        };
    }, [loadOwners]);

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
            address: ""
        });
    };

    // =====================================================
    // FORM CHANGE
    // =====================================================

    const handleFormChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // =====================================================
    // CREATE STORE
    // =====================================================

    const handleCreateStore = async (e) => {
        e.preventDefault();

        setFormMessage("");
        setFormError("");

        try {
            setCreating(true);

            const response = await api.post(
                "/admin/stores",
                form
            );

            setFormMessage(
                response.data.message ||
                "Store created successfully"
            );

            setForm({
                name: "",
                email: "",
                address: "",
                owner_id: ""
            });

            await loadStores();

            // Refresh available owners after creation
            await loadOwners();

        } catch (error) {
            console.error(
                "Create store error:",
                error
            );

            setFormError(
                error.response?.data?.message ||
                "Failed to create store"
            );

        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="admin-page">

            <main className="admin-content">

                {/* HEADER */}

                <div className="admin-header">

                    <div>
                        <h1>Manage Stores</h1>

                        <p>
                            View and create stores
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

                    <button
                        type="button"
                        onClick={clearFilters}
                    >
                        Clear Filters
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setShowForm(
                                (previous) => !previous
                            )
                        }
                    >
                        {showForm
                            ? "Close Form"
                            : "+ Add Store"}
                    </button>

                </div>

                {/* CREATE STORE FORM */}

                {showForm && (
                    <section className="admin-section">

                        <h2>Add New Store</h2>

                        {formMessage && (
                            <div className="admin-success">
                                {formMessage}
                            </div>
                        )}

                        {formError && (
                            <div className="admin-error">
                                {formError}
                            </div>
                        )}

                        <form
                            className="admin-form"
                            onSubmit={handleCreateStore}
                        >

                            <input
                                name="name"
                                placeholder="Store Name"
                                value={form.name}
                                onChange={handleFormChange}
                                required
                            />

                            <input
                                name="email"
                                type="email"
                                placeholder="Store Email"
                                value={form.email}
                                onChange={handleFormChange}
                                required
                            />

                            <input
                                name="address"
                                placeholder="Store Address"
                                value={form.address}
                                onChange={handleFormChange}
                                required
                            />

                            <select
                                name="owner_id"
                                value={form.owner_id}
                                onChange={handleFormChange}
                                required
                            >
                                <option value="">
                                    Select Store Owner
                                </option>

                                {owners.map((owner) => (
                                    <option
                                        key={owner.id}
                                        value={owner.id}
                                    >
                                        {owner.name} - {owner.email}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="submit"
                                disabled={creating}
                            >
                                {creating
                                    ? "Creating..."
                                    : "Create Store"}
                            </button>

                        </form>

                    </section>
                )}

                {/* LOADING */}

                {loading && (
                    <div className="admin-empty">
                        Loading stores...
                    </div>
                )}

                {/* ERROR */}

                {error && (
                    <div className="admin-error">
                        {error}
                    </div>
                )}

                {/* STORES TABLE */}

                {!loading && !error && (
                    <section className="admin-section">

                        <div className="section-title">

                            <h2>Stores</h2>

                            <span>
                                {stores.length}
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
                                        <th>Owner ID</th>
                                        <th>Rating</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {stores.length > 0 ? (

                                        stores.map((store) => (

                                            <tr
                                                key={store.id}
                                            >

                                                <td>
                                                    {store.id}
                                                </td>

                                                <td>
                                                    {store.name}
                                                </td>

                                                <td>
                                                    {store.email}
                                                </td>

                                                <td>
                                                    {store.address}
                                                </td>

                                                <td>
                                                    {store.owner_id}
                                                </td>

                                                <td>
                                                    ⭐{" "}
                                                    {Number(
                                                        store.averageRating ??
                                                        store.rating ??
                                                        0
                                                    ).toFixed(1)}
                                                </td>

                                            </tr>

                                        ))

                                    ) : (

                                        <tr>

                                            <td colSpan="6">
                                                No stores found
                                            </td>

                                        </tr>

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </section>
                )}

            </main>

        </div>
    );
}

export default AdminStores;

