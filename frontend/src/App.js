import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Register from "./Pages/Register.js";
import Login from "./Pages/Login.js";
import Profile from "./Pages/Profile.js";
import CanvasPage from "./Pages/CanvasPage.js";

function App() {
  const token = localStorage.getItem("token");
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/profile"
          element={token ? <Profile /> : <Navigate to="/" />}
        />
        <Route
          path="/canvas/:id"
          element={token ? <CanvasPage /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
