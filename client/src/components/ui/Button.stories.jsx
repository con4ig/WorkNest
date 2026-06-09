import { Button } from './Button';
import { Plus, Trash2, Save } from 'lucide-react';

/** @type { import('@storybook/react').Meta<typeof Button> } */
const meta = {
    title: 'Design system/Button',
    component: Button,
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: [
                'default',
                'destructive',
                'outline',
                'secondary',
                'ghost',
                'link',
            ],
        },
        size: {
            control: 'select',
            options: ['default', 'sm', 'lg', 'icon'],
        },
        isLoading: { control: 'boolean' },
        disabled: { control: 'boolean' },
    },
    args: {
        children: 'Click me',
        variant: 'default',
        size: 'default',
    },
};
export default meta;

export const Default = {};

export const Destructive = {
    args: { variant: 'destructive', children: 'Delete project' },
};

export const Outline = {
    args: { variant: 'outline', children: 'Cancel' },
};

export const Secondary = {
    args: { variant: 'secondary', children: 'Save draft' },
};

export const Ghost = {
    args: { variant: 'ghost', children: 'Skip' },
};

export const Link = {
    args: { variant: 'link', children: 'Read the docs' },
};

export const Sizes = {
    render: () => (
        <div className="flex items-center gap-3">
            <Button type="button" size="sm">
                Small
            </Button>
            <Button type="button" size="default">
                Default
            </Button>
            <Button type="button" size="lg">
                Large
            </Button>
            <Button type="button" size="icon" aria-label="Add">
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    ),
};

export const WithIcon = {
    args: {
        children: (
            <>
                <Save className="mr-2 h-4 w-4" />
                Save changes
            </>
        ),
    },
};

export const Loading = {
    args: { isLoading: true, children: 'Submitting...' },
};

export const Disabled = {
    args: { disabled: true, children: 'Unavailable' },
};

export const DangerWithIcon = {
    args: {
        variant: 'destructive',
        children: (
            <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete permanently
            </>
        ),
    },
};
