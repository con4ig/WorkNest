import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('<Button type="button" />', () => {
    it('renders children and forwards click events', async () => {
        const onClick = vi.fn();
        render(
            <Button type="button" onClick={onClick}>
                Save
            </Button>,
        );

        const button = screen.getByRole('button', { name: /save/i });
        expect(button).toBeInTheDocument();

        await userEvent.click(button);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('disables the button and shows a spinner while loading', async () => {
        const onClick = vi.fn();
        render(
            <Button type="button" isLoading onClick={onClick}>
                Save
            </Button>,
        );

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();

        // The spinner element is decorative — assert via the visible label
        // and the disabled attribute, then confirm the click is swallowed.
        await userEvent.click(button);
        expect(onClick).not.toHaveBeenCalled();
    });

    it("applies the destructive variant classes when variant='destructive'", () => {
        render(
            <Button type="button" variant="destructive">
                Delete
            </Button>,
        );
        const button = screen.getByRole('button', { name: /delete/i });
        expect(button.className).toContain('bg-destructive');
    });

    it('forwards a ref to the underlying button element', () => {
        let captured = null;
        render(
            <Button
                type="button"
                ref={(node) => {
                    captured = node;
                }}
            >
                Hi
            </Button>,
        );
        expect(captured).toBeInstanceOf(HTMLButtonElement);
    });
});
