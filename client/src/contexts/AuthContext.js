import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          // Only fetch user if not already loaded
          if (!user) {
            await fetchUser();
          }
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []); // Empty dependency array to run only once on mount

  // Keep this for token changes after initialization
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/me");
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (error) {
      console.error("Failed to fetch user:", error);
      logout();
    }
  };
  
  const register = async (email, password, name, is_organizer) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        email,
        password,
        name,
        is_organizer
      });
      if (res.status === 201) {
        navigate("/login");
      }
    } catch (error) {
      console.error("Registration failed:", error.response?.data || error.message);
      throw error; // Re-throw for handling in UI
    }
  };

const login = async (email, password) => {
  try {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email,
      password,
    });
    
    if (!res.data.access_token) {
      throw new Error("Login failed - no token received");
    }

    localStorage.setItem("token", res.data.access_token);
    
    // Fetch user data
    const userRes = await axios.get("http://localhost:5000/api/auth/me", {
      headers: { Authorization: `Bearer ${res.data.access_token}` }
    });

    const userData = userRes.data;
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setToken(res.data.access_token);
    navigate("/");
    
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    // Extract the error message from the response if available
    const errorMessage = error.response?.data?.error || "Invalid email or password";
    throw new Error(errorMessage); // Throw the specific error message
  }
};

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        loading,
        register, 
        login, 
        logout 
      }}
    >
      {!loading && children} {/* Only render children when not loading */}
    </AuthContext.Provider>
  );
};

export default AuthContext;