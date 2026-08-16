
import { LogOut, Star, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar({ title = "StoreRate" }) {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const canChangePassword =
        user?.role === "USER" ||
        user?.role === "STORE_OWNER";

    return (
        <nav className="navbar">

            {/* ================= BRAND ================= */}

            <div className="navbar-brand">

                <div className="navbar-logo">
                    <Star
                        size={21}
                        fill="currentColor"
                    />
                </div>

                <div className="navbar-title">
                    {title}
                </div>

            </div>


            {/* ================= ACTIONS ================= */}

            <div className="navbar-actions">

                {canChangePassword && (
                    <button
                        type="button"
                        className="navbar-button password-button"
                        onClick={() =>
                            navigate("/change-password")
                        }
                    >
                        <Lock size={17} />
                        <span>
                            Change Password
                        </span>
                    </button>
                )}

                <button
                    type="button"
                    className="navbar-button logout-button"
                    onClick={logout}
                >
                    <LogOut size={17} />
                    <span>
                        Logout
                    </span>
                </button>

            </div>

        </nav>
    );
}

export default Navbar;

