import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
	title: "BANKA",
	description: "Bank of Citizens",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<div className="bg-orb bg-orb-1" />
				<div className="bg-orb bg-orb-2" />
				<div className="bg-orb bg-orb-3" />
				<Providers>
					<main className="app-shell">{children}</main>
				</Providers>
			</body>
		</html>
	);
}
