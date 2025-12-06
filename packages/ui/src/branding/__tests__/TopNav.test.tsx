import { render, screen } from "@testing-library/react";
import React from "react";

import { TopNav } from "../TopNav";

describe("TopNav", () => {
  it("renders default links (About and Blog)", () => {
    render(<TopNav />);

    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/about"
    );
    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute(
      "href",
      "/blog"
    );
  });

  it("renders custom links when provided", () => {
    const customLinks = [
      { href: "/docs", label: "Documentation" },
      { href: "/pricing", label: "Pricing" },
    ];

    render(<TopNav links={customLinks} />);

    expect(screen.getByRole("link", { name: "Documentation" })).toHaveAttribute(
      "href",
      "/docs"
    );
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveAttribute(
      "href",
      "/pricing"
    );
    expect(screen.queryByRole("link", { name: "About" })).not.toBeInTheDocument();
  });

  it("applies active styling when currentPath matches link href", () => {
    render(<TopNav currentPath="/about" />);

    const aboutLink = screen.getByRole("link", { name: "About" });
    const blogLink = screen.getByRole("link", { name: "Blog" });

    expect(aboutLink).toHaveClass("text-foreground");
    expect(blogLink).toHaveClass("text-foreground/60");
  });

  it("applies custom class name to nav element", () => {
    const { container } = render(<TopNav className="custom-nav-class" />);

    const nav = container.querySelector("nav");
    expect(nav).toHaveClass("custom-nav-class");
  });

  it("applies custom active and inactive class names", () => {
    render(
      <TopNav
        currentPath="/about"
        activeLinkClassName="active-custom"
        inactiveLinkClassName="inactive-custom"
      />
    );

    const aboutLink = screen.getByRole("link", { name: "About" });
    const blogLink = screen.getByRole("link", { name: "Blog" });

    expect(aboutLink).toHaveClass("active-custom");
    expect(blogLink).toHaveClass("inactive-custom");
  });

  it("uses custom LinkComponent when provided", () => {
    const CustomLink = ({
      href,
      className,
      children,
    }: {
      href: string;
      className?: string;
      children: React.ReactNode;
    }) => (
      <a href={href} className={className} data-testid="custom-link">
        {children}
      </a>
    );

    render(<TopNav LinkComponent={CustomLink} />);

    const customLinks = screen.getAllByTestId("custom-link");
    expect(customLinks).toHaveLength(2);
  });

  it("renders navigation with correct semantic structure", () => {
    render(<TopNav />);

    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();
  });

  it("applies link class to all links", () => {
    render(<TopNav linkClassName="shared-link-class" />);

    const aboutLink = screen.getByRole("link", { name: "About" });
    const blogLink = screen.getByRole("link", { name: "Blog" });

    expect(aboutLink).toHaveClass("shared-link-class");
    expect(blogLink).toHaveClass("shared-link-class");
  });
});
