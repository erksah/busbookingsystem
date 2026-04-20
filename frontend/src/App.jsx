import Processing from "./pages/processing/Processing";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Chatbot from "./components/chatbot/Chatbot";

// 🌐 USER PAGES
import HomeContainer from "./pages/home_container/HomeContainer";
import Bus from "./pages/bus/Bus";
import Detail from "./pages/bus/Detail";
import Checkout from "./pages/checkout/Checkout";
import Bookings from "./pages/bookings/Bookings";
import Receipt from "./pages/bookings/Receipt";
import CancelTicket from "./pages/cancel/CancelTicket";

// 🔓 AUTH
import Login from "./passenger/pages/Login";
import Register from "./passenger/pages/Register";
import ForgotPassword from "./passenger/pages/ForgotPassword"; // ✅ NEW

// 🔐 ADMIN
import AdminRoutes from "./admin/routes/AdminRoutes";

// 🔐 PASSENGER
import PassengerRoutes from "./passenger/routes/PassengerRoutes";


// ==============================
// 🔥 LAYOUT
// ==============================
const Layout = () => {

  const location = useLocation();

  const isAdmin = location.pathname.startsWith("/admin");
  const isPassenger = location.pathname.startsWith("/passenger");

  return (
    <div className="flex flex-col min-h-screen">

      {/* NAVBAR */}
      {!isAdmin && !isPassenger && <Navbar />}

      {/* MAIN */}
      <main className={`flex-grow ${!isAdmin && !isPassenger ? "pt-[70px]" : ""}`}>

        <Routes>

          {/* ==============================
              🌐 PUBLIC ROUTES
          ============================== */}

          {/* 🏠 HOME */}
          <Route path="/" element={<HomeContainer />} />

          {/* 🔍 SEARCH */}
          <Route path="/bus" element={<Bus />} />

          {/* 🪑 DETAIL */}
          <Route path="/bus/:id" element={<Detail />} />

          {/* 💳 BOOKING */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/processing" element={<Processing />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/receipt" element={<Receipt />} />
          <Route path="/cancel-ticket" element={<CancelTicket />} />

          {/* ==============================
              🔓 AUTH
          ============================== */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} /> {/* ✅ FIX */}

          {/* ==============================
              🔐 PASSENGER
          ============================== */}
          <Route path="/passenger/*" element={<PassengerRoutes />} />

          {/* ==============================
              🔐 ADMIN
          ============================== */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* ==============================
              ❌ 404
          ============================== */}
          <Route
            path="*"
            element={
              <div className="text-center mt-20">
                <h2 className="text-xl font-semibold">
                  Page not found ❌
                </h2>
              </div>
            }
          />

        </Routes>

      </main>

      {/* FOOTER */}
      {!isAdmin && !isPassenger && <Footer />}

      {/* CHATBOT */}
      {!isAdmin && <Chatbot />}

    </div>
  );
};


// ==============================
// 🚀 APP ROOT
// ==============================
function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;