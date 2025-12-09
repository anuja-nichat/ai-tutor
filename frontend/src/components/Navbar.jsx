import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Upload,
  BookOpen,
  ClipboardList,
  BarChart2,
  User,
  LogOut,
  Menu,
  X,
  Brain,
} from "lucide-react";
import { getAuth, signOut } from "firebase/auth";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const SCROLL_THRESHOLD = 40;

  const controlNavbar = () => {
    if (window.scrollY <= SCROLL_THRESHOLD) {
      setShowNavbar(true);
    } else if (window.scrollY > lastScrollY) {
      setShowNavbar(false);
    } else {
      setShowNavbar(true);
    }
    setLastScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Upload", path: "/upload", icon: <Upload size={18} /> },
    { name: "Study Plan", path: "/study-plan", icon: <BookOpen size={18} /> },
    { name: "Quiz", path: "/quiz", icon: <ClipboardList size={18} /> },
    { name: "Progress", path: "/progress", icon: <BarChart2 size={18} /> },
    { name: "Profile", path: "/profile", icon: <User size={18} /> },
  ];

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  return (
    <AnimatePresence>
      {showNavbar && (
        <motion.nav
          key="navbar"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 w-full backdrop-blur-xl 
            bg-gradient-to-r from-[#0a0f1f]/95 via-[#0d1a2b]/95 to-[#0a0f1f]/95
            shadow-[0_0_25px_rgba(16,185,129,0.35)] z-50"
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            {/* Logo */}
            <Link to="/dashboard">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="text-3xl font-extrabold cursor-pointer flex items-center gap-2"
              >
                <Brain
                  size={32}
                  className="text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                />
                <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                  AI
                </span>
                <span className="bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]">
                  Tutor
                </span>
              </motion.div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4 relative">
              {navLinks.map((link) => {
                if (link.name === "Profile") {
                  return (
                    <React.Fragment key={link.name}>
                      {/* Mock Test Button with icon and active animation */}
                      <Link
                        to="/mock-test"
                        className={`relative px-3 py-2 rounded-lg font-medium tracking-wide flex items-center gap-2 transition ${
                          location.pathname === "/mock-test"
                            ? "text-white"
                            : "text-gray-300 hover:text-emerald-400"
                        }`}
                      >
                        {location.pathname === "/mock-test" && (
                          <motion.div
                            layoutId="active-pill"
                            className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.8)] -z-10"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                        <ClipboardList size={18} />
                        Mock Test
                      </Link>

                      {/* Profile Link */}
                      <Link
                        to={link.path}
                        className={`relative px-3 py-2 rounded-lg font-medium tracking-wide flex items-center gap-2 transition ${
                          location.pathname === link.path
                            ? "text-white"
                            : "text-gray-300 hover:text-emerald-400"
                        }`}
                      >
                        {location.pathname === link.path && (
                          <motion.div
                            layoutId="active-pill"
                            className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.8)] -z-10"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                        {link.icon}
                        {link.name}
                      </Link>
                    </React.Fragment>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative px-3 py-2 rounded-lg font-medium tracking-wide flex items-center gap-2 transition ${
                      location.pathname === link.path
                        ? "text-white"
                        : "text-gray-300 hover:text-emerald-400"
                    }`}
                  >
                    {location.pathname === link.path && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.8)] -z-10"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    {link.icon}
                    {link.name}
                  </Link>
                );
              })}

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="ml-2 px-6 py-2 text-emerald-400 rounded-xl font-semibold tracking-wide 
                  transition hover:bg-gradient-to-r hover:from-emerald-400 hover:to-green-600 hover:text-white 
                  shadow-[0_0_15px_rgba(16,185,129,0.6)] flex items-center gap-2"
              >
                <LogOut size={18} /> Logout
              </motion.button>
            </div>

            {/* Mobile Hamburger */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="md:hidden text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </motion.button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="md:hidden bg-[#0a0f1f]/95 backdrop-blur-lg px-6 py-4 space-y-3 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                {navLinks.map((link) => {
                  if (link.name === "Profile") {
                    return (
                      <React.Fragment key={link.name}>
                        {/* Mock Test Button Mobile */}
                        <Link
                          to="/mock-test"
                          className={`block px-3 py-2 rounded-lg font-medium tracking-wide flex items-center gap-3 transition ${
                            location.pathname === "/mock-test"
                              ? "bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.7)]"
                              : "text-gray-300 hover:text-emerald-400 hover:bg-white/5"
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <ClipboardList size={18} />
                          Mock Test
                        </Link>

                        {/* Profile Link Mobile */}
                        <Link
                          to={link.path}
                          className={`block px-3 py-2 rounded-lg font-medium tracking-wide flex items-center gap-3 transition ${
                            location.pathname === link.path
                              ? "bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.7)]"
                              : "text-gray-300 hover:text-emerald-400 hover:bg-white/5"
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          {link.icon}
                          {link.name}
                        </Link>
                      </React.Fragment>
                    );
                  }

                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`block px-3 py-2 rounded-lg font-medium tracking-wide flex items-center gap-3 transition ${
                        location.pathname === link.path
                          ? "bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.7)]"
                          : "text-gray-300 hover:text-emerald-400 hover:bg-white/5"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  );
                })}

                {/* Mobile Logout */}
                <motion.button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-center px-4 py-2 text-emerald-400 rounded-lg font-semibold tracking-wide 
                  transition hover:bg-gradient-to-r hover:from-emerald-400 hover:to-green-600 hover:text-white 
                  shadow-[0_0_15px_rgba(16,185,129,0.6)] flex items-center justify-center gap-2"
                >
                  <LogOut size={18} /> Logout
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
