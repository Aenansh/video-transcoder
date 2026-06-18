import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import AuthForm from "./pages/Auth";
function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 text-neutral-900">
      <h1 className="text-4xl font-bold mb-6">Welcome to the App</h1>
      <Link
        to="/auth"
        className="px-6 py-3 bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-800 transition-colors"
      >
        Sign In / Create Account
      </Link>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthForm />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
