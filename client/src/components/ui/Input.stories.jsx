import { Input } from "./Input";

/** @type { import('@storybook/react').Meta<typeof Input> } */
const meta = {
    title: "Design system/Input",
    component: Input,
    tags: ["autodocs"],
    argTypes: {
        type: {
            control: "select",
            options: ["text", "email", "password", "number", "search", "url"],
        },
        disabled: { control: "boolean" },
    },
    args: {
        placeholder: "you@example.com",
        type: "email",
    },
    decorators: [
        (Story) => (
            <div style={{ width: 320 }}>
                <Story />
            </div>
        ),
    ],
};
export default meta;

export const Default = {};

export const Password = {
    args: { type: "password", placeholder: "••••••••" },
};

export const WithValue = {
    args: { defaultValue: "alice@worknest.dev" },
};

export const Disabled = {
    args: { disabled: true, defaultValue: "alice@worknest.dev" },
};

export const Number = {
    args: { type: "number", placeholder: "Days requested" },
};
