import { Link } from "@tanstack/react-router";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer className="bg-navy-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">
              TPTA Contact Information
            </h3>
            <div className="space-y-2 text-sm text-blue-100">
              <p>Third Party Tender Authority (TPTA)</p>
              <p>Genpact Campus, Sector 18, DLF Cyber City</p>
              <p>Gurugram, Haryana 122002</p>
              <p className="mt-3">📧 tenders@tpta-genpact.org</p>
              <p>📞 +91-124-458-9000</p>
              <p>🕐 Mon–Fri: 9:00 AM – 5:30 PM IST</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Useful Links</h3>
            <ul className="space-y-2 text-sm text-blue-100">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="hover:text-white transition-colors"
                >
                  Bidder Registration
                </Link>
              </li>
              <li>
                <Link
                  to="/contract"
                  className="hover:text-white transition-colors"
                >
                  Contract Document
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contract"
                  className="hover:text-white transition-colors"
                >
                  Tender Guidelines
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-navy-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-blue-200">
          <p>
            © {year} Genpact Tea Counter Contract Portal. All rights reserved.
          </p>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
