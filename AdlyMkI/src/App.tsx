import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { HomePage } from "./pages/HomePage"
import { LoginPage } from "./pages/LoginPage"
import { AuthProvider } from "./context/AuthContext"
import { NotificationProvider } from "./context/NotificationContext"
import { DeliveryProvider } from "./context/DeliveryContext"
import { GuestCalendarProvider } from "./context/GuestCalendarContext"
import { GuestRequestProvider } from "./context/GuestRequestContext"
import { GlobalLayout } from "./components/layout/GlobalLayout"
import { DashboardIndex } from "./pages/dashboard/DashboardIndex"
import { CalendarPage } from "./pages/dashboard/CalendarPage"
import { GuestCalendarPage } from "./pages/dashboard/GuestCalendarPage"
import { GuestManagementPage } from "./pages/dashboard/GuestManagementPage"
import { AutonomyPage } from "./pages/dashboard/AutonomyPage"
import { ProfilePage } from "./pages/dashboard/ProfilePage"
import { Toaster } from "./components/ui/toaster"
import { DeliveryPage } from "./pages/dashboard/DeliveryPage"
import { MonthlyReportPage } from "./pages/report/guestReport"
import { FacilityReportsPage } from "./pages/report/FacilityReportsPage"
import { useAuth } from "./context/AuthContext"

// Mostra il calendario ospite per i guest, quello educator per gli altri ruoli
function CalendarRouter() {
  const { user } = useAuth();
  return user?.roles.includes('guest') ? <GuestCalendarPage /> : <CalendarPage />;
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <GuestCalendarProvider>
          <GuestRequestProvider>
            <DeliveryProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login/:roleId" element={<LoginPage />} />

                  <Route path="/dashboard" element={<GlobalLayout />}>
                    <Route index element={<DashboardIndex />} />
                    <Route path="calendar" element={<CalendarRouter />} />
                    <Route path="guests">
                      <Route index element={<GuestManagementPage />} />
                      <Route path="add" element={<GuestManagementPage />} />
                      <Route path="list" element={<GuestManagementPage />} />
                      <Route path="delivery" element={<DeliveryPage />} />
                      <Route path="report/:id" element={<MonthlyReportPage />} />
                      {/* Educatore che visualizza/modifica il calendario di un ospite */}
                      <Route path="calendar/:guestId" element={<GuestCalendarPage />} />
                    </Route>
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="profile/:userId" element={<ProfilePage />} />
                    <Route path="autonomy" element={<AutonomyPage />} />
                    <Route path="board" element={<div>Bacheca Placeholder (Fase 6)</div>} />
                  </Route>

                  <Route path="/reports/:facilityId" element={<GlobalLayout />}>
                    <Route index element={<FacilityReportsPage />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
              <Toaster />
            </DeliveryProvider>
          </GuestRequestProvider>
        </GuestCalendarProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
