
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Productivity from "./pages/Productivity";
import Notifications from "./pages/Notifications";
import Groups from "./pages/Groups";
import Chat from "./pages/Chat";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/productivity" element={<Productivity />} />
        <Route path="/notifications" element={<Notifications />}/>
        <Route path="/groups" element={<Groups />} />
        <Route path="/chat/:groupId" element={
          <Chat />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
