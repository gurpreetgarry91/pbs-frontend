import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import RequireAuth from "./components/common/RequireAuth";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import UsersPage from "./pages/Dashboard/Users";
import SubscriptionsPage from "./pages/Dashboard/Subscriptions";
import UserSubscriptionsPage from "./pages/Dashboard/UserSubscriptions";
import UserSubscriptionsNew from "./pages/Dashboard/UserSubscriptionsNew";
import UserSubscriptionsEdit from "./pages/Dashboard/UserSubscriptionsEdit";
import CalendarMediaPage from "./pages/CalendarMediaPage";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route index path="/dashboard" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/dashboard/users" element={<UsersPage />} />
            <Route path="/dashboard/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/dashboard/user-subscriptions" element={<UserSubscriptionsPage />} />
            <Route path="/dashboard/user-subscriptions/new" element={<UserSubscriptionsNew />} />
            <Route path="/dashboard/user-subscriptions/:id/edit" element={<UserSubscriptionsEdit />} />
            <Route path="/dashboard/calendar-media" element={<CalendarMediaPage />} />

          </Route>

          {/* Auth Layout */}
          <Route path="/" element={<SignIn />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
