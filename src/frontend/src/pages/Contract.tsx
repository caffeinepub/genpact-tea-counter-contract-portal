import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle, Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAcceptContract } from "../hooks/useQueries";
import { getAuthState } from "../utils/auth";
import { generateContractPDF } from "../utils/pdf";

const sections = [
  {
    num: "1",
    title: "Preamble / Background",
    content:
      'Genpact Limited (hereinafter referred to as "the Company") invites tenders from eligible and experienced vendors for the operation of Tea & Beverage Counter services at its DLF Cyber City campus, Gurugram, Haryana. This contract is administered by the Third Party Tender Authority (TPTA) appointed by Genpact\'s Facilities Management division. The purpose of this arrangement is to provide hygienic, timely, and quality beverage services to Genpact employees during operational hours.',
  },
  {
    num: "2",
    title: "Scope of Work",
    content:
      "The selected vendor shall be responsible for:\n- Daily provision of hot tea, coffee, green tea, and other requested beverages to staff across designated floors.\n- Operation and maintenance of tea/coffee vending machines and manual counters.\n- Procurement of high-quality, FSSAI-compliant raw materials (tea leaves, milk, sugar, coffee powder).\n- Staffing of the counter with a minimum of 2 trained personnel per shift.\n- Maintaining hygiene and cleanliness standards as per FSSAI norms at all times.\n- Serving during morning (8:00 AM \u2013 10:00 AM), afternoon (1:00 PM \u2013 2:00 PM), and evening (4:00 PM \u2013 5:00 PM) slots.",
  },
  {
    num: "3",
    title: "Contract Duration",
    content:
      "This contract shall be valid for a period of twelve (12) months commencing from the date of award letter. The contract may be renewed for an additional term of 12 months at the Company's discretion, subject to satisfactory performance review and mutual agreement on commercial terms. The Company reserves the right to terminate this contract with 30 days' written notice.",
  },
  {
    num: "4",
    title: "Eligibility Criteria",
    content:
      "To qualify for this tender, bidders must meet the following criteria:\n- Valid FSSAI License (Central or State) with a minimum validity of 1 year from bid submission date.\n- GST Registration Certificate.\n- Minimum 2 years of experience in canteen/catering/beverage services for corporate clients.\n- Proof of at least 1 operational outlet or corporate catering reference.\n- PAN Card and Aadhaar for proprietor/authorized signatory.",
  },
  {
    num: "5",
    title: "Bid Evaluation Criteria",
    content:
      "Bids will be evaluated on the following basis:\n- Financial Bid (70%): The quoted monthly service charge submitted through this portal.\n- Technical Evaluation (30%): Experience, number of operational outlets, FSSAI compliance, and proposed service staffing plan.\nThe Company reserves the right to negotiate with the L1 (lowest qualifying) bidder or select the most suitable bid based on overall merit.",
  },
  {
    num: "6",
    title: "Payment Terms",
    content:
      "Payment shall be processed on a monthly basis within 15 working days of receipt of a valid GST invoice from the vendor. The invoice must be submitted by the 5th of each month for services rendered in the previous month. Payments shall be made via bank transfer (NEFT/RTGS) to the vendor's registered bank account.",
  },
  {
    num: "7",
    title: "Performance Standards",
    content:
      "The vendor must maintain the following standards:\n- Minimum 98% on-time service delivery across all shifts.\n- Zero FSSAI violations or food safety complaints.\n- Customer satisfaction score of 4.0/5.0 or above based on quarterly employee feedback surveys.\n- All staff must have valid food handling training certificates.",
  },
  {
    num: "8",
    title: "Penalties and Termination",
    content:
      "The following penalty structure shall apply:\n- Absence without prior notice: \u20b92,000 per occurrence.\n- FSSAI violation or food quality complaint: \u20b95,000 per incident.\n- Service delay beyond 15 minutes: \u20b9500 per delayed shift.\n- Three consecutive unsatisfactory performance reviews may result in contract termination without further notice.",
  },
  {
    num: "9",
    title: "Legal Jurisdiction",
    content:
      "This contract shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with this contract shall be subject to the exclusive jurisdiction of the courts in Gurugram, Haryana. Both parties agree to attempt good-faith resolution before initiating formal legal proceedings. Arbitration under the Arbitration and Conciliation Act, 1996 shall be the preferred mode of dispute resolution.",
  },
];

export default function Contract() {
  const navigate = useNavigate();
  const auth = getAuthState();
  const acceptContract = useAcceptContract();
  const [accepting, setAccepting] = useState(false);

  const handleAccept = async () => {
    if (!auth) {
      navigate({ to: "/login" });
      return;
    }
    setAccepting(true);
    try {
      await acceptContract.mutateAsync(auth.userId);
      toast.success("Contract accepted! You may now place your bid.");
      navigate({ to: "/bidder-dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Failed to accept contract");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 bg-navy-900 text-white rounded-2xl p-8">
          <p className="text-xs uppercase tracking-widest text-blue-300 mb-2">
            Third Party Tender Authority
          </p>
          <h1 className="text-2xl font-extrabold mb-1">
            Genpact Tea Counter Contract
          </h1>
          <p className="text-blue-200 text-sm">
            DLF Cyber City Campus, Gurugram | Contract Period: 1 Year from Award
          </p>
        </div>

        <div className="space-y-6 mb-8">
          {sections.map((sec) => (
            <div
              key={sec.num}
              className="bg-white rounded-xl border border-border shadow-card p-6"
            >
              <h2 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-navy-900 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {sec.num}
                </span>
                {sec.title}
              </h2>
              <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                {sec.content}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-border shadow-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-navy-900">Ready to proceed?</p>
            <p className="text-sm text-muted-foreground">
              Download the contract or accept it to place your bid.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => generateContractPDF(sections)}
              className="border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white"
              data-ocid="contract.download.button"
            >
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
            {auth && auth.role !== "admin" && (
              <Button
                onClick={handleAccept}
                disabled={accepting}
                className="bg-navy-900 hover:bg-navy-800 text-white"
                data-ocid="contract.accept.primary_button"
              >
                {accepting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Accept & Continue to Bid
                  </>
                )}
              </Button>
            )}
            {!auth && (
              <Button
                onClick={() => navigate({ to: "/login" })}
                className="bg-navy-900 hover:bg-navy-800 text-white"
                data-ocid="contract.login.primary_button"
              >
                Login to Accept
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
