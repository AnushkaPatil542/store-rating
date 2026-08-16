import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminStores from "./pages/AdminStores";

import UserDashboard from "./pages/UserDashboard";
import RateStore from "./pages/RateStore";

import OwnerDashboard from "./pages/OwnerDashboard";
import ChangePassword from "./pages/ChangePassword";


function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* Default */}
                <Route
                    path="/"
                    element={
                        <Navigate to="/login" />
                    }
                />


                {/* Normal Login */}
                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* Registration */}
                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* System Administrator Login */}
                <Route
                    path="/admin-login"
                    element={
                        <AdminLogin />
                    }
                />


                {/* ================= ADMIN ================= */}

                <Route
                    path="/admin"
                    element={
                        <AdminDashboard />
                    }
                />

                <Route
                    path="/admin/users"
                    element={
                        <AdminUsers />
                    }
                />

                <Route
                    path="/admin/stores"
                    element={
                        <AdminStores />
                    }
                />


                {/* ================= USER ================= */}

                <Route
                    path="/user"
                    element={
                        <UserDashboard />
                    }
                />

                <Route
                    path="/user/stores/:storeId"
                    element={
                        <RateStore />
                    }
                />

                <Route
                    path="/stores/:storeId/rating"
                    element={
                        <RateStore />
                    }
                />


                {/* ================= OWNER ================= */}

                <Route
                    path="/owner"
                    element={
                        <OwnerDashboard />
                    }
                />

                <Route
    path="/change-password"
    element={<ChangePassword />}
/>

            </Routes>

        </BrowserRouter>

    );
}

export default App;