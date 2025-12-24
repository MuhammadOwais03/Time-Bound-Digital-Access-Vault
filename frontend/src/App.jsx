// import React, { useState, useEffect } from "react";
// import {
//   Lock,
//   Key,
//   Eye,
//   EyeOff,
//   Plus,
//   Share2,
//   Clock,
//   Shield,
//   LogOut,
//   Copy,
//   Check,
//   AlertCircle,
//   ChevronRight,
//   Trash2,
// } from "lucide-react";
// import LoginPage from "./components/LoginPage";
// import RegisterPage from "./components/RegisterPage";
// import Dashboard from "./components/Dashboard";
// import CreateVault from "./components/CreateVault";
// import ViewVault from "./components/ViewVault";
// import PublicAccess from "./components/PublicAccess";
// import { handleLogin } from "./utils/login";

// // API base URL - update this to match your backend
// const API_BASE_URL = "http://localhost:3000/api";

// const App = () => {
//   const [currentPage, setCurrentPage] = useState("login");
//   const [user, setUser] = useState(null);
//   const [vaultItems, setVaultItems] = useState([]);
//   const [selectedVault, setSelectedVault] = useState(null);
//   const [notification, setNotification] = useState(null);

//   useEffect(() => {
//     const checkAuth = async () => {
//       console.log("Checking authentication status...");
//       try {
//         const response = await fetch(`${API_BASE_URL}/users/me`, {
//           method: "GET",
//           credentials: "include", // Critical: sends the cookie
//         });

//         console.log("Auth check response:", response);

        
//         if (response.ok) {
//           console.log("Auth check response status:", response);
//           const data = await response.json();
//           console.log("Authenticated user data:", data.data.user);
//           setUser(data.data.user); // or { authenticated: true, ...data.user }
//           setCurrentPage("dashboard");
//           fetchVaultItems();
//         } else {
//           // Not logged in → stay on login
//           setCurrentPage("login");
//         }
//       } catch (err) {
//         console.error("Auth check failed", err);
//         setCurrentPage("login");
//       }
//     };

//     checkAuth();
//   }, []);

//   const showNotification = (message, type = "success") => {
//     setNotification({ message, type });
//     setTimeout(() => setNotification(null), 4000);
//   };

//   const fetchVaultItems = async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/vaults/`, {
//        credentials: "include",
//       });
//       if (response.ok) {
//         const data = await response.json();
//         console.log("Fetch vault items response:", data.data);
//         setVaultItems(data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching vault items:", error);
//     }
//   };

//   const handleLogout = () => {
//     // localStorage.removeItem("token");
//     // setUser(null);
//     // setCurrentPage("login");
//     // setVaultItems([]);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
//       {notification && (
//         <div
//           className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
//             notification.type === "success" ? "bg-green-500" : "bg-red-500"
//           } text-white`}
//         >
//           {notification.type === "success" ? (
//             <Check size={20} />
//           ) : (
//             <AlertCircle size={20} />
//           )}
//           {notification.message}
//         </div>
//       )}

//       {currentPage === "login" && (
//         <LoginPage
//           onLogin={handleLogin.bind(
//             null,
//             setUser,
//             setCurrentPage,
//             fetchVaultItems,
//             showNotification
//           )}
//           onSwitchToRegister={() => setCurrentPage("register")}
//         />
//       )}

//       {currentPage === "register" && (
//         <RegisterPage
//           onRegister={() => {
//             setCurrentPage("login");
//             showNotification("Registration successful! Please login.");
//           }}
//           onSwitchToLogin={() => setCurrentPage("login")}
//         />
//       )}

//       {currentPage === "dashboard" && user && (
//         <Dashboard
//           vaultItems={vaultItems}
//           onCreateNew={() => setCurrentPage("create")}
//           onViewVault={(vault) => {
//             setSelectedVault(vault);
//             setCurrentPage("viewVault");
//           }}
//           onLogout={handleLogout}
//           onRefresh={fetchVaultItems}
//         />
//       )}

//       {currentPage === "create" && user && (
//         <CreateVault
//           onBack={() => setCurrentPage("dashboard")}
//           onCreated={() => {
//             fetchVaultItems();
//             setCurrentPage("dashboard");
//             showNotification("Vault item created successfully!");
//           }}
//         />
//       )}

//       {currentPage === "viewVault" && selectedVault && user && (
//         <ViewVault
//           vault={selectedVault}
//           onBack={() => {
//             setSelectedVault(null);
//             setCurrentPage("dashboard");
//           }}
//           onShareCreated={() => {
//             showNotification("Share link created!");
//           }}
//         />
//       )}

//       {currentPage === "publicAccess" && (
//         <PublicAccess
//           shareId={selectedVault}
//           onBack={() => setCurrentPage("login")}
//         />
//       )}
//     </div>
//   );
// };

// export default App;

// // import React, { useState, useEffect } from 'react';
// // import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
// // import { Lock, LogOut, AlertCircle, Check } from 'lucide-react';
// // import LoginPage from './components/LoginPage';
// // import RegisterPage from './components/RegisterPage';
// // import Dashboard from './components/Dashboard';
// // import CreateVault from './components/CreateVault';
// // import ViewVault from './components/ViewVault';
// // import PublicAccess from './components/PublicAccess';

// // const API_BASE_URL = 'http://localhost:3000/api';

// // // Protected Route Component
// // const ProtectedRoute = ({ children }) => {
// //   const token = localStorage.getItem('token');
// //   return token ? children : <Navigate to="/login" replace />;
// // };

// // // Public-only Route (redirect logged-in users away)
// // const PublicRoute = ({ children }) => {
// //   const token = localStorage.getItem('token');
// //   return token ? <Navigate to="/dashboard" replace /> : children;
// // };

// // // Layout for Authenticated Pages
// // const AuthLayout = ({ user, onLogout, children }) => {
// //   const navigate = useNavigate();

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
// //       {/* Top Navigation Bar */}
// //       <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
// //         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// //           <div className="flex items-center justify-between h-16">
// //             <div className="flex items-center gap-3">
// //               <Lock className="w-8 h-8 text-purple-400" />
// //               <h1 className="text-2xl font-bold text-white">SecureVault</h1>
// //             </div>
// //             <button
// //               onClick={onLogout}
// //               className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors text-white"
// //             >
// //               <LogOut size={20} />
// //               Logout
// //             </button>
// //           </div>
// //         </div>
// //       </nav>

// //       {/* Main Content */}
// //       <main className="max-w-7xl mx-auto px-4 py-8">
// //         {children}
// //       </main>
// //     </div>
// //   );
// // };

// // // Notification Component
// // const Notification = ({ message, type, onClose }) => {
// //   useEffect(() => {
// //     const timer = setTimeout(onClose, 4000);
// //     return () => clearTimeout(timer);
// //   }, [onClose]);

// //   return (
// //     <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in ${
// //       type === 'success' ? 'bg-green-500' : 'bg-red-500'
// //     } text-white`}>
// //       {type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
// //       {message}
// //     </div>
// //   );
// // };

// // const App = () => {
// //   const [user, setUser] = useState(null);
// //   const [notification, setNotification] = useState(null);

// //   useEffect(() => {
// //     const token = localStorage.getItem('token');
// //     if (token) {
// //       setUser({ token });
// //     }
// //   }, []);

// //   const showNotification = (message, type = 'success') => {
// //     setNotification({ message, type });
// //   };

// //   const handleLogin = (token) => {
// //     localStorage.setItem('token', token);
// //     setUser({ token });
// //     showNotification('Login successful!');
// //   };

// //   const handleLogout = () => {
// //     localStorage.removeItem('token');
// //     setUser(null);
// //     showNotification('Logged out successfully');
// //   };

// //   return (
// //     <BrowserRouter>
// //       {notification && (
// //         <Notification
// //           message={notification.message}
// //           type={notification.type}
// //           onClose={() => setNotification(null)}
// //         />
// //       )}

// //       <Routes>
// //         {/* Public Routes */}
// //         <Route path="/login" element={<PublicRoute><LoginPage onLogin={handleLogin} /></PublicRoute>} />
// //         <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

// //         {/* Public Share Access */}
// //         <Route path="/share/:shareId" element={<PublicAccess />} />

// //         {/* Protected Routes */}
// //         <Route
// //           path="/dashboard"
// //           element={
// //             <ProtectedRoute>
// //               <AuthLayout user={user} onLogout={handleLogout}>
// //                 <Dashboard />
// //               </AuthLayout>
// //             </ProtectedRoute>
// //           }
// //         />

// //         <Route
// //           path="/create"
// //           element={
// //             <ProtectedRoute>
// //               <AuthLayout user={user} onLogout={handleLogout}>
// //                 <CreateVault />
// //               </AuthLayout>
// //             </ProtectedRoute>
// //           }
// //         />

// //         <Route
// //           path="/vault/:vaultId"
// //           element={
// //             <ProtectedRoute>
// //               <AuthLayout user={user} onLogout={handleLogout}>
// //                 <ViewVault />
// //               </AuthLayout>
// //             </ProtectedRoute>
// //           }
// //         />

// //         {/* Redirects */}
// //         <Route path="/" element={<Navigate to="/dashboard" replace />} />
// //         <Route path="*" element={<Navigate to="/login" replace />} />
// //       </Routes>
// //     </BrowserRouter>
// //   );
// // };

// // export default App;


import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Lock, LogOut, Check, AlertCircle } from 'lucide-react';

import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Dashboard from './components/Dashboard';
import CreateVault from './components/CreateVault';
import ViewVault from './components/ViewVault';
import PublicAccess from './components/PublicAccess';

const API_BASE_URL = 'https://time-bound-digital-access-vault-s4k.vercel.app/api';

// Protected Route
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          credentials: 'include',
        });
        setIsAuthenticated(response.ok);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          credentials: 'include',
        });
        setIsAuthenticated(response.ok);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

// Auth Layout with Nav
const AuthLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/users/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Lock className="w-8 h-8 text-purple-400" />
              <h1 className="text-2xl font-bold text-white">Digital Vault</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors text-white"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

// Notification
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`}>
      {type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
      {message}
    </div>
  );
};

const App = () => {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  return (
    <BrowserRouter>
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute><LoginPage showNotification={showNotification} /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage showNotification={showNotification} /></PublicRoute>} />

        {/* Public Share */}
        <Route path="/share/:shareId" element={<PublicAccess />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AuthLayout>
                <Dashboard showNotification={showNotification} />
              </AuthLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <AuthLayout>
                <CreateVault showNotification={showNotification} />
              </AuthLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/vault/:vaultId"
          element={
            <ProtectedRoute>
              <AuthLayout>
                <ViewVault showNotification={showNotification} />
              </AuthLayout>
            </ProtectedRoute>
          }
        />

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;