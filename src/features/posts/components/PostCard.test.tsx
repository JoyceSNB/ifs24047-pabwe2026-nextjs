import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PostCard from "./PostCard";
import type { Post } from "@/types";

const basePost: Post = {
  id: 7,
  user_id: 1,
  cover: "https://example.com/cover.png",
  description: "Terus belajar apapun rintangannya!",
  created_at: "2024-10-05T03:07:11.000000Z",
  updated_at: "2024-10-05T03:07:11.000000Z",
  author: { name: "Delcom Testing", photo: null },
  likes: [2, 3],
  comments: [4],
};

function setup(props: Partial<React.ComponentProps<typeof PostCard>> = {}) {
  const handlers = { onEdit: vi.fn(), onDelete: vi.fn() };
  render(<PostCard post={basePost} isOwner {...handlers} {...props} />);
  return handlers;
}

describe("PostCard", () => {
  it("should render the post information, counts and detail links", () => {
    setup();

    expect(screen.getByRole("heading", { level: 2, name: "Postingan oleh Delcom Testing" })).toBeInTheDocument();
    expect(screen.getByText("Terus belajar apapun rintangannya!")).toBeInTheDocument();
    expect(screen.getByText("Delcom Testing")).toBeInTheDocument();
    expect(screen.getByTestId("post-likes-7")).toHaveTextContent("2");
    expect(screen.getByTestId("post-comments-7")).toHaveTextContent("1");
    expect(screen.getByAltText("Sampul postingan oleh Delcom Testing")).toHaveAttribute(
      "src",
      "https://example.com/cover.png"
    );
    expect(screen.getByTestId("open-post-7")).toHaveAttribute("href", "/posts/7");
    expect(screen.getByRole("link", { name: "Buka postingan oleh Delcom Testing" })).toHaveAttribute(
      "href",
      "/posts/7"
    );
  });

  it("should resolve a relative cover path to the Delcom server", () => {
    setup({ post: { ...basePost, cover: "img/posts/cover/7.png" } });

    expect(screen.getByAltText("Sampul postingan oleh Delcom Testing")).toHaveAttribute(
      "src",
      "https://open-api.delcom.org/img/posts/cover/7.png"
    );
  });

  it("should show a placeholder when the post has no cover", () => {
    setup({ post: { ...basePost, cover: null } });

    expect(screen.getByText("Belum ada foto sampul")).toBeInTheDocument();
    // Nama link memuat teks yang terlihat di dalamnya (aturan label-in-name)
    expect(
      screen.getByRole("link", { name: "Belum ada foto sampul. Buka postingan oleh Delcom Testing" })
    ).toHaveAttribute("href", "/posts/7");
  });

  it("should fall back to a generic author name when the author is missing", () => {
    setup({ post: { ...basePost, author: undefined as unknown as Post["author"] } });

    expect(screen.getByText("Pengguna", { selector: "p" })).toBeInTheDocument();
  });

  it("should load the cover lazily by default and eagerly with priority", () => {
    const { unmount } = render(
      <PostCard post={basePost} isOwner={false} onEdit={vi.fn()} onDelete={vi.fn()} />
    );
    expect(screen.getByAltText("Sampul postingan oleh Delcom Testing")).toHaveAttribute("loading", "lazy");
    unmount();

    render(<PostCard post={basePost} isOwner={false} priority onEdit={vi.fn()} onDelete={vi.fn()} />);
    const img = screen.getByAltText("Sampul postingan oleh Delcom Testing");
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute("fetchpriority", "high");
  });

  it("should call the edit and delete handlers for the owner", () => {
    const { onEdit, onDelete } = setup();

    fireEvent.click(screen.getByTestId("edit-post-7"));
    fireEvent.click(screen.getByTestId("delete-post-7"));

    expect(onEdit).toHaveBeenCalledWith(basePost);
    expect(onDelete).toHaveBeenCalledWith(7);
  });

  it("should hide the owner actions for other users' posts", () => {
    setup({ isOwner: false });

    expect(screen.queryByTestId("edit-post-7")).not.toBeInTheDocument();
    expect(screen.queryByTestId("delete-post-7")).not.toBeInTheDocument();
  });
});