import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  Bell,
  CheckCircle,
  Clock,
  FileText,
  Shield,
  Upload,
  Users,
} from "lucide-react";
import CountdownTimer from "../components/CountdownTimer";
import { useGetStats } from "../hooks/useQueries";
import { formatINR } from "../utils/formatters";

const milestones = [
  { icon: Bell, label: "Tender Published", date: "March 1, 2026" },
  { icon: Users, label: "Registration Deadline", date: "April 5, 2026" },
  { icon: FileText, label: "Bid Submission Deadline", date: "April 10, 2026" },
  { icon: Award, label: "Winner Announcement", date: "April 20, 2026" },
];

const steps = [
  {
    icon: FileText,
    title: "Read the Contract",
    desc: "Review all terms, scope of work, and eligibility criteria on the Contract page.",
  },
  {
    icon: CheckCircle,
    title: "Register & Verify",
    desc: "Create your bidder account with all required documents including PAN, FSSAI certificate.",
  },
  {
    icon: Upload,
    title: "Accept & Bid",
    desc: "Accept the contract digitally, then submit your competitive bid amount in INR.",
  },
  {
    icon: Award,
    title: "Await Selection",
    desc: "Admin evaluates bids and announces the winning bidder before April 20, 2026.",
  },
];

const announcements = [
  {
    date: "March 15, 2026",
    title: "Tender Portal Now Open for Registration",
    snippet:
      "Eligible vendors may now register and submit documents via the online portal. Ensure FSSAI certificate is valid.",
  },
  {
    date: "March 10, 2026",
    title: "Mandatory Pre-Bid Meeting Scheduled",
    snippet:
      "A pre-bid meeting will be held on March 25, 2026 at Genpact Gurugram Campus. Attendance is strongly recommended.",
  },
  {
    date: "March 1, 2026",
    title: "Genpact Tea Counter Contract \u2013 NIT Released",
    snippet:
      "Notice Inviting Tender for the operation of tea & beverage counter at Genpact's DLF Cyber City campus has been officially released.",
  },
];

export default function Home() {
  const { data: stats } = useGetStats();

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-navy-900 to-navy-700 py-3 px-4 text-center">
        <p className="text-white font-bold tracking-widest text-xs sm:text-sm uppercase">
          WELCOME TO GENPACT TENDER PORTAL | SECURE YOUR CONTRACT NOW
        </p>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <Badge className="bg-cobalt-600 text-white mb-4">
              Open for Bidding
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-navy-900 leading-tight mb-4">
              Bidding Portal for
              <br />
              <span className="text-cobalt-600">Genpact Tea Counter</span>{" "}
              Contract
            </h1>
            <p className="text-muted-foreground text-base md:text-lg mb-6 leading-relaxed">
              Submit your competitive bid for the Genpact DLF Cyber City campus
              tea & beverage counter operations contract. Deadline: April 10,
              2026.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register">
                <Button
                  className="bg-navy-900 hover:bg-navy-800 text-white rounded-full px-6 py-2 font-semibold"
                  data-ocid="home.register.primary_button"
                >
                  Register Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contract">
                <Button
                  variant="outline"
                  className="rounded-full px-6 border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white"
                  data-ocid="home.contract.secondary_button"
                >
                  View Contract
                </Button>
              </Link>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-card border border-border">
            <img
              src="/assets/generated/tea-counter-hero.dim_800x500.jpg"
              alt="Tea counter service"
              className="w-full h-64 md:h-80 object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-white border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-card border-border">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Active Tenders
                </p>
                <p className="text-3xl font-bold text-navy-900">1</p>
              </CardContent>
            </Card>
            <Card className="shadow-card border-border">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Total Bids Received
                </p>
                <p className="text-3xl font-bold text-navy-900">
                  {stats ? Number(stats.totalBids) : "\u2014"}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-card border-border">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Highest Bid
                </p>
                <p className="text-2xl font-bold text-cobalt-600">
                  {stats && stats.highestBid > 0n
                    ? formatINR(stats.highestBid)
                    : "\u2014"}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-card border-border">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Time Remaining
                </p>
                <CountdownTimer compact />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-extrabold text-navy-900 mb-6">
          Upcoming Tender Milestones
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {milestones.map((m) => (
            <Card
              key={m.label}
              className="shadow-card border-border hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <m.icon className="h-5 w-5 text-cobalt-600" />
                </div>
                <p className="text-sm font-semibold text-navy-900">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.date}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-navy-900 mb-6">
            How to Bid
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="bg-white rounded-xl p-5 shadow-card border border-border"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-full bg-navy-900 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <step.icon className="h-5 w-5 text-cobalt-600" />
                </div>
                <h3 className="font-bold text-navy-900 mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-extrabold text-navy-900 mb-6">
          Latest Announcements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {announcements.map((a) => (
            <Card
              key={a.title}
              className="shadow-card border-border hover:shadow-md transition-shadow"
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-cobalt-600" />
                  <span className="text-xs text-muted-foreground">
                    {a.date}
                  </span>
                </div>
                <h3 className="font-bold text-navy-900 mb-2 leading-snug">
                  {a.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {a.snippet}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-navy-900 to-cobalt-600 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-extrabold text-white">
              Ready to Submit Your Bid?
            </h2>
            <p className="text-blue-200 mt-1">
              Register today and secure your opportunity to operate the Genpact
              tea counter.
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/register">
              <Button
                className="bg-white text-navy-900 hover:bg-blue-50 rounded-full px-6 font-semibold"
                data-ocid="home.cta.primary_button"
              >
                <Shield className="mr-2 h-4 w-4" /> Register Now
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10 rounded-full px-6"
                data-ocid="home.cta.secondary_button"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
