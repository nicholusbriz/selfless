import {
  MessageCircle,
  Share2,
  Mail,
  Phone,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background/90">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <img
              src="/freedom.png"
              className="h-16 w-16 rounded-xl"
              alt="Selfless CE Logo"
            />

            <h3 className="mt-4 text-xl font-bold text-foreground">
              Selfless Student Portal
            </h3>

            <p className="mt-3 leading-7 text-muted-foreground text-sm">
              The official student platform supporting academic success,
              collaboration, and student engagement across the Selfless
              Tech Center Network.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground text-sm">
              Quick Links
            </h4>

            <div className="mt-4 space-y-3 text-muted-foreground">
              <button className="block hover:text-foreground text-left text-sm transition-colors">
                About
              </button>

              <button className="block hover:text-foreground text-left text-sm transition-colors">
                FAQ
              </button>

              <button className="block hover:text-foreground text-left text-sm transition-colors">
                Contact
              </button>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground text-sm">
              Legal
            </h4>

            <div className="mt-4 space-y-3 text-muted-foreground">
              <button className="block hover:text-foreground text-left text-sm transition-colors">
                Privacy
              </button>

              <button className="block hover:text-foreground text-left text-sm transition-colors">
                Terms
              </button>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold text-foreground text-sm">
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
        <div className="mt-14 border-t border-border pt-6 flex flex-col md:flex-row justify-between gap-3">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Selfless Student Self Service Portal.
          </p>

          <p className="text-muted-foreground text-sm">
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
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card/30 text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:text-primary hover:bg-primary/10"
    >
      {icon}
    </a>
  );
}