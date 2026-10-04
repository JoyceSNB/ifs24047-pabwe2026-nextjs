import type { Metadata } from "next";
import HomePage from "@/features/posts/pages/HomePage";

export const metadata: Metadata = { title: "Postingan Saya" };

export default function Page() {
  return <HomePage scope="me" />;
}