import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Clock,
  Download,
  FileText,
  IndianRupee,
  Loader2,
  Trophy,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CountdownTimer from "../components/CountdownTimer";
import { useGetMyBid, useGetMyProfile, usePlaceBid } from "../hooks/useQueries";
import { getAuthState } from "../utils/auth";
import { BID_DEADLINE, formatINR, getTimeRemaining } from "../utils/formatters";
import { generateBidReceipt } from "../utils/pdf";

export default function BidderDashboard() {
  const navigate = useNavigate();
  const auth = getAuthState();

  useEffect(() => {
    if (!auth) navigate({ to: "/login" });
    else if (auth.role === "admin") navigate({ to: "/admin-dashboard" });
  }, [auth, navigate]);

  const { data: profile, isLoading: profileLoading } = useGetMyProfile(
    auth?.userId ?? null,
  );
  const { data: myBid, isLoading: bidLoading } = useGetMyBid(
    auth?.userId ?? null,
  );
  const placeBid = usePlaceBid();

  const [bidAmount, setBidAmount] = useState("");
  const [bidSubmitted, setBidSubmitted] = useState(false);

  const deadline = getTimeRemaining(BID_DEADLINE);
  const isDeadlinePassed = deadline.expired;

  const handlePlaceBid = async () => {
    if (!auth) return;
    const amount = Number.parseInt(bidAmount.replace(/,/g, ""), 10);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid bid amount");
      return;
    }
    try {
      await placeBid.mutateAsync({
        userId: auth.userId,
        amount: BigInt(amount),
      });
      toast.success("Bid submitted successfully!");
      setBidSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to place bid");
    }
  };

  const downloadReceipt = () => {
    if (!profile || !myBid) return;
    generateBidReceipt(
      profile.name,
      profile.companyName,
      profile.email,
      profile.phone,
      formatINR(myBid.amount),
      new Date(Number(myBid.submittedAt) / 1_000_000).toLocaleString("en-IN"),
      myBid.id,
    );
  };

  if (profileLoading || bidLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-ocid="bidder.loading_state"
      >
        <Loader2 className="h-8 w-8 animate-spin text-cobalt-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-navy-900">
            Bidder Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back,{" "}
            <span className="font-semibold text-cobalt-600">
              {profile?.name || "Bidder"}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="shadow-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <IndianRupee className="h-4 w-4 text-cobalt-600" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  My Bid Amount
                </p>
              </div>
              <p className="text-2xl font-bold text-navy-900">
                {myBid ? formatINR(myBid.amount) : "Not submitted"}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4 text-cobalt-600" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Bid Status
                </p>
              </div>
              {myBid ? (
                myBid.isWinner ? (
                  <Badge className="bg-green-600 text-white">🏆 Winner</Badge>
                ) : (
                  <Badge className="bg-cobalt-600 text-white">Active</Badge>
                )
              ) : (
                <Badge variant="outline">Not Submitted</Badge>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-cobalt-600" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Time Remaining
                </p>
              </div>
              <CountdownTimer compact />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="text-navy-900">Profile Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                { label: "Name", val: profile?.name },
                { label: "Company", val: profile?.companyName },
                { label: "Email", val: profile?.email },
                { label: "Phone", val: profile?.phone },
                { label: "GST", val: profile?.gst },
                { label: "PAN", val: profile?.pan },
                {
                  label: "Experience",
                  val: profile?.experience
                    ? `${profile.experience} years`
                    : "\u2014",
                },
                { label: "Outlets", val: profile?.outlets },
              ].map((row) => (
                <div key={row.label} className="flex justify-between gap-2">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium text-navy-900 text-right truncate max-w-[140px]">
                    {row.val || "\u2014"}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="text-navy-900">Bid Submission</CardTitle>
              </CardHeader>
              <CardContent>
                {!profile?.contractAccepted ? (
                  <div
                    className="text-center py-6"
                    data-ocid="bidder.contract_required.panel"
                  >
                    <FileText className="h-10 w-10 text-cobalt-600 mx-auto mb-3" />
                    <p className="font-semibold text-navy-900 mb-2">
                      Contract Acceptance Required
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      You must read and accept the contract before placing a
                      bid.
                    </p>
                    <Link to="/contract">
                      <Button
                        className="bg-navy-900 hover:bg-navy-800 text-white"
                        data-ocid="bidder.view_contract.button"
                      >
                        View & Accept Contract
                      </Button>
                    </Link>
                  </div>
                ) : isDeadlinePassed ? (
                  <div
                    className="text-center py-6"
                    data-ocid="bidder.deadline_passed.panel"
                  >
                    <p className="text-red-600 font-semibold text-lg">
                      Bidding Deadline Has Passed
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      The deadline was April 10, 2026. No more bids can be
                      submitted.
                    </p>
                  </div>
                ) : (
                  <div>
                    {myBid && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm font-semibold text-navy-900">
                          Current Bid:{" "}
                          <span className="text-cobalt-600">
                            {formatINR(myBid.amount)}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          You can update your bid before the deadline.
                        </p>
                      </div>
                    )}
                    <div className="space-y-3">
                      <Label
                        htmlFor="bidAmount"
                        className="text-sm font-medium text-navy-900"
                      >
                        {myBid
                          ? "Update Bid Amount (\u20b9)"
                          : "Enter Bid Amount (\u20b9)"}
                      </Label>
                      <div className="flex gap-3">
                        <Input
                          id="bidAmount"
                          type="number"
                          min="1"
                          placeholder="e.g. 500000"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="flex-1"
                          data-ocid="bidder.bid_amount.input"
                        />
                        <Button
                          onClick={handlePlaceBid}
                          disabled={placeBid.isPending}
                          className="bg-navy-900 hover:bg-navy-800 text-white px-6"
                          data-ocid="bidder.submit_bid.primary_button"
                        >
                          {placeBid.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : myBid ? (
                            "Update Bid"
                          ) : (
                            "Submit Bid"
                          )}
                        </Button>
                      </div>
                      {bidAmount &&
                        !Number.isNaN(Number.parseInt(bidAmount)) && (
                          <p className="text-sm text-muted-foreground">
                            Formatted:{" "}
                            <strong className="text-navy-900">
                              {formatINR(Number.parseInt(bidAmount))}
                            </strong>
                          </p>
                        )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {(bidSubmitted || myBid) && (
              <Card
                className="shadow-card border-border"
                data-ocid="bidder.bid_success.panel"
              >
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-navy-900">
                      Bid Submitted Successfully
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Download your bid receipt for records.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={downloadReceipt}
                    className="border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white whitespace-nowrap"
                    data-ocid="bidder.download_receipt.button"
                  >
                    <Download className="mr-2 h-4 w-4" /> Receipt PDF
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="text-navy-900 text-base">
                  Bidding Deadline Countdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CountdownTimer />
                <p className="text-xs text-muted-foreground mt-3">
                  Deadline: April 10, 2026 at 11:59 PM IST
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
