import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {

            setToken(storedToken);
            setUser(JSON.parse(storedUser));

        }

        setLoading(false);

    }, []);


    // ---------------------------------------------------------
    // LOGIN
    // ---------------------------------------------------------

    const login = async (email, password) => {

        const response = await fetch(
            "http://localhost:5000/api/auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message || "Login failed"
            );

        }

        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        setToken(data.token);
        setUser(data.user);

        return data;
    };


    // ---------------------------------------------------------
    // REGISTER
    // ---------------------------------------------------------

    const register = async (
        name,
        email,
        password
    ) => {

        const response = await fetch(
            "http://localhost:5000/api/auth/register",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message || "Registration failed"
            );

        }

        return data;
    };


    // ---------------------------------------------------------
    // LOGOUT
    // ---------------------------------------------------------

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);

    };


    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
                isAuthenticated: !!token
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {

    return useContext(AuthContext);

}