import type { Metadata } from "next";
import HomePage from "@/features/posts/pages/HomePage";

export const metadata: Metadata = { title: "Linimasa" };

export default function Page() {
  return <HomePage />;
}