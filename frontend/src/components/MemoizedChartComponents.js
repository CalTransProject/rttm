import React from "react";
import StackedArea from "./subcomponents/sub-graph/StackedArea";
import Bar from "./subcomponents/sub-graph/Bar";
import PieChart from "./subcomponents/sub-graph/PieChart";
import StackedBar from "./subcomponents/sub-graph/StackedBar";
import Density from "./subcomponents/sub-graph/Density";

export const MemoizedStackedArea = React.memo(StackedArea);
export const MemoizedBar = React.memo(Bar);
export const MemoizedPieChart = React.memo(PieChart);
export const MemoizedStackedBar = React.memo(StackedBar);
export const MemoizedDensity = React.memo(Density);