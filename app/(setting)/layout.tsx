import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setting",
  description: "Connecting Setting",
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="">
      {children}
    </div>
  );
}
