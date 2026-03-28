import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { hashPassword, setAuthState } from "../utils/auth";

export default function Login() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.match(/^[^@]+@[^@]+\.[^@]+$/))
      newErrors.email = "Valid email required";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!actor) {
      toast.error("Not connected. Please wait.");
      return;
    }
    setLoading(true);
    try {
      const passwordHash = await hashPassword(password);
      const res = await actor.login(email, passwordHash);
      if (res.__kind__ === "err") throw new Error(res.err);
      const userId = res.ok;
      const profileRes = await actor.getMyProfile(userId);
      if (profileRes.__kind__ === "err")
        throw new Error("Could not load profile");
      const profile = profileRes.ok;
      setAuthState({ userId, role: profile.role });
      toast.success(`Welcome back, ${profile.name}!`);
      if (profile.role === "admin") {
        navigate({ to: "/admin-dashboard" });
      } else {
        navigate({ to: "/bidder-dashboard" });
      }
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-navy-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900">Login</h1>
          <p className="text-muted-foreground mt-2">
            Access your Genpact Tender Portal account
          </p>
        </div>

        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-navy-900 text-xl">
              Sign in to continue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-navy-900"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  className={`mt-1 ${errors.email ? "border-red-400" : ""}`}
                  data-ocid="login.email.input"
                  autoComplete="email"
                />
                {errors.email && (
                  <p
                    className="text-xs text-red-500 mt-1"
                    data-ocid="login.email_error"
                  >
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-navy-900"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  className={`mt-1 ${errors.password ? "border-red-400" : ""}`}
                  data-ocid="login.password.input"
                  autoComplete="current-password"
                />
                {errors.password && (
                  <p
                    className="text-xs text-red-500 mt-1"
                    data-ocid="login.password_error"
                  >
                    {errors.password}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-navy-900 hover:bg-navy-800 text-white h-11 font-semibold mt-2"
                data-ocid="login.submit_button"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-cobalt-600 font-medium hover:underline"
              >
                Register here
              </Link>
            </p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-muted-foreground font-medium mb-1">
                Admin Access:
              </p>
              <p className="text-xs text-muted-foreground">
                Email: admin@genpact.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
