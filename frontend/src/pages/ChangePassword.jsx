
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Lock,
    ArrowLeft,
    ShieldCheck,
    Eye,
    EyeOff
} from "lucide-react";

import api from "../services/api";
import "../styles/ChangePassword.css";

function ChangePassword() {

    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const [currentPassword, setCurrentPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [showCurrent, setShowCurrent] =
        useState(false);

    const [showNew, setShowNew] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    const getDashboardPath = () => {

        if (user?.role === "STORE_OWNER") {
            return "/owner";
        }

        if (user?.role === "ADMIN") {
            return "/admin";
        }

        return "/user";
    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");


        if (!currentPassword || !newPassword) {

            setError(
                "Please enter both passwords."
            );

            return;
        }


        if (newPassword.length < 6) {

            setError(
                "New password must be at least 6 characters."
            );

            return;
        }


        if (currentPassword === newPassword) {

            setError(
                "New password must be different from your current password."
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
                "Password updated successfully!"
            );


            setCurrentPassword("");
            setNewPassword("");


        } catch (error) {

            console.error(
                "Change password error:",
                error
            );


            /*
             * Do NOT automatically redirect on 403 here.
             * 403 usually means the backend role authorization
             * does not allow the current user.
             */

            if (
                error.response?.status === 401
            ) {

                localStorage.clear();

                navigate("/login");

                return;
            }


            setError(
                error.response?.data?.message ||
                "Unable to update password."
            );

        } finally {

            setLoading(false);

        }
    };


    return (

        <div className="change-password-page">

            <div className="change-password-card">


                <button
                    className="change-back-button"
                    type="button"
                    onClick={() =>
                        navigate(
                            getDashboardPath()
                        )
                    }
                >

                    <ArrowLeft size={18} />

                    Back to Dashboard

                </button>


                <div className="change-password-icon">

                    <Lock size={30} />

                </div>


                <div className="change-password-heading">

                    <h1>
                        Change Password
                    </h1>

                    <p>
                        Keep your StoreRate account secure
                        with a strong password.
                    </p>

                </div>


                {message && (

                    <div className="password-success">

                        <ShieldCheck size={19} />

                        <span>
                            {message}
                        </span>

                    </div>

                )}


                {error && (

                    <div className="password-error">

                        {error}

                    </div>

                )}


                <form
                    className="change-password-form"
                    onSubmit={handleSubmit}
                >


                    <div className="password-field">

                        <label>
                            Current Password
                        </label>

                        <div className="password-input-wrapper">

                            <input
                                type={
                                    showCurrent
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Enter current password"
                                value={currentPassword}
                                onChange={(e) =>
                                    setCurrentPassword(
                                        e.target.value
                                    )
                                }
                            />

                            <button
                                type="button"
                                className="password-eye"
                                onClick={() =>
                                    setShowCurrent(
                                        !showCurrent
                                    )
                                }
                            >

                                {showCurrent
                                    ? <EyeOff size={18} />
                                    : <Eye size={18} />
                                }

                            </button>

                        </div>

                    </div>


                    <div className="password-field">

                        <label>
                            New Password
                        </label>

                        <div className="password-input-wrapper">

                            <input
                                type={
                                    showNew
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) =>
                                    setNewPassword(
                                        e.target.value
                                    )
                                }
                            />

                            <button
                                type="button"
                                className="password-eye"
                                onClick={() =>
                                    setShowNew(
                                        !showNew
                                    )
                                }
                            >

                                {showNew
                                    ? <EyeOff size={18} />
                                    : <Eye size={18} />
                                }

                            </button>

                        </div>

                        <span className="password-hint">
                            Use at least 6 characters.
                        </span>

                    </div>


                    <button
                        className="update-password-button"
                        type="submit"
                        disabled={loading}
                    >

                        <Lock size={18} />

                        {loading
                            ? "Updating..."
                            : "Update Password"}

                    </button>

                </form>


                <div className="password-security-note">

                    <ShieldCheck size={18} />

                    <span>
                        Your password is securely
                        encrypted and protected.
                    </span>

                </div>


            </div>

        </div>
    );
}

export default ChangePassword;

