import "../styles/globals.css";

export const metadata = {
  title: "التقويم التشخيصي — Test diagnostique",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
