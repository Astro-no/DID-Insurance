import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import Login from "./authentication/Login";
import Signup from "./authentication/Signup";
import AdminPanel from "./admin/AdminPanel";
import ProtectedAdminRoute from "./authentication/ProtectedAdminRoute"; // Import the protected route
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/admin" element={
          <ProtectedAdminRoute>
            <AdminPanel />
          </ProtectedAdminRoute>
        } 
/>
      </Routes>
    </Router>
  );
}

export default App;
// added the protexted admin route to the app.js file