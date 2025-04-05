import type { ActivityTimeRangeCountProps } from "$server/validators/activityTimeRangeCount";
import useActivityTimeRangeCountByTopic from "$utils/useActivityTimeRangeCountByTopic";
import React, { useRef, useEffect } from "react";
import type { FromSchema } from "json-schema-to-ts";

import * as d3 from "d3";

import { NEXT_PUBLIC_REWATCH_GRAPH_COUNT_THRESHOLD } from "$utils/env";
import { NEXT_PUBLIC_REWATCH_GRAPH_PLOT_SIZE } from "$utils/env";
import { NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD } from "$utils/env";

const ACTIVITY_COUNT_INTERVAL2 = Number(
  process.env.ACTIVITY_COUNT_INTERVAL ?? 1
);

type Props = {
  scope: boolean;
  topicId: number;
  topicTimeRequired: number;
  topicStartTime: number | null;
  topicStopTime: number | null;
};

const PlotSchema = {
  type: "object",
  required: ["startMs", "count"],
  properties: {
    startMs: { type: "number" },
    count: { type: "number" },
  },
  additionalProperties: false,
} as const;

export type PlotSchema = FromSchema<typeof PlotSchema>;

export function PlotAndLineChart({
  plot,
  average,
  height = 250,
  marginTop = 20,
  //  marginRight = 20,  // 横幅いっぱいのとき
  marginRight = 110, // シークバーに合わせるとき
  marginBottom = 20,
  //  marginLeft = 20,   // 横幅いっぱいのとき
  marginLeft = 150, // シークバーに合わせるとき
}: {
  plot: PlotSchema[];
  average: PlotSchema[];
  height?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    d3.selectAll("svg#rewatch-graph > *").remove();
    d3.selectAll("div#tooltip > *").remove();

    const svg = d3.select(svgRef.current);
    const width = divRef.current?.offsetWidth || 1000;

    svg
      .attr("id", "rewatch-graph")
      .attr("width", width)
      .attr("height", height)
      .style("overflow", "visible");

    const maxStartMs = Math.max(...average.map((a) => a.startMs));

    // ツールチップ（初期値は透明）
    const tooltip = d3
      .select("#tooltip")
      .append("div")
      .style("opacity", 0)
      .style("background-color", "#666")
      .style("color", "white")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("z-index", 100)
      .style("position", "absolute");

    // マウスカーソルがプロット上で動いているときは表示したまま
    const mousemove = function () {
      tooltip.style("opacity", 1);
    };

    // マウスカーソルから15px右・下の場所に表示
    const mouseover = function (e: MouseEvent, d: PlotSchema) {
      tooltip
        .html(convertTimeString(d.startMs / 1000))
        .style("left", e.offsetX + 15 + "px")
        .style("top", e.offsetY + 15 + "px");
    };

    // マウスカーソルをプロットから外すと透明化
    const mouseleave = function () {
      tooltip.transition().duration(200).style("opacity", 0);
    };

    const x = d3
      .scaleLinear()
      .domain([0, maxStartMs / 1000])
      .range([marginLeft, width - marginRight]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(plot, (d) => d.count) ?? 0])
      .range([height - marginBottom, marginTop]);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - marginBottom})`)
      .call(
        d3.axisBottom(x).tickFormat((d) => {
          return convertTimeString(d as number);
        })
      );

    svg
      .append("g")
      .attr("transform", `translate(${marginLeft}, 0)`)
      .call(d3.axisLeft(y));

    // X軸ラベル
    svg
      .append("text")
      .attr("class", "x-label")
      .attr("text-anchor", "end")
      .attr("x", (width - marginRight - marginLeft) / 2 + marginLeft)
      .attr("y", height + 20)
      .text("time");

    // Y軸ラベル
    svg
      .append("text")
      .attr("class", "y-label")
      .attr("text-anchor", "end")
      .attr("x", 0 - height / 2 + marginTop)
      .attr("y", marginLeft - 50)
      .attr("transform", "rotate(-90)")
      .text("count");

    svg
      .selectAll("circle")
      .data(plot)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.startMs / 1000))
      .attr("cy", (d) => y(d.count))
      .attr("r", NEXT_PUBLIC_REWATCH_GRAPH_PLOT_SIZE)
      .attr("fill", "gray")
      .attr("opacity", 0.3)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);

    svg
      .append("path")
      .datum(average)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 1)
      .attr(
        "d",
        d3
          .line<PlotSchema>()
          .x((d: PlotSchema) => x(d.startMs / 1000))
          .y((d: PlotSchema) => y(d.count))
      )
      .attr("opacity", 0.8);
  }, [average, plot, height, marginBottom, marginLeft, marginRight, marginTop]);

  return (
    <div ref={divRef}>
      <svg ref={svgRef}></svg>
    </div>
  );
}

function convertTimeString(seconds: number): string {
  const sec = seconds % 60;
  const min = Math.floor(seconds / 60) % 60;
  const hour = Math.floor(seconds / 60 / 60) % 60;

  return (
    hour +
    ":" +
    String(min).padStart(2, "0") +
    ":" +
    String(sec).padStart(2, "0")
  );
}

function padZeroTimeRangeCount(
  counts: ActivityTimeRangeCountProps[],
  topicTimeRequired: number,
  topicStartTime: number | null,
  topicStopTime: number | null
): ActivityTimeRangeCountProps[] {
  const startTime = topicStartTime ?? 0;
  const stopTime = topicStopTime ?? topicTimeRequired;
  const activityIds = [...new Set(counts.map((c) => c.activityId))];

  activityIds.forEach((activityId) => {
    for (let t = startTime; t < stopTime; t += ACTIVITY_COUNT_INTERVAL2) {
      if (
        counts.find((c) => {
          return (
            c.activityId === activityId &&
            c.startMs === t * 1000 &&
            c.endMs === (t + ACTIVITY_COUNT_INTERVAL2) * 1000
          );
        })
      )
        continue;

      counts.push({
        activityId: activityId,
        startMs: t * 1000,
        endMs: (t + ACTIVITY_COUNT_INTERVAL2) * 1000,
        count: 0,
      });
    }
  });
  return counts;
}

export default function ActivityRewatchGraph(props: Props) {
  const { scope, topicId, topicTimeRequired, topicStartTime, topicStopTime } =
    props;
  const { data: counts } = useActivityTimeRangeCountByTopic(topicId, scope);
  if (!NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD) {
    return <></>;
  }

  const plot: PlotSchema[] =
    padZeroTimeRangeCount(
      counts ?? [],
      topicTimeRequired,
      topicStartTime,
      topicStopTime
    )
      .map((c) => ({ startMs: c.startMs, count: c?.count || 0 }))
      .filter((c) => c.count <= NEXT_PUBLIC_REWATCH_GRAPH_COUNT_THRESHOLD) ||
    [];

  // ES2024: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy
  // eslint-disable-next-line
  const plotEachStartMs = Object.groupBy(plot, (p: PlotSchema) => p.startMs);
  const average: PlotSchema[] = [];
  for (const key of Object.keys(plotEachStartMs)) {
    const startMs = key;
    const count =
      plotEachStartMs[key]
        .map((p: PlotSchema) => p.count)
        .reduce((a: number, b: number) => {
          return a + b;
        }, 0) / plotEachStartMs[key].length || 0;
    average.push({ startMs: Number(startMs), count: count });
  }

  return (
    <>
      <div style={{ position: "relative" }}>
        <div id="tooltip"></div>
        <PlotAndLineChart plot={plot} average={average} />
      </div>
    </>
  );
}
