
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Store,
    Star,
    Users
} from "lucide-react";

import api from "../services/api";
import Navbar from "../components/Navbar";

import "../styles/OwnerDashboard.css";


function OwnerDashboard() {

    const navigate = useNavigate();

    const [store, setStore] = useState(null);
    const [users, setUsers] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        let cancelled = false;


        const fetchDashboard = async () => {

            try {

                setLoading(true);
                setError("");


                const response =
                    await api.get(
                        "/owner/dashboard"
                    );


                if (!cancelled) {

                    setStore(
                        response.data.store ||
                        null
                    );

                    setUsers(
                        response.data.users ||
                        []
                    );

                }

            } catch (error) {

                console.error(
                    "Owner dashboard error:",
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
                        "Unable to load owner dashboard"
                    );

                }

            } finally {

                if (!cancelled) {
                    setLoading(false);
                }

            }

        };


        fetchDashboard();


        return () => {
            cancelled = true;
        };

    }, [navigate]);


    const averageRating =
        store?.averageRating || 0;


    const totalRatings =
        store?.totalRatings || 0;


    return (

        <div className="owner-page">

            <Navbar title="StoreRate Owner" />


            <main className="owner-content">


                <div className="owner-header">

                    <div>

                        <h1>
                            Owner Dashboard
                        </h1>

                        <p>
                            Monitor your store
                            and customer ratings
                        </p>

                    </div>



                </div>


                {error && (

                    <div className="owner-error">
                        {error}
                    </div>

                )}


                {loading ? (

                    <div className="owner-empty">

                        Loading dashboard...

                    </div>

                ) : !store ? (

                    <div className="owner-empty">

                        <Store size={40} />

                        <h3>
                            No store assigned
                        </h3>

                        <p>
                            No store has been
                            assigned to your
                            account yet.
                        </p>

                    </div>

                ) : (

                    <>

                        {/* ================= STATS ================= */}

                        <div className="owner-stats">


                            <div className="owner-stat-card">

                                <Store size={28} />

                                <div>

                                    <span>
                                        My Stores
                                    </span>

                                    <strong>
                                        1
                                    </strong>

                                </div>

                            </div>


                            <div className="owner-stat-card">

                                <Star size={28} />

                                <div>

                                    <span>
                                        Average Rating
                                    </span>

                                    <strong>
                                        {Number(
                                            averageRating
                                        ).toFixed(1)}
                                    </strong>

                                </div>

                            </div>


                            <div className="owner-stat-card">

                                <Users size={28} />

                                <div>

                                    <span>
                                        Total Ratings
                                    </span>

                                    <strong>
                                        {totalRatings}
                                    </strong>

                                </div>

                            </div>


                        </div>


                        {/* ================= STORE ================= */}

                        <section className="owner-section">

                            <div className="owner-section-title">

                                <h2>
                                    My Store
                                </h2>

                            </div>


                            <div className="owner-store-grid">


                                <div
                                    className="owner-store-card"
                                    key={store.id}
                                >

                                    <div className="store-card-top">

                                        <div className="store-icon">

                                            <Store
                                                size={22}
                                            />

                                        </div>


                                        <span className="rating-badge">

                                            ⭐{" "}

                                            {Number(
                                                store.averageRating ||
                                                0
                                            ).toFixed(1)}

                                        </span>

                                    </div>


                                    <h3>
                                        {store.name}
                                    </h3>


                                    <p>
                                        {store.email}
                                    </p>


                                    <p>
                                        📍{" "}
                                        {store.address}
                                    </p>


                                    <div className="store-card-footer">

                                        <span>

                                            <Star
                                                size={16}
                                            />

                                            {totalRatings}
                                            {" "}ratings

                                        </span>

                                    </div>

                                </div>


                            </div>

                        </section>


                        {/* ================= RATED USERS ================= */}

                        <section className="owner-section">

                            <div className="owner-section-title">

                                <h2>
                                    Customers Who Rated
                                </h2>

                                <span>
                                    {users.length}
                                </span>

                            </div>


                            {users.length === 0 ? (

                                <div className="owner-empty">

                                    <Users
                                        size={40}
                                    />

                                    <h3>
                                        No ratings yet
                                    </h3>

                                    <p>
                                        Customers who
                                        rate your store
                                        will appear here.
                                    </p>

                                </div>

                            ) : (

                                <div className="owner-store-grid">

                                    {users.map(
                                        (user) => (

                                            <div
                                                className="owner-store-card"
                                                key={user.id}
                                            >

                                                <div className="store-card-top">

                                                    <div className="store-icon">

                                                        <Users
                                                            size={22}
                                                        />

                                                    </div>


                                                    <span className="rating-badge">

                                                        ⭐{" "}

                                                        {user.rating}

                                                    </span>

                                                </div>


                                                <h3>
                                                    {user.name}
                                                </h3>


                                                <p>
                                                    {user.email}
                                                </p>


                                                <p>
                                                    📍{" "}
                                                    {user.address}
                                                </p>

                                            </div>
                                        )
                                    )}

                                </div>

                            )}

                        </section>

                    </>

                )}

            </main>

        </div>

    );

}


export default OwnerDashboard;

