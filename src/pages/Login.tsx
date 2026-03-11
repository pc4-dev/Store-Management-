import React, { useState } from "react";
import { useAppStore } from "../store";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { Role } from "../types";
import { motion, AnimatePresence } from "motion/react";

const CREDENTIALS: Record<string, { password: string; role: Role }> = {
  admin: { password: "admin123", role: "Super Admin" },
  director: { password: "dir123", role: "Director" },
  agm: { password: "agm123", role: "AGM" },
  pm: { password: "pm123", role: "Project Manager" },
  store: { password: "store123", role: "Store Incharge" },
};

export const Login = () => {
  const { setRole } = useAppStore();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      const user = CREDENTIALS[loginId.toLowerCase()];
      if (user && user.password === password) {
        setRole(user.role);
        window.location.hash = user.role === "Super Admin" ? "superadmin" : "dashboard";
      } else {
        setError("Invalid Login ID or Password");
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Left Side - Branding & Visuals */}
      <div className="hidden md:flex md:w-1/2 lg:w-[60%] relative bg-[#1A1A2E] items-center justify-center p-12 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-orange/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />

        <div className="relative z-10 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-brand-orange rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-orange/40">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-display font-bold text-white tracking-tight">
                Garden City
              </h2>
            </div>

            <h1 className="text-5xl lg:text-6xl font-display font-bold text-white leading-[1.1] mb-6">
              Manage your <span className="text-brand-orange">projects</span> with precision.
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed mb-10 max-w-lg">
              The next generation of property management. Streamline your inventory, 
              procurement, and site operations in one unified portal.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-brand-orange font-display font-bold text-2xl mb-1">24/7</div>
                <div className="text-gray-400 text-sm">Real-time Sync</div>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-brand-orange font-display font-bold text-2xl mb-1">100%</div>
                <div className="text-gray-400 text-sm">Secure Access</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Decorative Element */}
        <motion.div 
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-10 w-32 h-32 bg-gradient-to-br from-brand-orange to-orange-600 rounded-full opacity-20 blur-2xl"
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 lg:p-20 bg-[#F8F9FB]">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile Header */}
          <div className="md:hidden flex flex-col items-center mb-10">
            <div className="w-12 h-12 bg-brand-orange rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-brand-orange/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-brand-dark">Garden City</h1>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-display font-bold text-brand-dark mb-2">Welcome back</h2>
            <p className="text-gray-500">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm overflow-hidden"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Login ID</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-brand-orange transition-colors" />
                </div>
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-brand-dark placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange transition-all shadow-sm"
                  placeholder="e.g. admin"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <button type="button" className="text-xs font-bold text-brand-orange hover:text-orange-600 transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-brand-orange transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-2xl text-brand-dark placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange transition-all shadow-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-1">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 text-brand-orange focus:ring-brand-orange" />
              <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">Remember me for 30 days</label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-dark hover:bg-brand-dark/90 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-brand-dark/10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col items-center">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
              <ShieldCheck className="w-4 h-4" />
              <span>Enterprise Grade Security</span>
            </div>
            <p className="text-xs text-gray-400 text-center">
              By signing in, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
