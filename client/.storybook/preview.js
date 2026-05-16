// Storybook preview config — loads Tailwind + design tokens so stories
// look identical to the running app, and exposes light/dark toggles
// matching the in-app theme switcher.

import "../src/styles/fonts.css";
import "../src/styles/index.css";

/** @type { import('@storybook/react').Preview } */
const preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        backgrounds: {
            default: "app",
            values: [
                { name: "app", value: "rgb(248 250 252)" },
                { name: "app-dark", value: "rgb(9 9 11)" },
            ],
        },
        layout: "centered",
        a11y: {
            // Run rules per story; surface violations as decorators.
            config: { rules: [{ id: "color-contrast", enabled: true }] },
        },
    },
    globalTypes: {
        theme: {
            description: "Theme",
            defaultValue: "light",
            toolbar: {
                title: "Theme",
                icon: "circlehollow",
                items: [
                    { value: "light", title: "Light" },
                    { value: "dark", title: "Dark" },
                ],
                dynamicTitle: true,
            },
        },
    },
    decorators: [
        (Story, context) => {
            const theme = context.globals.theme;
            // The app toggles `.dark` on <html>; mirror that here.
            const root = document.documentElement;
            if (theme === "dark") root.classList.add("dark");
            else root.classList.remove("dark");
            return Story();
        },
    ],
};

export default preview;
