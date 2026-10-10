"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { motion } from "framer-motion";
import { DUR, EASING } from "@/lib/motion";

/**
 * Кривая калибровки на Recharts.
 * Анимация: кривая «вырастает» из идеальной диагонали к реальной —
 * визуально показывает, насколько ваша уверенность съехала относительно точности.
 */

export interface CalibPoint {
  bin: number; // 0.05..0.95
  observed: number | null;
  count: number;
}

export default function CalibrationCurve({ points }: { points: CalibPoint[] }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  const data = useMemo(() => {
    return points.map((p) => ({
      bin: Math.round(p.bin * 100),
      // до анимации все точки лежат на диагонали y=x
      ideal: Math.round(p.bin * 100),
      actual: animated && p.observed !== null ? Math.round(p.observed * 100) : Math.round(p.bin * 100),
      has: p.observed !== null,
      n: p.count,
    }));
  }, [points, animated]);

  const lineData = data.filter((d) => d.has);

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="font-display text-lg text-ink">Кривая калибровки</h3>
        <p className="text-xs text-ink-faint">
          пунктир — идеал (y = x) · терракота — вы
        </p>
      </div>
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: -8 }}>
            <CartesianGrid stroke="#EDE5D6" strokeDasharray="3 3" />
            <XAxis
              dataKey="bin"
              type="number"
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tick={{ fill: "#8A8073", fontSize: 12, fontFamily: "var(--font-jetbrains)" }}
              label={{ value: "Уверенность, %", position: "insideBottom", offset: -4, fill: "#8A8073", fontSize: 12 }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tick={{ fill: "#8A8073", fontSize: 12, fontFamily: "var(--font-jetbrains)" }}
              label={{ value: "Верно, %", angle: -90, position: "insideLeft", offset: 20, fill: "#8A8073", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                background: "#FFFFFF", border: "1px solid #DFD3BC", borderRadius: 12,
                fontFamily: "var(--font-inter)", fontSize: 13, boxShadow: "0 4px 16px rgba(31,27,22,0.08)",
              }}
              formatter={(v: number, name: string) => [`${v}%`, name === "actual" ? "Факт" : "Идеал"]}
              labelFormatter={(l) => `Уверенность ${l}%`}
            />
            {/* Диагональ идеала */}
            <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]} stroke="#C9B894" strokeDasharray="6 4" strokeWidth={2} />
            {/* Реальная кривая: анимируется от диагонали (SMIL animate через key + transition CSS не подходит Recharts — перерисовываем с плавным переходом точек) */}
            <Line
              dataKey="actual"
              stroke="#D97742"
              strokeWidth={3}
              dot={{ r: 5, fill: "#D97742", stroke: "#FAF8F3", strokeWidth: 2 }}
              activeDot={{ r: 7 }}
              isAnimationActive
              animationDuration={DUR.slow * 1000 * 2}
              animationEasing="ease-in-out"
            />
            <Line dataKey="ideal" stroke="transparent" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {!lineData.length && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.base, ease: EASING }}
          className="mt-2 text-center text-sm text-ink-faint"
        >
          Пока нет ответов с уверенностью — пройдите сценарий, и точка появится.
        </motion.p>
      )}
    </div>
  );
}
