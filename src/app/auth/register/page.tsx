import type { Metadata } from "next";
import RegisterPage from "@/features/auth/pages/RegisterPage";

export const metadata: Metadata = { title: "Daftar" };

export default function Page() {
  return <RegisterPage />;
}