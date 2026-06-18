import { useState } from "react";
import {
  EyeOff,
  Eye,
  Mail,
  User,
  Lock,
  MonitorPlay,
  Smartphone,
  Download,
  Tv,
} from "lucide-react";

type AuthMode = "signin" | "signup";

export default function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [showPassword, setShowPassword] = useState(false);

  // 1. Add state for the form inputs
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // 2. Add state for UI feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    // Clear errors and password when switching modes for better UX
    setError("");
    setPassword("");
  };

  // 3. The main submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Determine the correct endpoint and payload based on the mode
      const endpoint =
        mode === "signup" ? "/api/v1/users/sign-up" : "/api/v1/users/sign-in";
      const payload =
        mode === "signup" ? { email, username, password } : { email, password };

      // Make the API request to your Express server
      const response = await fetch(`${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Authentication failed");
      }

      // Success! Handle the token or redirect here
      console.log("Success:", data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131314] flex flex-col font-sans text-[#E3E3E3] relative overflow-hidden selection:bg-[#A8C7FA] selection:text-[#131314]">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-[0.07]"
      >
        <source src="/bgvideo.mp4" type="video/mp4" />
      </video>

      {/* Header Section */}
      <header className="flex flex-col sm:flex-row justify-between items-center px-8 py-6 w-full relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-4 sm:mb-0 w-full sm:w-1/3">
          <img src="./logo-bgless.svg" alt="logo" width={36} className="ml-1" />
          <span className="font-semibold text-xl tracking-tight bg-clip-text text-transparent bg-linear-to-r from-[#eaddcf] via-[#9B72CB] to-[#D96570]">
            StreamFlix
          </span>
        </div>

        {/* Right Auth Switcher */}
        <div className="text-sm w-full sm:w-1/3 text-left sm:text-right">
          <p className="text-[#C4C7C5]">
            {mode === "signup"
              ? "Already have an account? "
              : "Need an account? "}
            <button
              onClick={toggleMode}
              className="font-medium text-[#A8C7FA] hover:text-[#D3E3FD] transition-colors"
            >
              {mode === "signup" ? "Log in" : "Create one"}
            </button>
          </p>
          {mode === "signin" && (
            <button className="text-[#8E918F] text-xs mt-1 hover:text-[#C4C7C5] transition-colors">
              Forget your user ID or password?
            </button>
          )}
        </div>
      </header>

      {/* Main Content Centered */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">
        <div className="bg-[#1E1F20] rounded-3xl shadow-2xl w-full max-w-lg p-8 sm:p-12 border border-[#444746]">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center border border-[#444746]">
              <img
                src="./logo-bgless.svg"
                alt="logo"
                width={48}
                className="ml-1"
              />
            </div>
          </div>
          <div className="text-center mb-10">
            <h2 className="text-[28px] font-medium tracking-tight text-[#E3E3E3]">
              {mode === "signup" ? "Create an account" : "Welcome back"}
            </h2>
            <p className="text-[#C4C7C5] text-sm">
              Join StreamFlix to watch unlimited
              <br />
              movies, TV shows and more.
            </p>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="mb-6 p-4 bg-[#331D1D] border border-[#8C1D18] text-[#FF897D] text-sm rounded-xl text-center">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="relative group">
              <label className="block text-sm font-medium text-[#E3E3E3] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8E918F]"
                  strokeWidth={1.5}
                />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#131314] rounded-xl border border-[#444746] focus:outline-none focus:ring-1 focus:ring-[#A8C7FA] focus:border-[#A8C7FA] transition-all placeholder:text-[#8E918F] text-[#E3E3E3]"
                />
              </div>
              {/* Tooltip */}
              {mode === "signup" && (
                <div className="absolute left-[105%] top-8 hidden lg:group-focus-within:block lg:group-hover:block w-56 bg-[#131314] text-[#E3E3E3] text-xs p-3 rounded-lg shadow-xl z-10 border border-[#444746]">
                  We will use your email as your user ID.
                </div>
              )}
            </div>

            {/* Username Field */}
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-[#E3E3E3] mb-2">
                  Username
                </label>
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8E918F]"
                    strokeWidth={1.5}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-[#131314] rounded-xl border border-[#444746] focus:outline-none focus:ring-1 focus:ring-[#A8C7FA] focus:border-[#A8C7FA] transition-all placeholder:text-[#8E918F] text-[#E3E3E3]"
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-[#E3E3E3] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8E918F]"
                  strokeWidth={1.5}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-[#131314] rounded-xl border border-[#444746] focus:outline-none focus:ring-1 focus:ring-[#A8C7FA] focus:border-[#A8C7FA] transition-all placeholder:text-[#8E918F] text-[#E3E3E3]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8E918F] hover:text-[#E3E3E3] transition-colors"
                >
                  {showPassword ? (
                    <Eye size={20} strokeWidth={1.5} />
                  ) : (
                    <EyeOff size={20} strokeWidth={1.5} />
                  )}
                </button>
              </div>

              {/* Password Requirements */}
              {mode === "signup" && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4 text-xs text-[#C4C7C5]">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#444746]"></div>
                    <span>Use 8 or more characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#444746]"></div>
                    <span>Use upper and lower case letters (e.g. Aa)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#444746]"></div>
                    <span>Use a number (e.g. 1234)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#444746]"></div>
                    <span>Use a symbol (e.g. !@#$)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full rounded-xl py-3.5 font-medium transition-all flex justify-center items-center ${
                  isLoading
                    ? "bg-[#444746] text-[#8E918F] cursor-not-allowed"
                    : "bg-[#A8C7FA] text-[#041E49] hover:bg-[#D3E3FD]"
                }`}
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-[#8E918F] border-t-transparent rounded-full animate-spin"></span>
                ) : mode === "signup" ? (
                  "Sign up"
                ) : (
                  "Log in"
                )}
              </button>
            </div>

            {/* Terms */}
            {mode === "signup" && (
              <p className="text-center text-[13px] text-[#8E918F] mt-6">
                By creating an account, you agree to the{" "}
                <a
                  href="#"
                  className="text-[#C4C7C5] underline hover:text-[#E3E3E3]"
                >
                  Terms of use
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-[#C4C7C5] underline hover:text-[#E3E3E3]"
                >
                  Privacy Policy
                </a>
                .
              </p>
            )}
          </form>
        </div>
      </main>

      {/* Bottom Features Banner */}
      <footer className="w-full bg-[#131314] border-t border-[#444746] py-6 mt-auto relative z-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-[#444746]">
          <div className="flex items-center justify-center md:justify-start gap-4 px-4 py-2 md:py-0">
            <MonitorPlay className="w-8 h-8 text-[#A8C7FA]" strokeWidth={1.5} />
            <div>
              <h4 className="text-sm font-medium text-[#E3E3E3]">
                Unlimited entertainment
              </h4>
              <p className="text-xs text-[#8E918F]">Watch all you want.</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-center gap-4 px-4 py-4 md:py-0">
            <Smartphone className="w-8 h-8 text-[#A8C7FA]" strokeWidth={1.5} />
            <div>
              <h4 className="text-sm font-medium text-[#E3E3E3]">
                Watch anywhere
              </h4>
              <p className="text-xs text-[#8E918F]">On any device.</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-center gap-4 px-4 py-4 md:py-0">
            <Download className="w-8 h-8 text-[#A8C7FA]" strokeWidth={1.5} />
            <div>
              <h4 className="text-sm font-medium text-[#E3E3E3]">
                Download & go
              </h4>
              <p className="text-xs text-[#8E918F]">Watch offline.</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-4 px-4 py-4 md:py-0">
            <Tv className="w-8 h-8 text-[#A8C7FA]" strokeWidth={1.5} />
            <div>
              <h4 className="text-sm font-medium text-[#E3E3E3]">
                HD & 4K quality
              </h4>
              <p className="text-xs text-[#8E918F]">Best experience.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
