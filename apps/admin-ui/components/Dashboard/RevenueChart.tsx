import { Box, Typography } from "@mui/material";
import { useIntl } from "react-intl";

interface RevenueChartProps {
    data: { month: string; amount: number }[];
}

const CHART_HEIGHT = 180;
const BAR_WIDTH = 32;
const BAR_GAP = 24;

// Hand-rolled SVG bar chart — no charting library in this repo, and one
// series over a handful of months doesn't warrant adding one.
export default function RevenueChart({ data }: RevenueChartProps) {
    const { formatMessage, formatNumber } = useIntl()

    if (data.length === 0) {
        return (
            <Typography variant="body2" sx={{ color: 'var(--body)', padding: '40px 0', textAlign: 'center' }}>
                {formatMessage({ id: 'noRevenueData' })}
            </Typography>
        );
    }

    const max = Math.max(...data.map((d) => d.amount), 1);
    const width = data.length * (BAR_WIDTH + BAR_GAP) + BAR_GAP;

    return (
        <Box sx={{ overflowX: 'auto', width: '100%' }}>
            <svg width={width} height={CHART_HEIGHT + 40} role="img" aria-label={formatMessage({ id: 'revenueByMonth' })}>
                {data.map((point, index) => {
                    const barHeight = (point.amount / max) * CHART_HEIGHT;
                    const x = BAR_GAP + index * (BAR_WIDTH + BAR_GAP);
                    const y = CHART_HEIGHT - barHeight;
                    return (
                        <g key={point.month}>
                            <title>{`${point.month}: ${formatNumber(point.amount, { style: 'currency', currency: 'xaf' })}`}</title>
                            <rect
                                x={x}
                                y={y}
                                width={BAR_WIDTH}
                                height={Math.max(barHeight, 2)}
                                rx={4}
                                fill="var(--primary)"
                            />
                            <text
                                x={x + BAR_WIDTH / 2}
                                y={CHART_HEIGHT + 20}
                                textAnchor="middle"
                                fontSize={11}
                                fill="var(--body)"
                            >
                                {point.month.slice(5)}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </Box>
    );
}
