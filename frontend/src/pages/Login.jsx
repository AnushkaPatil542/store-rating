import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Auth.css";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");

        if (!email || !password) {
            setError("Email and password are required");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/auth/login",
                {
                    email,
                    password
                }
            );

            const { token, user } = response.data;

            localStorage.setItem("token", token);

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            // Role-based redirection
            if (user.role === "ADMIN") {
                navigate("/admin");
            } else if (user.role === "STORE_OWNER") {
                navigate("/owner");
            } else if (user.role === "USER") {
                navigate("/user");
            } else {
                setError("Invalid user role");
            }

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Login failed. Please try again."
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
                        Discover stores, share your
                        experience, and help others make
                        better choices.
                    </p>

                </div>

                <div className="auth-form-section">

                    <h2>Welcome Back 👋</h2>

                    <p className="auth-subtitle">
                        Login to continue to StoreRate
                    </p>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <form
                        className="auth-form"
                        onSubmit={handleLogin}
                    >

                        <div>

                            <label>Email</label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                            />

                        </div>

                        <div>

                            <label>Password</label>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                            />

                        </div>

                        <button
                            className="auth-button"
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Logging in..."
                                : "Login"}
                        </button>

                    </form>

                    <div className="auth-switch">

                        Don't have an account?{" "}

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/register")
                            }
                        >
                            Create Account
                        </button>

                    </div>

                    <div className="admin-login-section">

                        <span
                            className="admin-login-link"
                            onClick={() =>
                                navigate("/admin-login")
                            }
                        >
                            System Administrator Login
                        </span>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;