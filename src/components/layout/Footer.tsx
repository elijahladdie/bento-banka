"use client";

import { Landmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { AUTH_ROUTES } from "@/constants/routes";
import { useUiText } from "@/lib/ui-text";

const Footer = () => {
  const router = useRouter();
  const { t } = useUiText();

  return (
    <footer className="py-16 px-4 border-t border-border">
      <div className="container mx-auto">

        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">

          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Landmark className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">BANKA</span>
            </div>

            <p className="text-sm text-muted-foreground max-w-sm">
              {t("landing.footerLine")}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 md:items-center">
            <button
              onClick={() => router.push(AUTH_ROUTES.login)}
              className="px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition"
            >
              {t("landing.signIn")}
            </button>

            <button
              onClick={() => router.push(AUTH_ROUTES.signup)}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              {t("landing.openAccount")}
            </button>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            {t("landing.copyright")}
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;