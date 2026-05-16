import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./Input";

describe("<Input />", () => {
  it("renders with the given placeholder", () => {
    render(<Input placeholder="Your email" />);
    expect(screen.getByPlaceholderText("Your email")).toBeInTheDocument();
  });

  it("calls onChange with each keystroke and reflects the value when controlled", async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Input value="" placeholder="Email" onChange={onChange} />
    );

    const input = screen.getByPlaceholderText("Email");
    await userEvent.type(input, "ab");

    // 2 calls for "ab" (one per keystroke) — order matters.
    expect(onChange).toHaveBeenCalledTimes(2);

    rerender(<Input value="ab" placeholder="Email" onChange={onChange} />);
    expect(screen.getByPlaceholderText("Email")).toHaveValue("ab");
  });
});
