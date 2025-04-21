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
    <div className="flex flex-row justify-center items-center h-full">
      {children}
    </div>
  );
}
