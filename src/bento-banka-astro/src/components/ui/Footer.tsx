import { Landmark } from "lucide-react";

type Props = {
  translations: {
    footerLine: string;
    signIn: string;
    openAccount: string;
    copyright: string;
  };
};

const Footer = ({ translations }: Props) => {
  return (
    <footer className="py-16 px-4 border-t border-border">
      <div className="container mx-auto">

        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Landmark className="h-6 w-6 text-primary" />

              <span className="text-lg font-bold text-foreground">
                BANKA
              </span>
            </div>

            <p className="text-sm text-muted-foreground max-w-sm">
              {translations.footerLine}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:items-center">
            <button className="px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition">
              {translations.signIn}
            </button>

            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition">
              {translations.openAccount}
            </button>
          </div>

        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            {translations.copyright}
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;