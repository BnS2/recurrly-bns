import React from "react";
import { Dimensions, View } from "react-native";
import Svg, { Defs, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from "react-native-svg";
import { colors } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface DataPoint {
	day: string;
	value: number;
	isHighlighted?: boolean;
}

const data: DataPoint[] = [
	{ day: "Mon", value: 35 },
	{ day: "Tue", value: 30 },
	{ day: "Wed", value: 20 },
	{ day: "Thr", value: 40, isHighlighted: true },
	{ day: "Fri", value: 32 },
	{ day: "Sat", value: 18 },
	{ day: "Sun", value: 22 },
];

const CHART_HEIGHT = 200;
const CHART_PADDING_TOP = 44;
const CHART_PADDING_LEFT = 30;
const BAR_WIDTH = 16;
const MAX_VALUE = 45;

const MonthlyBarChart = () => {
	const chartWidth = SCREEN_WIDTH - 80;
	const drawableWidth = chartWidth - CHART_PADDING_LEFT;
	const gap = (drawableWidth - data.length * BAR_WIDTH) / (data.length - 1);

	return (
		<View
			className="p-5 rounded-3xl mt-4"
			style={{
				backgroundColor: "rgba(236, 226, 194, 0.55)",
				borderWidth: 1,
				borderColor: "rgba(0,0,0,0.06)",
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
							<Stop offset="1" stopColor="#d4593a" stopOpacity="0.85" />
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
									stroke="rgba(0,0,0,0.08)"
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
					{data.map((item, index) => {
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
											fill="#fff9e3"
											stroke="rgba(0,0,0,0.12)"
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
