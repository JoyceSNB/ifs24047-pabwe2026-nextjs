import { describe, it, expect } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import Link from "next/link";
import { useRouter, usePathname, useParams } from "next/navigation";
import { createMockStore, renderWithProviders, navigation } from "./test-utils";
import { useAppDispatch, useAppSelector } from "./hooks/redux";
import { setIsAuthLoginActionCreator } from "./features/auth/states/action";

function Probe() {
  const dispatch = useAppDispatch();
  const isAuthLogin = useAppSelector((state) => state.isAuthLogin);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  return (
    <div>
      <p data-testid="login">{String(isAuthLogin)}</p>
      <p data-testid="pathname">{pathname}</p>
      <p data-testid="params">{JSON.stringify(params)}</p>
      <button type="button" onClick={() => dispatch(setIsAuthLoginActionCreator(true))}>
        masuk
      </button>
      <button type="button" onClick={() => router.push("/auth/login")}>
        pindah
      </button>
      <Link href="/profile">Profil</Link>
    </div>
  );
}

describe("test-utils", () => {
  it("should render with a fresh store by default", () => {
    const { store } = renderWithProviders(<Probe />);

    expect(screen.getByTestId("login")).toHaveTextContent("false");
    expect(store.getState().isAuthLogin).toBe(false);
  });

  it("should render with a preloaded state", () => {
    renderWithProviders(<Probe />, { preloadedState: { isAuthLogin: true } });

    expect(screen.getByTestId("login")).toHaveTextContent("true");
  });

  it("should render with a store given by the caller", () => {
    const store = createMockStore({ isAuthLogin: true });

    const result = renderWithProviders(<Probe />, { store });

    expect(result.store).toBe(store);
    expect(screen.getByTestId("login")).toHaveTextContent("true");
  });

  it("should create a mock store without arguments", () => {
    expect(createMockStore().getState().isAuthLogin).toBe(false);
  });

  it("should update the view when an action is dispatched", () => {
    renderWithProviders(<Probe />);

    fireEvent.click(screen.getByText("masuk"));

    expect(screen.getByTestId("login")).toHaveTextContent("true");
  });

  it("should mock Next.js navigation and expose it for assertions", () => {
    navigation.state.pathname = "/users";
    navigation.state.params = { postId: "3" };

    renderWithProviders(<Probe />);
    fireEvent.click(screen.getByText("pindah"));

    expect(screen.getByTestId("pathname")).toHaveTextContent("/users");
    expect(screen.getByTestId("params")).toHaveTextContent('{"postId":"3"}');
    expect(navigation.router.push).toHaveBeenCalledWith("/auth/login");
  });

  it("should reset the navigation mock before every test", () => {
    renderWithProviders(<Probe />);

    expect(navigation.router.push).not.toHaveBeenCalled();
    expect(screen.getByTestId("pathname")).toHaveTextContent("/");
  });

  it("should render next/link as a plain anchor", () => {
    renderWithProviders(<Probe />);

    expect(screen.getByRole("link", { name: "Profil" })).toHaveAttribute("href", "/profile");
  });
});