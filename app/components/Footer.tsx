import {
  MessageCircle,
  Share2,
  Mail,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0A0F18]">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <img
              src="/freedom.png"
              className="h-16 w-16 rounded-xl"
              alt="Selfless CE Logo"
            />

            <h3 className="mt-4 text-xl font-bold text-white">
              Selfless Student Portal
            </h3>

            <p className="mt-3 leading-7 text-gray-400 text-sm">
              The official student platform supporting academic success,
              collaboration, and student engagement across the Selfless
              Tech Center Network.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white text-sm">
              Quick Links
            </h4>

            <div className="mt-4 space-y-3 text-gray-400">
              <button className="block hover:text-white text-left text-sm transition-colors">
                About
              </button>

              <button className="block hover:text-white text-left text-sm transition-colors">
                FAQ
              </button>

              <button className="block hover:text-white text-left text-sm transition-colors">
                Contact
              </button>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white text-sm">
              Legal
            </h4>

            <div className="mt-4 space-y-3 text-gray-400">
              <button className="block hover:text-white text-left text-sm transition-colors">
                Privacy
              </button>

              <button className="block hover:text-white text-left text-sm transition-colors">
                Terms
              </button>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold text-white text-sm">
              Connect
            </h4>

            <div className="mt-4 flex gap-3">
              <Social icon={<MessageCircle size={18} />} />
              <Social icon={<Share2 size={18} />} />
              <Social icon={<Mail size={18} />} />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between gap-3">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Selfless Student Self Service Portal.
          </p>

          <p className="text-gray-500 text-sm">
            Empowering Student Success Through Technology.
          </p>
        </div>
      </div>
    </footer>
  );
}

function Social({
  icon,
}: {
  icon: React.ReactNode;
}) {
  return (
    <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition-all duration-300 hover:border-[#E8A33D]/40 hover:text-[#E8A33D] hover:bg-[#E8A33D]/10">
      {icon}
    </button>
  );
}