import { useState } from "react";
import {
    User,
    Mail,
    Shield,
    UserPlus,
    CheckCircle,
    AlertCircle
} from "lucide-react";

import { useAuth } from "../context/AuthContext";


function Settings() {

    const { user, register } = useAuth();

    const [showRegister, setShowRegister] =
        useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] =
        useState(false);

    const [success, setSuccess] =
        useState("");

    const [error, setError] =
        useState("");


    const handleRegister = async (e) => {

        e.preventDefault();

        setLoading(true);
        setSuccess("");
        setError("");

        try {

            await register(
                name,
                email,
                password
            );

            setSuccess(
                "User registered successfully."
            );

            setName("");
            setEmail("");
            setPassword("");

        } catch (err) {

            setError(
                err.message ||
                "Failed to register user."
            );

        } finally {

            setLoading(false);

        }
    };


    return (

        <main className="dashboard">

            {/* PAGE HEADER */}

            <div className="page-heading">

                <div>

                    <span className="page-eyebrow">
                        SYSTEM CONFIGURATION
                    </span>

                    <h2>
                        Settings
                    </h2>

                    <p>
                        Manage your API Sentinel account
                        and security platform configuration.
                    </p>

                </div>

            </div>


            {/* ACCOUNT */}

            <section className="dashboard-panel settings-panel">

                <div className="panel-heading">

                    <div>

                        <h3>
                            Account
                        </h3>

                        <p>
                            Information about the currently
                            authenticated user.
                        </p>

                    </div>

                </div>


                <div className="settings-content">

                    <div className="settings-user-icon">

                        <User size={28} />

                    </div>


                    <div className="settings-user-info">

                        <div className="settings-row">

                            <span>
                                Name
                            </span>

                            <strong>
                                {user?.name ||
                                    "Security Admin"}
                            </strong>

                        </div>


                        <div className="settings-row">

                            <span>
                                Email
                            </span>

                            <strong>
                                {user?.email ||
                                    "—"}
                            </strong>

                        </div>


                        <div className="settings-row">

                            <span>
                                Role
                            </span>

                            <strong>
                                {user?.role ||
                                    "Administrator"}
                            </strong>

                        </div>

                    </div>

                </div>

            </section>


            {/* USER MANAGEMENT */}

            <section className="dashboard-panel settings-panel">

                <div className="panel-heading">

                    <div>

                        <h3>
                            User Management
                        </h3>

                        <p>
                            Create another user account for
                            accessing the security platform.
                        </p>

                    </div>


                    <button
                        className="settings-action-button"
                        onClick={() =>
                            setShowRegister(
                                !showRegister
                            )
                        }
                    >

                        <UserPlus size={16} />

                        {showRegister
                            ? "Close"
                            : "Register User"}

                    </button>

                </div>


                {showRegister && (

                    <form
                        className="register-form"
                        onSubmit={handleRegister}
                    >

                        <div className="settings-form-grid">

                            <div className="login-field">

                                <label>
                                    Full Name
                                </label>

                                <div className="login-input">

                                    <User size={17} />

                                    <input
                                        type="text"
                                        placeholder="Enter user's name"
                                        value={name}
                                        onChange={(e) =>
                                            setName(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                </div>

                            </div>


                            <div className="login-field">

                                <label>
                                    Email
                                </label>

                                <div className="login-input">

                                    <Mail size={17} />

                                    <input
                                        type="email"
                                        placeholder="Enter email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                </div>

                            </div>

                        </div>


                        <div className="login-field">

                            <label>
                                Password
                            </label>

                            <div className="login-input">

                                <Shield size={17} />

                                <input
                                    type="password"
                                    placeholder="Create password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(
                                            e.target.value
                                        )
                                    }
                                    required
                                    minLength={6}
                                />

                            </div>

                        </div>


                        {error && (

                            <div className="settings-message error">

                                <AlertCircle size={16} />

                                {error}

                            </div>

                        )}


                        {success && (

                            <div className="settings-message success">

                                <CheckCircle size={16} />

                                {success}

                            </div>

                        )}


                        <button
                            type="submit"
                            className="settings-save-button"
                            disabled={loading}
                        >

                            {loading
                                ? "Creating User..."
                                : "Create User"}

                        </button>

                    </form>

                )}

            </section>


            {/* SECURITY */}

            <section className="dashboard-panel settings-panel">

                <div className="panel-heading">

                    <div>

                        <h3>
                            Security
                        </h3>

                        <p>
                            Authentication and access information.
                        </p>

                    </div>

                </div>


                <div className="security-info">

                    <div className="security-item">

                        <CheckCircle size={18} />

                        <div>

                            <strong>
                                Authentication Active
                            </strong>

                            <span>
                                Your session is protected
                                using JWT authentication.
                            </span>

                        </div>

                    </div>


                    <div className="security-item">

                        <Shield size={18} />

                        <div>

                            <strong>
                                Role Based Access
                            </strong>

                            <span>
                                Access is controlled by the
                                authenticated user's role.
                            </span>

                        </div>

                    </div>

                </div>

            </section>

        </main>
    );
}

export default Settings;