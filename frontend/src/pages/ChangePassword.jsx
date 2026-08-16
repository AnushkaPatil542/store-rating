
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ChangePassword() {
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!currentPassword || !newPassword) {
            setError(
                "Current password and new password are required"
            );
            return;
        }

        try {
            setLoading(true);

            const response = await api.put(
                "/user/password",
                {
                    currentPassword,
                    newPassword
                }
            );

            setMessage(
                response.data.message ||
                "Password updated successfully"
            );

            setCurrentPassword("");
            setNewPassword("");

        } catch (error) {
            console.error(
                "Change password error:",
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
                "Failed to update password"
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-container">

                <div className="auth-form-section">

                    <h2>Change Password</h2>

                    <p className="auth-subtitle">
                        Update your account password
                    </p>

                    {message && (
                        <div className="auth-success">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >

                        <div>
                            <label>
                                Current Password
                            </label>

                            <input
                                type="password"
                                placeholder="Enter current password"
                                value={currentPassword}
                                onChange={(e) =>
                                    setCurrentPassword(
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                        <div>
                            <label>
                                New Password
                            </label>

                            <input
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) =>
                                    setNewPassword(
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
                                ? "Updating..."
                                : "Update Password"}
                        </button>

                    </form>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/user")
                        }
                    >
                        ← Back to Dashboard
                    </button>

                </div>

            </div>

        </div>
    );
}

export default ChangePassword;

