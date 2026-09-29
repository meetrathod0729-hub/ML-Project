import {
    LayoutDashboard,
    Activity,
    BarChart3,
    ShieldAlert,
    Settings,
    HelpCircle,
    Moon
} from "lucide-react";

import {
    useLocation,
    useNavigate
} from "react-router-dom";


function Sidebar({
    darkMode,
    setDarkMode
}) {

    const navigate = useNavigate();
    const location = useLocation();


    /* =========================================================
       NAVIGATION
    ========================================================= */

    const navigation = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            path: "/"
        },
        {
            label: "API Events",
            icon: Activity,
            path: "/events"
        },
        {
            label: "Analytics",
            icon: BarChart3,
            path: "/analytics"
        },
        {
            label: "Anomalies",
            icon: ShieldAlert,
            path: "/anomalies"
        }
    ];


    const bottomNavigation = [
        {
            label: "Settings",
            icon: Settings,
            path: "/settings"
        },
        {
            label: "Documentation",
            icon: HelpCircle,
            path: "/documentation"
        }
    ];


    /* =========================================================
       ACTIVE NAVIGATION
    ========================================================= */

    const isActive = (path) => {

        if (path === "/") {
            return location.pathname === "/";
        }

        return location.pathname.startsWith(path);
    };


    /* =========================================================
       CHANGE THEME
    ========================================================= */

    const handleThemeToggle = () => {

        setDarkMode(previousMode => {

            const newMode = !previousMode;

            localStorage.setItem(
                "api-sentinel-theme",
                newMode
                    ? "dark"
                    : "light"
            );

            return newMode;

        });

    };


    /* =========================================================
       SIDEBAR
    ========================================================= */

    return (

        <aside className="sidebar">

            {/* =================================================
                LOGO
            ================================================= */}

            <div className="sidebar-logo">

                <div className="brand-icon">

                    <ShieldAlert size={23} />

                </div>


                <div className="brand-text">

                    <h1>
                        API SENTINEL
                    </h1>

                    <span>
                        SECURITY PLATFORM
                    </span>

                </div>

            </div>


            {/* =================================================
                MONITORING
            ================================================= */}

            <div className="sidebar-section">

                <span className="sidebar-section-title">
                    MONITORING
                </span>


                <nav className="sidebar-nav">

                    {navigation.map((item) => {

                        const Icon = item.icon;

                        return (

                            <button
                                key={item.path}
                                type="button"
                                className={`nav-item ${
                                    isActive(item.path)
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    navigate(item.path)
                                }
                            >

                                <Icon size={19} />

                                <span>
                                    {item.label}
                                </span>

                            </button>

                        );

                    })}

                </nav>

            </div>


            {/* =================================================
                BOTTOM
            ================================================= */}

            <div className="sidebar-bottom">

                <nav className="sidebar-nav">

                    {bottomNavigation.map((item) => {

                        const Icon = item.icon;

                        return (

                            <button
                                key={item.path}
                                type="button"
                                className={`nav-item ${
                                    isActive(item.path)
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    navigate(item.path)
                                }
                            >

                                <Icon size={19} />

                                <span>
                                    {item.label}
                                </span>

                            </button>

                        );

                    })}

                </nav>


                {/* =================================================
                    THEME TOGGLE
                ================================================= */}

                <button
                    type="button"
                    className="theme-toggle"
                    onClick={handleThemeToggle}
                    aria-label={
                        darkMode
                            ? "Switch to light mode"
                            : "Switch to dark mode"
                    }
                >

                    <div className="theme-option">

                        <Moon size={17} />

                        <span>
                            {darkMode
                                ? "Dark"
                                : "Light"}
                        </span>

                    </div>


                    {/* =================================================
                        THEME SWITCH

                        IMPORTANT:
                        Position is controlled directly by React.
                        Dark  = RIGHT
                        Light = LEFT
                    ================================================= */}

                    <div
                        className={`theme-switch ${
                            darkMode
                                ? "theme-switch-dark"
                                : "theme-switch-light"
                        }`}
                    >

                        <span
                            className="theme-switch-knob"
                            style={{
                                left: darkMode
                                    ? "21px"
                                    : "3px"
                            }}
                        />

                    </div>

                </button>


                {/* =================================================
                    SYSTEM STATUS
                ================================================= */}

                <div className="sidebar-status">

                    <span className="status-indicator" />


                    <div>

                        <strong>
                            System Operational
                        </strong>

                        <span>
                            All services connected
                        </span>

                    </div>

                </div>

            </div>

        </aside>

    );
}


export default Sidebar;