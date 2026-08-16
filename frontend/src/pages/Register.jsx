import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Auth.css";

function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        address: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (
            !form.name ||
            !form.email ||
            !form.password ||
            !form.address
        ) {
            setError("All fields are required");
            return;
        }

        try {
            setLoading(true);

            await api.post("/auth/register", form);

            setSuccess(
                "Registration successful! You can now login."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1200);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Registration failed."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">

                <div className="auth-brand">
                    <h1>StoreRate</h1>

                    <p>
                        Join our community and share your
                        experiences with stores around you.
                    </p>
                </div>

                <div className="auth-form-section">
                    <h2>Create Account</h2>

                    <p className="auth-subtitle">
                        Start rating stores today
                    </p>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div
                            style={{
                                padding: "10px",
                                borderRadius: "8px",
                                background: "#dcfce7",
                                color: "#166534",
                                marginBottom: "12px"
                            }}
                        >
                            {success}
                        </div>
                    )}

                    <form
                        className="auth-form"
                        onSubmit={handleRegister}
                    >
                        <div>
                            <label>Full Name</label>

                            <input
                                name="name"
                                type="text"
                                placeholder="Enter your full name"
                                value={form.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label>Email</label>

                            <input
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                value={form.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label>Password</label>

                            <input
                                name="password"
                                type="password"
                                placeholder="Create a password"
                                value={form.password}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label>Address</label>

                            <input
                                name="address"
                                type="text"
                                placeholder="Enter your address"
                                value={form.address}
                                onChange={handleChange}
                            />
                        </div>

                        <button
                            className="auth-button"
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating account..."
                                : "Create Account"}
                        </button>
                    </form>

                    <div className="auth-switch">
                        Already have an account?{" "}

                        <button
                            onClick={() =>
                                navigate("/login")
                            }
                        >
                            Login
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Register;