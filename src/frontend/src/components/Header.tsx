import { Button } from "@/components/ui/button";
import { Link, useRouterState } from "@tanstack/react-router";
import { useRouter } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { clearAuthState, getAuthState, isAdmin } from "../utils/auth";

export default function Header() {
  const routerState = useRouterState();
  const router = useRouter();
  const auth = getAuthState();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAuthState();
    router.navigate({ to: "/" });
    setMenuOpen(false);
  };

  const pathname = routerState.location.pathname;
  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Contract", path: "/contract" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-navy-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <title>Genpact Tender Portal</title>
                <rect
                  x="3"
                  y="3"
                  width="8"
                  height="8"
                  rx="1"
                  fill="white"
                  opacity="0.9"
                />
                <rect
                  x="13"
                  y="3"
                  width="8"
                  height="8"
                  rx="1"
                  fill="white"
                  opacity="0.6"
                />
                <rect
                  x="3"
                  y="13"
                  width="8"
                  height="8"
                  rx="1"
                  fill="white"
                  opacity="0.6"
                />
                <rect
                  x="13"
                  y="13"
                  width="8"
                  height="8"
                  rx="1"
                  fill="white"
                  opacity="0.3"
                />
              </svg>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium text-cobalt-600 uppercase tracking-wider leading-tight">
                Organized by Third Party Tender Authority
              </p>
              <p className="text-sm font-bold text-navy-900 leading-tight">
                GENPACT TEA COUNTER TENDER
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-ocid={`nav.${link.label.toLowerCase()}.link`}
              >
                <Button
                  variant={isActive(link.path) ? "default" : "outline"}
                  size="sm"
                  className={`rounded-full px-5 font-medium ${
                    isActive(link.path)
                      ? "bg-navy-900 hover:bg-navy-800 text-white border-transparent"
                      : "border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white"
                  }`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            {auth ? (
              <>
                <Link
                  to={isAdmin() ? "/admin-dashboard" : "/bidder-dashboard"}
                  data-ocid="nav.dashboard.link"
                >
                  <Button
                    size="sm"
                    className="rounded-full px-5 bg-cobalt-600 hover:bg-cobalt-500 text-white font-medium"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLogout}
                  className="rounded-full px-5 border-red-300 text-red-600 hover:bg-red-50"
                  data-ocid="nav.logout.button"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/register" data-ocid="nav.register.link">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full px-5 border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white"
                  >
                    Register
                  </Button>
                </Link>
                <Link to="/login" data-ocid="nav.login.link">
                  <Button
                    size="sm"
                    className="rounded-full px-5 bg-navy-900 hover:bg-navy-800 text-white"
                  >
                    Login
                  </Button>
                </Link>
              </>
            )}
          </nav>

          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-border px-4 py-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
            >
              <Button
                variant={isActive(link.path) ? "default" : "ghost"}
                className="w-full justify-start"
              >
                {link.label}
              </Button>
            </Link>
          ))}
          {auth ? (
            <>
              <Link
                to={isAdmin() ? "/admin-dashboard" : "/bidder-dashboard"}
                onClick={() => setMenuOpen(false)}
              >
                <Button className="w-full bg-cobalt-600 text-white">
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-red-600"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/register" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Register
                </Button>
              </Link>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                <Button className="w-full bg-navy-900 text-white">Login</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
