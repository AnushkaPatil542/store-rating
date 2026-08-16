import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star } from "lucide-react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "../styles/UserDashboard.css";

function UserDashboard() {
    const navigate = useNavigate();

    const [stores, setStores] = useState([]);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("name");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadStores = async () => {
        try {
            setLoading(true);

            const response = await api.get("/stores", {
                params: {
                    search,
                    sort
                }
            });

            setStores(response.data.stores || []);

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

            setError(
                error.response?.data?.message ||
                "Unable to load stores"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadStores();
        }, 300);

        return () => clearTimeout(timer);
    }, [search, sort]);

    const renderStars = (rating) => {
        const rounded = Math.round(Number(rating) || 0);

        return (
            <span className="stars">
                {"★".repeat(rounded)}
                {"☆".repeat(5 - rounded)}
            </span>
        );
    };

    return (
        <div className="user-page">
            <Navbar title="StoreRate" />

            <div className="user-content">

                <div className="user-header">
                    <h1>Discover Stores</h1>
                    <p>
                        Find stores and share your experience
                    </p>
                </div>

                <div className="store-toolbar">

                    <div className="store-search">
                        <div style={{ position: "relative" }}>
                            <Search
                                size={18}
                                style={{
                                    position: "absolute",
                                    left: "12px",
                                    top: "12px",
                                    color: "#9ca3af"
                                }}
                            />

                            <input
                                style={{
                                    width: "100%",
                                    paddingLeft: "40px"
                                }}
                                placeholder="Search by store, email or address..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <select
                        value={sort}
                        onChange={(e) =>
                            setSort(e.target.value)
                        }
                    >
                        <option value="name">
                            Sort by Name
                        </option>

                        <option value="rating">
                            Sort by Rating
                        </option>
                    </select>

                </div>

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="no-stores">
                        Loading stores...
                    </div>
                ) : stores.length === 0 ? (
                    <div className="no-stores">
                        <h3>No stores found</h3>
                        <p>
                            Try changing your search.
                        </p>
                    </div>
                ) : (
                    <div className="store-grid">

                        {stores.map((store) => (
                            <div
                                className="store-card"
                                key={store.id}
                            >
                                <h3>{store.name}</h3>

                                <p className="store-email">
                                    {store.email}
                                </p>

                                <p className="store-address">
                                    📍 {store.address}
                                </p>

                                <div className="rating-row">
                                    <span>
                                        {renderStars(
                                            store.averageRating
                                        )}
                                    </span>

                                    <span className="rating-number">
                                        {store.averageRating}
                                    </span>

                                    <Star
                                        size={16}
                                        fill="currentColor"
                                    />
                                </div>

                                {store.myRating !== null &&
                                    store.myRating !== undefined && (
                                        <div className="my-rating">
                                            Your rating: ⭐{" "}
                                            {store.myRating}/5
                                        </div>
                                    )}

                                <button
                                    className="rate-btn"
                                    onClick={() =>
                                        navigate(
                                            `/stores/${store.id}/rating`
                                        )
                                    }
                                >
                                    {store.myRating
                                        ? "Update Rating"
                                        : "Rate Store"}
                                </button>
                            </div>
                        ))}

                    </div>
                )}

            </div>
        </div>
    );
}

export default UserDashboard;