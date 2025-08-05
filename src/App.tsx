import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import RoleProtectedRoute from "@/components/Auth/RoleProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Tickets from "./pages/Tickets";
import MyTickets from "./pages/MyTickets";
import NewTicket from "./pages/NewTicket";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Categories from "./pages/Categories";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import TicketDetails from "./pages/TicketDetails";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/tickets" element={
              <ProtectedRoute>
                <Tickets />
              </ProtectedRoute>
            } />
            <Route path="/tickets/:id" element={
              <ProtectedRoute>
                <TicketDetails />
              </ProtectedRoute>
            } />
            <Route path="/my-tickets" element={
              <ProtectedRoute>
                <MyTickets />
              </ProtectedRoute>
            } />
            <Route path="/tickets/waiting" element={
              <ProtectedRoute>
                <Tickets />
              </ProtectedRoute>
            } />
            <Route path="/tickets/closed" element={
              <ProtectedRoute>
                <Tickets />
              </ProtectedRoute>
            } />
            <Route path="/tickets/high-priority" element={
              <ProtectedRoute>
                <Tickets />
              </ProtectedRoute>
            } />
            <Route path="/new-ticket" element={
              <ProtectedRoute>
                <NewTicket />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['admin', 'owner']}>
                  <Users />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/categories" element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['admin', 'owner']}>
                  <Categories />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['admin', 'owner']}>
                  <Reports />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['admin', 'owner']}>
                  <Settings />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
    </Routes>
  </TooltipProvider>
);

export default App;
