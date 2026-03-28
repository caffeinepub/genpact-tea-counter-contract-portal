import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Loader2, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    toast.success(
      "Message sent! We will get back to you within 2 business days.",
    );
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-navy-900">Contact Us</h1>
          <p className="text-muted-foreground mt-2">
            Get in touch with the Third Party Tender Authority (TPTA)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="text-navy-900">TPTA Office</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-cobalt-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-navy-900">Address</p>
                    <p className="text-muted-foreground">
                      Third Party Tender Authority
                      <br />
                      Genpact Campus, Block A<br />
                      DLF Cyber City, Sector 24
                      <br />
                      Gurugram, Haryana 122002
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone className="h-5 w-5 text-cobalt-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-navy-900">Phone</p>
                    <p className="text-muted-foreground">
                      +91-124-458-9000
                      <br />
                      +91-124-458-9001 (Helpline)
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Mail className="h-5 w-5 text-cobalt-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-navy-900">Email</p>
                    <p className="text-muted-foreground">
                      tenders@tpta-genpact.org
                      <br />
                      helpdesk@tpta-genpact.org
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Clock className="h-5 w-5 text-cobalt-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-navy-900">Business Hours</p>
                    <p className="text-muted-foreground">
                      Monday \u2013 Friday: 9:00 AM \u2013 5:30 PM IST
                      <br />
                      Saturday: 9:00 AM \u2013 1:00 PM IST
                      <br />
                      Sunday & Holidays: Closed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card border-border overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-navy-900 to-cobalt-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <MapPin className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm font-semibold">
                    DLF Cyber City, Gurugram
                  </p>
                  <p className="text-xs text-blue-200">Haryana, India</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="text-navy-900">
                  Send us a Message
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  We typically respond within 2 business days.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="name"
                        className="text-sm font-medium text-navy-900"
                      >
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your full name"
                        value={form.name}
                        onChange={handleChange}
                        className="mt-1"
                        data-ocid="contact.name.input"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-navy-900"
                      >
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={handleChange}
                        className="mt-1"
                        data-ocid="contact.email.input"
                      />
                    </div>
                  </div>
                  <div>
                    <Label
                      htmlFor="subject"
                      className="text-sm font-medium text-navy-900"
                    >
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="e.g. Bid query, Technical issue"
                      value={form.subject}
                      onChange={handleChange}
                      className="mt-1"
                      data-ocid="contact.subject.input"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="message"
                      className="text-sm font-medium text-navy-900"
                    >
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Describe your query or concern..."
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      className="mt-1 resize-none"
                      data-ocid="contact.message.textarea"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-navy-900 hover:bg-navy-800 text-white h-11 font-semibold"
                    data-ocid="contact.submit_button"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
