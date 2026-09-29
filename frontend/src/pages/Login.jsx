import { useState } from "react";
import { Shield, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("LOGIN BUTTON CLICKED");
        console.log("Email:", email);

        setError("");
        setLoading(true);

        try {
            const data = await login(email, password);

            console.log("LOGIN SUCCESS:", data);

            // Explicitly redirect after successful login
            navigate("/dashboard", { replace: true });

        } catch (err) {
            console.error("LOGIN ERROR:", err);

            setError(
                err.message || "Invalid email or password"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                {/* LOGO */}
                <div className="login-logo">
                    <Shield size={32} />
                </div>

                <h1>API SENTINEL</h1>

                <p className="login-subtitle">
                    SECURITY PLATFORM
                </p>

                <h2>Welcome back</h2>

                <p className="login-description">
                    Sign in to access your security dashboard.
                </p>

                <form onSubmit={handleSubmit}>

                    {/* EMAIL */}
                    <div className="login-field">

                        <label htmlFor="email">
                            Email
                        </label>

                        <div className="login-input">

                            <Mail size={17} />

                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                autoComplete="email"
                                required
                            />

                        </div>

                    </div>

                    {/* PASSWORD */}
                    <div className="login-field">

                        <label htmlFor="password">
                            Password
                        </label>

                        <div className="login-input">

                            <Lock size={17} />

                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                autoComplete="current-password"
                                required
                            />

                        </div>

                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    {/* LOGIN BUTTON */}
                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign In"}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default Login;