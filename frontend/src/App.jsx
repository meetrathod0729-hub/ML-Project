import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import { useEffect, useState } from "react";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import APIEvents from "./pages/APIEvents";
import Analytics from "./pages/Analytics";
import Anomalies from "./pages/Anomalies";
import Settings from "./pages/Settings";
import Documentation from "./pages/Documentation";


/* =========================================================
   APPLICATION LAYOUT
========================================================= */

function AppLayout({ children }) {

    /* ---------------------------------------------------------
       THEME STATE
    --------------------------------------------------------- */

    const [darkMode, setDarkMode] = useState(() => {

        const savedTheme =
            localStorage.getItem("api-sentinel-theme");

        if (savedTheme === "light") {
            return false;
        }

        return true;
    });


    /* ---------------------------------------------------------
       SAVE THEME PREFERENCE
    --------------------------------------------------------- */

    useEffect(() => {

        localStorage.setItem(
            "api-sentinel-theme",
            darkMode ? "dark" : "light"
        );

    }, [darkMode]);


    const [searchQuery, setSearchQuery] = useState("");

    const [user, setUser] = useState(null);


    /* ---------------------------------------------------------
       LOAD LOGGED-IN USER
    --------------------------------------------------------- */

    useEffect(() => {

        try {

            const storedUser =
                localStorage.getItem("user");

            if (storedUser) {

                setUser(
                    JSON.parse(storedUser)
                );

            }

        } catch (error) {

            console.error(
                "Failed to load user:",
                error
            );

        }

    }, []);


    /* ---------------------------------------------------------
       LOGOUT
    --------------------------------------------------------- */

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);

        window.location.href = "/login";
    };


    return (

        <div
            className={`app ${
                darkMode
                    ? ""
                    : "light-theme"
            }`}
        >

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <Sidebar
                darkMode={darkMode}
                setDarkMode={setDarkMode}
            />


            {/* =================================================
                MAIN AREA
            ================================================= */}

            <div className="main">

                {/* TOPBAR */}

                <Topbar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    user={user}
                    onLogout={handleLogout}
                />


                {/* PAGE CONTENT */}

                {children}

            </div>

        </div>

    );
}


/* =========================================================
   APP
========================================================= */

function App() {

    return (

        <BrowserRouter>

            <AuthProvider>

                <Routes>

                    {/* =================================================
                        LOGIN
                    ================================================= */}

                    <Route
                        path="/login"
                        element={
                            <Login />
                        }
                    />


                    {/* =================================================
                        PROTECTED APPLICATION
                    ================================================= */}

                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>

                                <AppLayout>

                                    <Dashboard />

                                </AppLayout>

                            </ProtectedRoute>
                        }
                    />


                    {/* =================================================
                        API EVENTS
                    ================================================= */}

                    <Route
                        path="/events"
                        element={
                            <ProtectedRoute>

                                <AppLayout>

                                    <APIEvents />

                                </AppLayout>

                            </ProtectedRoute>
                        }
                    />


                    {/* =================================================
                        ANALYTICS
                    ================================================= */}

                    <Route
                        path="/analytics"
                        element={
                            <ProtectedRoute>

                                <AppLayout>

                                    <Analytics />

                                </AppLayout>

                            </ProtectedRoute>
                        }
                    />


                    {/* =================================================
                        ANOMALIES
                    ================================================= */}

                    <Route
                        path="/anomalies"
                        element={
                            <ProtectedRoute>

                                <AppLayout>

                                    <Anomalies />

                                </AppLayout>

                            </ProtectedRoute>
                        }
                    />


                    {/* =================================================
                        SETTINGS
                    ================================================= */}

                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>

                                <AppLayout>

                                    <Settings />

                                </AppLayout>

                            </ProtectedRoute>
                        }
                    />


                    {/* =================================================
                        DOCUMENTATION
                    ================================================= */}

                    <Route
                        path="/documentation"
                        element={
                            <ProtectedRoute>

                                <AppLayout>

                                    <Documentation />

                                </AppLayout>

                            </ProtectedRoute>
                        }
                    />


                    {/* =================================================
                        UNKNOWN ROUTE
                    ================================================= */}

                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/"
                                replace
                            />
                        }
                    />

                </Routes>

            </AuthProvider>

        </BrowserRouter>

    );
}


export default App;