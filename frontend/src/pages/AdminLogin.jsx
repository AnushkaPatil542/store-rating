import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Auth.css";

function AdminLogin() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const handleAdminLogin = async (e) => {

        e.preventDefault();

        setError("");

        if (!email || !password) {
            setError(
                "Email and password are required"
            );
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


            const { token, user } =
                response.data;


            // Make sure this is actually ADMIN
            if (user.role !== "ADMIN") {

                setError(
                    "This account is not a System Administrator"
                );

                return;
            }


            localStorage.setItem(
                "token",
                token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );


            navigate("/admin");

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Administrator login failed"
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
                        System Administrator
                        Access
                    </p>

                </div>


                <div className="auth-form-section">

                    <h2>
                        System Administrator
                    </h2>

                    <p className="auth-subtitle">
                        Login to manage the
                        StoreRate system
                    </p>


                    {error && (

                        <div className="auth-error">
                            {error}
                        </div>

                    )}


                    <form
                        className="auth-form"
                        onSubmit={handleAdminLogin}
                    >

                        <div>

                            <label>
                                Administrator Email
                            </label>

                            <input
                                type="email"
                                placeholder="Enter administrator email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }
                            />

                        </div>


                        <div>

                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                placeholder="Enter administrator password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
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
                                : "Administrator Login"}
                        </button>

                    </form>


                    <div className="auth-switch">

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/login")
                            }
                        >
                            Back to Login
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );
}

export default AdminLogin;