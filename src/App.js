import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import Login from "./authentication/Login";
import Signup from "./authentication/Signup";
import AdminPanel from "./admin/AdminPanel";
import ProtectedAdminRoute from "./authentication/ProtectedAdminRoute"; // Import the protected route
import { ToastContainer } from "react-toastify";
import MyPolicies from "./pages/policies/MyPolicies";
import ViewPolicies from "./pages/policies/ViewPolicies";
import MyProfile from "./pages/home/MyProfile";
import { ContractProvider } from "./context/ContractContext";
import FileClaim from "./pages/home/FileClaim";
import RecordProcedure from "./pages/home/RecordProcedure";


function App() {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/policyholder-dashboard" element={<MyPolicies />} />
        <Route path="/myprofile" element={<MyProfile />} />
        <Route path="/file-claim/:policyId" element={<FileClaim />} />
        <Route path="/view-policies" element={<ViewPolicies />} />
        <Route path="/record-procedure" element={<RecordProcedure />} />
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