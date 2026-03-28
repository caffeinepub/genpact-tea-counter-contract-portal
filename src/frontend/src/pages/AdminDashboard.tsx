import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowUpDown,
  BarChart2,
  Download,
  IndianRupee,
  Loader2,
  Trophy,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend";
import {
  useAdminGetAllBidders,
  useAdminGetAllBids,
  useAdminLockBidding,
  useAdminSelectWinner,
  useGetStats,
} from "../hooks/useQueries";
import { getAuthState } from "../utils/auth";
import { formatDate, formatINR } from "../utils/formatters";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const auth = getAuthState();

  useEffect(() => {
    if (!auth) navigate({ to: "/login" });
    else if (auth.role !== "admin") navigate({ to: "/bidder-dashboard" });
  }, [auth, navigate]);

  const adminId = auth?.userId ?? null;
  const { data: stats } = useGetStats();
  const { data: bidders = [], isLoading: biddersLoading } =
    useAdminGetAllBidders(adminId);
  const { data: bids = [], isLoading: bidsLoading } =
    useAdminGetAllBids(adminId);
  const selectWinner = useAdminSelectWinner();
  const lockBidding = useAdminLockBidding();

  const [locked, setLocked] = useState(false);
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedBidder, setSelectedBidder] = useState<UserProfile | null>(
    null,
  );

  const handleLockToggle = async (val: boolean) => {
    if (!adminId) return;
    try {
      await lockBidding.mutateAsync({ adminId, lock: val });
      setLocked(val);
      toast.success(val ? "Bidding locked" : "Bidding unlocked");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSelectWinner = async (bidId: string) => {
    if (!adminId) return;
    try {
      await selectWinner.mutateAsync({ adminId, bidId });
      toast.success("Winner selected!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const sortedBids = [...bids].sort((a, b) => {
    const diff = Number(a.amount) - Number(b.amount);
    return sortAsc ? diff : -diff;
  });

  const getBidderName = (bidderId: string) => {
    const b = bidders.find((u) => u.id === bidderId);
    return b?.name || bidderId;
  };

  const getBidderCompany = (bidderId: string) => {
    const b = bidders.find((u) => u.id === bidderId);
    return b?.companyName || "\u2014";
  };

  const downloadCSV = () => {
    const header = [
      "Bid ID",
      "Bidder Name",
      "Company",
      "Email",
      "Phone",
      "Bid Amount (INR)",
      "Submitted At",
      "Winner",
    ];
    const rows = sortedBids.map((bid) => {
      const bidder = bidders.find((u) => u.id === bid.bidderId);
      return [
        bid.id,
        bidder?.name || bid.bidderId,
        bidder?.companyName || "",
        bidder?.email || "",
        bidder?.phone || "",
        Number(bid.amount).toString(),
        formatDate(bid.submittedAt),
        bid.isWinner ? "Yes" : "No",
      ];
    });
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${c}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `genpact-bids-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-navy-900">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Genpact Tea Counter Tender \u2013 Administration Panel
            </p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-white border border-border rounded-lg px-4 py-2 shadow-xs">
              <Label
                htmlFor="lock-switch"
                className="text-sm font-medium text-navy-900 cursor-pointer"
              >
                {locked ? "Bidding Locked" : "Bidding Open"}
              </Label>
              <Switch
                id="lock-switch"
                checked={locked}
                onCheckedChange={handleLockToggle}
                data-ocid="admin.lock_bidding.switch"
              />
            </div>
            <Button
              variant="outline"
              onClick={downloadCSV}
              className="border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white"
              data-ocid="admin.download_csv.button"
            >
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-cobalt-600" />
                <p className="text-xs text-muted-foreground uppercase">
                  Total Bidders
                </p>
              </div>
              <p className="text-2xl font-bold text-navy-900">
                {bidders.length}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart2 className="h-4 w-4 text-cobalt-600" />
                <p className="text-xs text-muted-foreground uppercase">
                  Total Bids
                </p>
              </div>
              <p className="text-2xl font-bold text-navy-900">
                {stats ? Number(stats.totalBids) : bids.length}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <IndianRupee className="h-4 w-4 text-cobalt-600" />
                <p className="text-xs text-muted-foreground uppercase">
                  Highest Bid
                </p>
              </div>
              <p className="text-xl font-bold text-cobalt-600">
                {stats && stats.highestBid > 0n
                  ? formatINR(stats.highestBid)
                  : "\u2014"}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart2 className="h-4 w-4 text-cobalt-600" />
                <p className="text-xs text-muted-foreground uppercase">
                  Average Bid
                </p>
              </div>
              <p className="text-xl font-bold text-navy-900">
                {stats && stats.averageBid > 0n
                  ? formatINR(stats.averageBid)
                  : "\u2014"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bidders" data-ocid="admin.tabs.tab">
          <TabsList className="mb-6">
            <TabsTrigger value="bidders" data-ocid="admin.bidders.tab">
              All Bidders ({bidders.length})
            </TabsTrigger>
            <TabsTrigger value="bids" data-ocid="admin.bids.tab">
              All Bids ({bids.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bidders">
            {biddersLoading ? (
              <div
                className="flex justify-center py-12"
                data-ocid="admin.bidders.loading_state"
              >
                <Loader2 className="h-8 w-8 animate-spin text-cobalt-600" />
              </div>
            ) : bidders.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="admin.bidders.empty_state"
              >
                No bidders registered yet.
              </div>
            ) : (
              <div
                className="bg-white rounded-xl border border-border shadow-card overflow-hidden"
                data-ocid="admin.bidders.table"
              >
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Contract</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bidders.map((bidder, idx) => (
                      <TableRow
                        key={bidder.id}
                        data-ocid={`admin.bidder.item.${idx + 1}`}
                      >
                        <TableCell className="font-medium">
                          {bidder.name}
                        </TableCell>
                        <TableCell>{bidder.email}</TableCell>
                        <TableCell>{bidder.phone}</TableCell>
                        <TableCell>{bidder.companyName}</TableCell>
                        <TableCell>
                          {bidder.contractAccepted ? (
                            <Badge className="bg-green-100 text-green-800">
                              Accepted
                            </Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedBidder(bidder)}
                            data-ocid="admin.view_bidder.button"
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bids">
            <div className="flex justify-end mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortAsc(!sortAsc)}
                className="border-navy-900 text-navy-900"
                data-ocid="admin.sort_bids.button"
              >
                <ArrowUpDown className="mr-2 h-4 w-4" /> Sort by Amount (
                {sortAsc ? "Low\u2192High" : "High\u2192Low"})
              </Button>
            </div>
            {bidsLoading ? (
              <div
                className="flex justify-center py-12"
                data-ocid="admin.bids.loading_state"
              >
                <Loader2 className="h-8 w-8 animate-spin text-cobalt-600" />
              </div>
            ) : sortedBids.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="admin.bids.empty_state"
              >
                No bids submitted yet.
              </div>
            ) : (
              <div
                className="bg-white rounded-xl border border-border shadow-card overflow-hidden"
                data-ocid="admin.bids.table"
              >
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Bidder Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Bid Amount</TableHead>
                      <TableHead>Submitted At</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedBids.map((bid, idx) => (
                      <TableRow
                        key={bid.id}
                        data-ocid={`admin.bid.item.${idx + 1}`}
                      >
                        <TableCell className="font-medium">
                          {getBidderName(bid.bidderId)}
                        </TableCell>
                        <TableCell>{getBidderCompany(bid.bidderId)}</TableCell>
                        <TableCell className="font-bold text-cobalt-600">
                          {formatINR(bid.amount)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(bid.submittedAt)}
                        </TableCell>
                        <TableCell>
                          {bid.isWinner ? (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Trophy className="h-3 w-3 mr-1" />
                              Winner
                            </Badge>
                          ) : (
                            <Badge variant="outline">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {!bid.isWinner && (
                            <Button
                              size="sm"
                              className="bg-navy-900 hover:bg-navy-800 text-white"
                              onClick={() => handleSelectWinner(bid.id)}
                              disabled={selectWinner.isPending}
                              data-ocid="admin.select_winner.button"
                            >
                              <Trophy className="mr-1 h-3 w-3" /> Select Winner
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={!!selectedBidder}
        onOpenChange={() => setSelectedBidder(null)}
      >
        <DialogContent
          className="max-w-lg"
          data-ocid="admin.bidder_details.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-navy-900">Bidder Details</DialogTitle>
          </DialogHeader>
          {selectedBidder && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: "Full Name", val: selectedBidder.name },
                { label: "Company", val: selectedBidder.companyName },
                { label: "Email", val: selectedBidder.email },
                { label: "Phone", val: selectedBidder.phone },
                { label: "Date of Birth", val: selectedBidder.dob },
                { label: "PAN", val: selectedBidder.pan },
                { label: "Aadhaar", val: selectedBidder.aadhaar },
                { label: "GST", val: selectedBidder.gst },
                {
                  label: "Experience",
                  val: `${selectedBidder.experience} years`,
                },
                { label: "Outlets", val: selectedBidder.outlets },
                {
                  label: "Contract",
                  val: selectedBidder.contractAccepted ? "Accepted" : "Pending",
                },
              ].map((row) => (
                <div key={row.label} className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">{row.label}</p>
                  <p className="font-semibold text-navy-900 truncate">
                    {row.val || "\u2014"}
                  </p>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end mt-2">
            <Button
              variant="outline"
              onClick={() => setSelectedBidder(null)}
              data-ocid="admin.close_dialog.close_button"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
