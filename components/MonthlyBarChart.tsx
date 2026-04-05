import React from "react";
import { useWindowDimensions, View } from "react-native";
import Svg, { Defs, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from "react-native-svg";
import { colors } from "@/constants/theme";

interface DataPoint {
	day: string;
	value: number;
	isHighlighted?: boolean;
}

const defaultData: DataPoint[] = [
	{ day: "Mon", value: 35 },
	{ day: "Tue", value: 30 },
	{ day: "Wed", value: 20 },
	{ day: "Thr", value: 40, isHighlighted: true },
	{ day: "Fri", value: 32 },
	{ day: "Sat", value: 18 },
	{ day: "Sun", value: 22 },
];

interface MonthlyBarChartProps {
	data?: DataPoint[];
}

const MonthlyBarChart = ({ data }: MonthlyBarChartProps) => {
	const { width: screenWidth } = useWindowDimensions();
	const chartData = data ?? defaultData;

	const CHART_HEIGHT = 200;
	const CHART_PADDING_TOP = 44;
	const CHART_PADDING_LEFT = 30;
	const BAR_WIDTH = 16;
	const MAX_VALUE = 45;

	const chartWidth = screenWidth - 80;
	const drawableWidth = chartWidth - CHART_PADDING_LEFT;
	const gap = chartData.length > 1 ? (drawableWidth - chartData.length * BAR_WIDTH) / (chartData.length - 1) : 0;

	return (
		<View
			className="p-5 rounded-3xl mt-4"
			style={{
				backgroundColor: colors.chartBackground,
				borderWidth: 1,
				borderColor: colors.chartBorder,
			}}
		>
			<View style={{ height: CHART_HEIGHT + 44 }}>
				<Svg height={CHART_HEIGHT + 44} width={chartWidth}>
					<Defs>
						{/* Gradient for regular bars */}
						<LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
							<Stop offset="0" stopColor={colors.primary} stopOpacity="0.95" />
							<Stop offset="1" stopColor={colors.primary} stopOpacity="0.6" />
						</LinearGradient>
						{/* Gradient for highlighted bar */}
						<LinearGradient id="accentGrad" x1="0" y1="0" x2="0" y2="1">
							<Stop offset="0" stopColor={colors.accent} stopOpacity="1" />
							<Stop offset="1" stopColor={colors.chartAccent} stopOpacity="0.85" />
						</LinearGradient>
					</Defs>

					{/* Grid Lines */}
					{[0, 5, 25, 35, 45].map((val) => {
						const y = CHART_HEIGHT - (val / MAX_VALUE) * CHART_HEIGHT + CHART_PADDING_TOP;
						return (
							<React.Fragment key={val}>
								<Line
									x1={CHART_PADDING_LEFT}
									y1={y}
									x2={chartWidth}
									y2={y}
									stroke={colors.chartGridLine}
									strokeWidth="1"
									strokeDasharray="5 5"
								/>
								<SvgText
									x={CHART_PADDING_LEFT - 6}
									y={y + 4}
									fontSize="10"
									fill={colors.mutedForeground}
									textAnchor="end"
									fontWeight="500"
								>
									{val}
								</SvgText>
							</React.Fragment>
						);
					})}

					{/* Bars */}
					{chartData.map((item, index) => {
						const barHeight = (item.value / MAX_VALUE) * CHART_HEIGHT;
						const x = CHART_PADDING_LEFT + index * (BAR_WIDTH + gap);
						const y = CHART_HEIGHT - barHeight + CHART_PADDING_TOP;
						const barCenterX = x + BAR_WIDTH / 2;

						return (
							<React.Fragment key={item.day}>
								{item.isHighlighted && (
									<>
										{/* Tooltip bubble */}
										<Path
											d={`M ${barCenterX - 20} ${y - 30} h 40 a 7 7 0 0 1 7 7 v 13 a 7 7 0 0 1 -7 7 h -13 l -7 7 l -7 -7 h -13 a 7 7 0 0 1 -7 -7 v -13 a 7 7 0 0 1 7 -7 z`}
											fill={colors.background}
											stroke={colors.chartStroke}
											strokeWidth="1"
										/>
										<SvgText
											x={barCenterX}
											y={y - 13}
											fontSize="12"
											fontWeight="bold"
											fill={colors.accent}
											textAnchor="middle"
										>
											{`$${item.value}`}
										</SvgText>
									</>
								)}

								{/* Bar */}
								<Rect
									x={x}
									y={y}
									width={BAR_WIDTH}
									height={barHeight}
									rx={BAR_WIDTH / 2}
									fill={item.isHighlighted ? "url(#accentGrad)" : "url(#barGrad)"}
								/>

								{/* Day label */}
								<SvgText
									x={barCenterX}
									y={CHART_HEIGHT + CHART_PADDING_TOP + 22}
									fontSize="11"
									fill={item.isHighlighted ? colors.accent : colors.mutedForeground}
									fontWeight={item.isHighlighted ? "bold" : "500"}
									textAnchor="middle"
								>
									{item.day}
								</SvgText>
							</React.Fragment>
						);
					})}
				</Svg>
			</View>
		</View>
	);
};

export default MonthlyBarChart;
