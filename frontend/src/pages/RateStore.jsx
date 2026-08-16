import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Star, ArrowLeft } from "lucide-react";
import api from "../services/api";
import "../styles/RateStore.css";

function RateStore() {
    const { storeId } = useParams();
    const navigate = useNavigate();

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const submitRating = async () => {
        if (rating < 1 || rating > 5) {
            setError("Please select a rating from 1 to 5");
            return;
        }

        setError("");
        setMessage("");
        setLoading(true);

        try {
            await api.post(`/stores/${storeId}/rating`, {
                rating
            });

            setMessage("Rating submitted successfully!");

            setTimeout(() => {
                navigate("/user");
            }, 1000);

        } catch (error) {
            if (error.response?.status === 409) {
                setError(
                    "You have already rated this store. Updating your rating..."
                );

                try {
                    await api.put(`/stores/${storeId}/rating`, {
                        rating
                    });

                    setMessage("Rating updated successfully!");

                    setTimeout(() => {
                        navigate("/user");
                    }, 1000);

                } catch (updateError) {
                    setError(
                        updateError.response?.data?.message ||
                        "Unable to update rating"
                    );
                }
            } else {
                setError(
                    error.response?.data?.message ||
                    "Unable to submit rating"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rating-page">

            <div className="rating-card">

                <button
                    className="back-button"
                    onClick={() => navigate("/user")}
                >
                    <ArrowLeft size={18} />
                    Back to Stores
                </button>

                <div className="rating-icon">
                    <Star size={35} />
                </div>

                <h1>Rate this Store</h1>

                <p>
                    How was your experience?
                </p>

                <div className="rating-stars">

                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            className="star-button"
                            onMouseEnter={() =>
                                setHoverRating(star)
                            }
                            onMouseLeave={() =>
                                setHoverRating(0)
                            }
                            onClick={() =>
                                setRating(star)
                            }
                        >
                            <Star
                                size={45}
                                fill={
                                    star <=
                                    (hoverRating || rating)
                                        ? "currentColor"
                                        : "none"
                                }
                            />
                        </button>
                    ))}

                </div>

                <div className="rating-text">
                    {rating === 0
                        ? "Select a rating"
                        : `${rating} out of 5`}
                </div>

                {error && (
                    <div className="rating-error">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="rating-success">
                        {message}
                    </div>
                )}

                <button
                    className="submit-rating-button"
                    onClick={submitRating}
                    disabled={loading}
                >
                    {loading
                        ? "Submitting..."
                        : "Submit Rating"}
                </button>

            </div>

        </div>
    );
}

export default RateStore;