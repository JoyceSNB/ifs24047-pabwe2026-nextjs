import type { Metadata } from "next";
import DetailPage from "@/features/posts/pages/DetailPage";

export const metadata: Metadata = { title: "Detail Postingan" };

export default function Page() {
  return <DetailPage />;
}