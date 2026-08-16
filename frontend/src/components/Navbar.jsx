
import { LogOut, Star, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar({ title = "StoreRate" }) {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    return (
        <nav
            style={{
                background: "white",
                padding: "18px 30px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
            }}
        >

            <h2
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                }}
            >
                <Star size={22} />
                {title}
            </h2>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                }}
            >

                {user?.role === "USER" && (
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/change-password")
                        }
                    >
                        <Lock size={16} />
                        {" "}Change Password
                    </button>
                )}

                <button
                    type="button"
                    className="danger-btn"
                    onClick={logout}
                >
                    <LogOut size={16} />
                    {" "}Logout
                </button>

            </div>

        </nav>
    );
}

export default Navbar;

