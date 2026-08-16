
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    Star,
    MapPin,
    ArrowUpDown
} from "lucide-react";

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
            setError("");

            const response = await api.get(
                "/stores",
                {
                    params: {
                        search,
                        sort
                    }
                }
            );

            setStores(
                response.data.stores || []
            );

        } catch (error) {

            console.error(
                "Failed to load stores:",
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

        const rounded =
            Math.round(Number(rating) || 0);

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


            <main className="user-content">


                {/* ================= HEADER ================= */}

                <section className="user-header">

                    <div>

                        <h1>
                            Discover Stores
                        </h1>

                        <p>
                            Find stores and share your
                            experience
                        </p>

                    </div>

                </section>


                {/* ================= TOOLBAR ================= */}

                <section className="store-toolbar">

                    <div className="store-search">

                        <Search
                            className="search-icon"
                            size={19}
                        />

                        <input
                            type="text"
                            placeholder="Search by store name or address..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                    </div>


                    <div className="sort-wrapper">

                        <ArrowUpDown
                            size={17}
                        />

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

                </section>


                {/* ================= ERROR ================= */}

                {error && (

                    <div className="user-error">
                        {error}
                    </div>

                )}


                {/* ================= LOADING ================= */}

                {loading ? (

                    <div className="no-stores">

                        <div className="loading-spinner"></div>

                        <h3>
                            Loading stores...
                        </h3>

                        <p>
                            Please wait while we fetch
                            the available stores.
                        </p>

                    </div>

                ) : stores.length === 0 ? (

                    <div className="no-stores">

                        <div className="empty-icon">
                            <Search size={28} />
                        </div>

                        <h3>
                            No stores found
                        </h3>

                        <p>
                            Try changing your search
                            or check again later.
                        </p>

                    </div>

                ) : (

                    /* ================= STORE GRID ================= */

                    <section className="store-grid">

                        {stores.map((store) => (

                            <article
                                className="store-card"
                                key={store.id}
                            >

                                {/* CARD HEADER */}

                                <div className="store-card-header">

                                    <div className="store-avatar">
                                        <StoreIcon />
                                    </div>

                                    <div className="store-title">

                                        <h3>
                                            {store.name}
                                        </h3>

                                        <span>
                                            Store
                                        </span>

                                    </div>

                                </div>


                                {/* STORE INFORMATION */}

                                <div className="store-info">

                                    <p className="store-email">
                                        {store.email}
                                    </p>

                                    <p className="store-address">

                                        <MapPin
                                            size={16}
                                        />

                                        <span>
                                            {store.address}
                                        </span>

                                    </p>

                                </div>


                                {/* RATING */}

                                <div className="rating-section">

                                    <div className="rating-label">
                                        Overall Rating
                                    </div>

                                    <div className="rating-row">

                                        <span className="stars">
                                            {renderStars(
                                                store.averageRating
                                            )}
                                        </span>

                                        <strong className="rating-number">
                                            {Number(
                                                store.averageRating || 0
                                            ).toFixed(1)}
                                        </strong>

                                        <span className="rating-out-of">
                                            / 5
                                        </span>

                                    </div>

                                </div>


                                {/* USER RATING */}

                                {store.myRating !== null &&
                                    store.myRating !== undefined ? (

                                    <div className="my-rating">

                                        <Star
                                            size={16}
                                            fill="currentColor"
                                        />

                                        <span>
                                            Your rating
                                        </span>

                                        <strong>
                                            {store.myRating}/5
                                        </strong>

                                    </div>

                                ) : (

                                    <div className="no-rating">

                                        You haven't rated
                                        this store yet

                                    </div>

                                )}


                                {/* ACTION */}

                                <button
                                    type="button"
                                    className="rate-btn"
                                    onClick={() =>
                                        navigate(
                                            `/stores/${store.id}/rating`
                                        )
                                    }
                                >

                                    <Star size={17} />

                                    {store.myRating
                                        ? "Update Rating"
                                        : "Rate Store"}

                                </button>

                            </article>

                        ))}

                    </section>

                )}

            </main>

        </div>
    );
}


/* Small reusable store icon */

function StoreIcon() {

    return (
        <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 9l1-5h16l1 5" />
            <path d="M5 9v11h14V9" />
            <path d="M3 9c0 2 1.5 3 3 3s3-1 3-3c0 2 1.5 3 3 3s3-1 3-3c0 2 1.5 3 3 3s3-1 3-3" />
            <path d="M9 20v-5h6v5" />
        </svg>
    );
}


export default UserDashboard;

