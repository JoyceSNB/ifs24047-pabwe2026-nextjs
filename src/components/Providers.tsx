"use client";

import type { ReactNode } from "react";
import { Provider } from "react-redux";
import store from "@/store";

// Pembungkus Client Component: menyediakan Redux store ke seluruh aplikasi.
function Providers({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}

export default Providers;