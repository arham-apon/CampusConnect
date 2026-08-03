import { render, screen } from "@testing-library/react";
import Loading from "../src/components/Loading";

test("should show the default loading text when no text prop is given", () => {
  render(<Loading />);
  expect(screen.getByText("Loading...")).toBeInTheDocument();
});

test("should show a custom message when the text prop is provided", () => {
  render(<Loading text="Fetching events" />);
  expect(screen.getByText("Fetching events...")).toBeInTheDocument();
});

test("should center itself full-screen when fullScreen is true", () => {
  const { container } = render(<Loading fullScreen />);
  expect(container.firstChild).toHaveClass("min-h-screen");
});
