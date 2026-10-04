import "@testing-library/jest-dom/vitest";
import { beforeEach, vi } from "vitest";

// Tiruan navigasi Next.js (App Router) untuk semua test.
// Test bisa mengubah nilainya lewat `navigation` (diekspor ulang oleh test-utils.tsx):
//   navigation.router.push        -> pemanggilan router.push(...)
//   navigation.state.pathname     -> nilai usePathname()
//   navigation.state.params       -> nilai useParams(), contoh { postId: "3" }
const navigation = vi.hoisted(() => ({
  router: {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  },
  state: {
    pathname: "/",
    params: {} as Record<string, string>,
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigation.router,
  usePathname: () => navigation.state.pathname,
  useParams: () => navigation.state.params,
}));

beforeEach(() => {
  Object.values(navigation.router).forEach((fn) => fn.mockClear());
  navigation.state.pathname = "/";
  navigation.state.params = {};
});

export { navigation };