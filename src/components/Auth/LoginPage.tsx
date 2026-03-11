import React, { useState } from "react";
import { motion } from "motion/react";
import { auth, db } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useAppStore } from "../../store";
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setRole, setUser, logActivity } = useAppStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;
        setRole(role);
        setUser({
          uid: user.uid,
          email: user.email || "",
          name: userData.name || "User",
          role: role
        });
        
        await logActivity("Login", { email: user.email });
      } else {
        setError("User profile not found. Please contact administrator.");
        await auth.signOut();
      }
    } catch (err: any) {
      console.error(err);
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] p-4 font-sans">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-[#F97316] rounded-2xl flex items-center justify-center shadow-lg shadow-[#F97316]/20 mb-4">
                <span className="text-white font-black text-3xl">N</span>
              </div>
              <h1 className="text-2xl font-bold text-white text-center">
                Neoteric Properties
              </h1>
              <p className="text-blue-200/60 text-sm font-medium">
                Garden City Portal
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-blue-200/80 uppercase tracking-widest mb-2 ml-1">
                  User ID / Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@neoteric.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 focus:border-[#F97316] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-200/80 uppercase tracking-widest mb-2 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200/40" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 focus:border-[#F97316] transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#F97316] focus:ring-[#F97316]/50"
                  />
                  <span className="text-xs text-blue-200/60 group-hover:text-blue-200 transition-colors">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  className="text-xs text-[#F97316] hover:text-[#fb923c] font-semibold transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center gap-3 text-sm"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#F97316]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-white/5 p-4 text-center border-t border-white/10">
            <p className="text-[10px] text-blue-200/40 uppercase tracking-widest font-bold">
              Secure Access • Neoteric Properties Group
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
