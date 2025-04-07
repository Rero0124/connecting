import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connecting",
  description: "Connecting",
};

export default function Layout({
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
