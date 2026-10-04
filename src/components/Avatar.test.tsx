import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Avatar from "./Avatar";

describe("Avatar", () => {
  it("should render the photo with its name as alt text and fixed dimensions", () => {
    render(<Avatar name="Budi" photo="https://example.com/budi.png" size={48} />);

    const img = screen.getByAltText("Budi");
    expect(img).toHaveAttribute("src", "https://example.com/budi.png");
    expect(img).toHaveAttribute("width", "48");
    expect(img).toHaveAttribute("height", "48");
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("should resolve a relative photo path to the Delcom server", () => {
    render(<Avatar name="Budi" photo="default/img/user.png" />);

    expect(screen.getByAltText("Budi")).toHaveAttribute(
      "src",
      "https://open-api.delcom.org/default/img/user.png"
    );
  });

  it("should use a generic alt text when the user has no name", () => {
    render(<Avatar photo="https://example.com/x.png" />);

    expect(screen.getByAltText("Pengguna")).toBeInTheDocument();
  });

  it("should show the first letter of the name when there is no photo", () => {
    render(<Avatar name="budi" className="extra" />);

    const initial = screen.getByText("B");
    expect(initial).toHaveClass("extra");
    expect(initial).toHaveStyle({ width: "40px", height: "40px" });
  });

  it("should fall back to the letter U when there is no name and no photo", () => {
    render(<Avatar name="" photo={null} />);

    expect(screen.getByText("U")).toBeInTheDocument();
  });
});