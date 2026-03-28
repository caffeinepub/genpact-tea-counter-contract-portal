import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import Footer from "./components/Footer";
import Header from "./components/Header";
import AdminDashboard from "./pages/AdminDashboard";
import BidderDashboard from "./pages/BidderDashboard";
import Contact from "./pages/Contact";
import Contract from "./pages/Contract";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { getAuthState, isAdmin } from "./utils/auth";

const rootRoute = createRootRoute({
  component: () => (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster richColors position="top-right" />
    </div>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  beforeLoad: () => {
    const auth = getAuthState();
    if (auth)
      throw redirect({
        to: isAdmin() ? "/admin-dashboard" : "/bidder-dashboard",
      });
  },
  component: Register,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  beforeLoad: () => {
    const auth = getAuthState();
    if (auth)
      throw redirect({
        to: isAdmin() ? "/admin-dashboard" : "/bidder-dashboard",
      });
  },
  component: Login,
});

const bidderDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bidder-dashboard",
  beforeLoad: () => {
    const auth = getAuthState();
    if (!auth) throw redirect({ to: "/login" });
    if (auth.role === "admin") throw redirect({ to: "/admin-dashboard" });
  },
  component: BidderDashboard,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-dashboard",
  beforeLoad: () => {
    const auth = getAuthState();
    if (!auth) throw redirect({ to: "/login" });
    if (auth.role !== "admin") throw redirect({ to: "/bidder-dashboard" });
  },
  component: AdminDashboard,
});

const contractRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contract",
  component: Contract,
});
const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: Contact,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  registerRoute,
  loginRoute,
  bidderDashboardRoute,
  adminDashboardRoute,
  contractRoute,
  contactRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
