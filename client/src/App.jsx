import { Routes, Route } from "react-router-dom";

import Home from "./pages/Landing/Home";
import AdminLogin from "./pages/auth/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import StudentLogin from "./pages/auth/StudentLogin";
import StudentDashboard from "./pages/Student/StudentDashboard";
import CreateElection from "./pages/Admin/CreateElection";
import ImportStudents from "./pages/Admin/ImportStudents";
import VotePage from "./pages/Student/VotePage";
import AdminResults from "./pages/Admin/AdminResults";
import AdminElections from "./pages/Admin/AdminElections";
import AddAdmin from "./pages/Admin/AddAdmin";
import ElectionDetails from "./pages/Admin/ElectionDetails";
import EditElection from "./pages/Admin/EditElection";
import StudentForgotPassword from "./pages/auth/StudentForgotPassword";
import StudentVerifyOtp from "./pages/auth/StudentVerifyOtp";
import StudentResetPassword from "./pages/auth/StudentResetPassword";
import AdminForgotPassword from "./pages/auth/AdminForgotPassword";
import AdminVerifyOtp from "./pages/auth/AdminVerifyOtp";
import AdminResetPassword from "./pages/auth/AdminResetPassword";
import StudentResults from "./pages/Student/StudentResults";

function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/admin-login"
        element={<AdminLogin />}
      />

      <Route
        path="/student-login"
        element={<StudentLogin />}
      />

      <Route
        path="/student/dashboard"
        element={<StudentDashboard />}
      />

      <Route
        path="/admin/dashboard"
        element={<AdminDashboard />}
      />

      <Route
        path="/admin/elections/create"
        element={<CreateElection />}
      />

      <Route
       path="/admin/students/import"
       element={<ImportStudents />}
      />

      <Route
       path="/student/vote/:electionId"
       element={<VotePage />}
      />

      <Route
        path="/admin/results"
        element={<AdminResults />}
      />

      <Route
        path="/admin/elections"
        element={<AdminElections />}
      />

      <Route
        path="/admin/add-admin"
        element={<AddAdmin />}
      />

      <Route
        path="/admin/elections/:id"
        element={<ElectionDetails />}
      />

      <Route
  path="/admin/elections/:id/edit"
  element={
    <EditElection />
  }
/>

<Route
  path="/student/forgot-password"
  element={<StudentForgotPassword />}
/>

<Route
  path="/student/forgot-password/verify"
  element={<StudentVerifyOtp />}
/>

<Route
  path="/student/forgot-password/reset"
  element={<StudentResetPassword />}
/>

<Route
  path="/admin/forgot-password"
  element={<AdminForgotPassword />}
/>

<Route
  path="/admin/forgot-password/verify"
  element={<AdminVerifyOtp />}
/>

<Route
  path="/admin/forgot-password/reset"
  element={<AdminResetPassword />}
/>

<Route
  path="/student/results/:electionId"
  element={<StudentResults />}
/>

    </Routes>
  );
}

export default App;