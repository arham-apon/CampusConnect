import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmationModal from "../src/components/ConfirmationModal";

test("should render nothing when isOpen is false", () => {
  const { container } = render(
    <ConfirmationModal isOpen={false} message="Are you sure?" onConfirm={() => {}} onCancel={() => {}} />
  );
  expect(container).toBeEmptyDOMElement();
});

test("should show the title and message when isOpen is true", () => {
  render(
    <ConfirmationModal
      isOpen={true}
      title="Delete Post"
      message="This cannot be undone."
      onConfirm={() => {}}
      onCancel={() => {}}
    />
  );
  expect(screen.getByText("Delete Post")).toBeInTheDocument();
  expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
});

test("should call onConfirm when the confirm button is clicked", async () => {
  const onConfirm = jest.fn();
  render(
    <ConfirmationModal
      isOpen={true}
      message="Are you sure?"
      confirmText="Yes, delete"
      onConfirm={onConfirm}
      onCancel={() => {}}
    />
  );

  await userEvent.click(screen.getByText("Yes, delete"));

  expect(onConfirm).toHaveBeenCalledTimes(1);
});

test("should call onCancel when the cancel button is clicked", async () => {
  const onCancel = jest.fn();
  render(
    <ConfirmationModal
      isOpen={true}
      message="Are you sure?"
      cancelText="No, keep it"
      onConfirm={() => {}}
      onCancel={onCancel}
    />
  );

  await userEvent.click(screen.getByText("No, keep it"));

  expect(onCancel).toHaveBeenCalledTimes(1);
});
