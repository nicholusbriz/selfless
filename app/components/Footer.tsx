import {
  MessageCircle,
  Mail,
  Phone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="border-t border-white/10 bg-[#0A0F18] bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(7, 16, 24, 0.12), rgba(10, 15, 24, 0.2)), url('/header-image.jpg')",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="relative h-16 w-16 rounded-xl overflow-hidden">
              <Image
                src="/freedom.png"
                alt="Selfless CE Logo"
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>

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
              <Link href="/" className="block text-sm transition-colors hover:text-white">
                Home
              </Link>
              <Link href="/about" className="block text-sm transition-colors hover:text-white">
                About
              </Link>
              <Link href="/tech-centers" className="block text-sm transition-colors hover:text-white">
                Tech Centers
              </Link>
              <Link href="/features" className="block text-sm transition-colors hover:text-white">
                Features
              </Link>
              <Link href="/help" className="block text-sm transition-colors hover:text-white">
                Help
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white text-sm">
              Legal
            </h4>

            <div className="mt-4 space-y-3 text-gray-400">
              <Link href="/privacy" className="block text-left text-sm transition-colors hover:text-white">
                Privacy
              </Link>

              <Link href="/terms" className="block text-left text-sm transition-colors hover:text-white">
                Terms
              </Link>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold text-white text-sm">
              Connect
            </h4>

            <div className="mt-4 flex gap-3">
              <Social icon={<MessageCircle size={18} />} href="https://wa.me/256761996296" />
              <Social icon={<Phone size={18} />} href="tel:+256761996296" />
              <Social icon={<Mail size={18} />} href="mailto:turyamurebanicholus@gmail.com" />
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
  href,
}: {
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition-all duration-300 hover:border-[#E8A33D]/40 hover:text-[#E8A33D] hover:bg-[#E8A33D]/10"
    >
      {icon}
    </a>
  );
}