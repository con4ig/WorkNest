import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "./Card";
import { Button } from "./Button";

/** @type { import('@storybook/react').Meta<typeof Card> } */
const meta = {
    title: "Design system/Card",
    component: Card,
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <div style={{ width: 360 }}>
                <Story />
            </div>
        ),
    ],
};
export default meta;

export const Basic = {
    render: () => (
        <Card>
            <CardHeader>
                <CardTitle>Project status</CardTitle>
                <CardDescription>
                    7 active, 3 archived this quarter.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Open the project board for a per-status breakdown.
                </p>
            </CardContent>
            <CardFooter>
                <Button size="sm">Open board</Button>
            </CardFooter>
        </Card>
    ),
};

export const HeaderOnly = {
    render: () => (
        <Card>
            <CardHeader>
                <CardTitle>Pending approvals</CardTitle>
                <CardDescription>
                    Two leave requests waiting on HR.
                </CardDescription>
            </CardHeader>
        </Card>
    ),
};

export const Stats = {
    render: () => (
        <Card>
            <CardHeader>
                <CardDescription>This month</CardDescription>
                <CardTitle>+12 projects</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground">
                    Compared to 7 in the previous month.
                </p>
            </CardContent>
        </Card>
    ),
};
