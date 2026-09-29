import { useState } from "react";

import {
    Search,
    Bell,
    UserCircle,
    ChevronDown,
    LogOut
} from "lucide-react";


function Topbar({
    searchQuery,
    setSearchQuery,
    user,
    onLogout
}) {

    const [showProfileMenu, setShowProfileMenu] =
        useState(false);

    const [showNotifications, setShowNotifications] =
        useState(false);


    return (

        <header className="topbar">

            {/* SEARCH */}

            <div className="search-box">

                <Search size={15} />

                <input
                    type="text"
                    placeholder="Search events, endpoints, IPs..."
                    value={searchQuery}
                    onChange={(e) =>
                        setSearchQuery(
                            e.target.value
                        )
                    }
                />

                <span className="search-shortcut">
                    /
                </span>

            </div>


            <div className="topbar-actions">

                {/* LIVE */}

                <div className="live-status">

                    <span></span>

                    LIVE

                </div>


                {/* NOTIFICATIONS */}

                <div className="notification-wrapper">

                    <button
                        className="icon-button"
                        onClick={() =>
                            setShowNotifications(
                                !showNotifications
                            )
                        }
                    >

                        <Bell size={16} />

                    </button>


                    {showNotifications && (

                        <div className="notification-menu">

                            <h4>
                                Notifications
                            </h4>

                            <p>
                                No new notifications
                            </p>

                        </div>

                    )}

                </div>


                {/* PROFILE */}

                <div className="profile-wrapper">

                    <button
                        className="profile"
                        onClick={() =>
                            setShowProfileMenu(
                                !showProfileMenu
                            )
                        }
                    >

                        <UserCircle size={20} />


                        <div className="profile-info">

                            <strong>
                                {user?.name ||
                                    "Security Admin"}
                            </strong>


                            <span>
                                {user?.role ||
                                    "Administrator"}
                            </span>

                        </div>


                        <ChevronDown size={14} />

                    </button>


                    {showProfileMenu && (

                        <div className="profile-menu">

                            <div className="profile-menu-header">

                                <strong>
                                    {user?.name}
                                </strong>


                                <span>
                                    {user?.email}
                                </span>


                                <small>
                                    {user?.role}
                                </small>

                            </div>


                            <button
                                onClick={onLogout}
                                className="logout-button"
                            >

                                <LogOut size={15} />

                                Logout

                            </button>

                        </div>

                    )}

                </div>

            </div>

        </header>

    );

}


export default Topbar;