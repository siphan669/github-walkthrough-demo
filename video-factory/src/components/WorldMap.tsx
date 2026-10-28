import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";
import { geoGraticule10, geoInterpolate, geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
// Natural Earth country outlines (public domain) packaged by world-atlas.
import world from "world-atlas/countries-50m.json";
import { useLayout, useTheme } from "../context";
import type { MapMarker } from "../types";

type Props = {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  route?: [number, number][];
  highlightCountries?: string[];
  start: number; // local frame where narration starts
  frames: number; // narration length
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const WorldMap: React.FC<Props> = ({
  center = [0, 20],
  zoom = 1,
  markers = [],
  route = [],
  highlightCountries = [],
  start,
  frames,
}) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const { width, height, vertical } = useLayout();

  const { projection, countries, graticule } = useMemo(() => {
    const topo = world as unknown as Parameters<typeof feature>[0];
    const fc = feature(topo, (world as any).objects.countries) as unknown as FeatureCollection<Geometry, { name: string }>;
    const proj = geoNaturalEarth1().fitExtent(
      [
        [40, 40],
        [width - 40, height - 40],
      ],
      { type: "Sphere" },
    );
    const path = geoPath(proj);
    const wanted = new Set(highlightCountries.map((n) => n.toLowerCase()));
    return {
      projection: proj,
      countries: fc.features.map((f) => ({
        d: path(f) ?? "",
        hl: wanted.has((f.properties?.name ?? "").toLowerCase()),
      })),
      graticule: path(geoGraticule10()) ?? "",
    };
  }, [width, height, highlightCountries]);

  // Camera: start on the whole world, glide to the target.
  const camT = interpolate(frame, [0, start + frames * 0.35], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const target = projection(center) ?? [width / 2, height / 2];
  const minZoom = vertical ? 1.6 : 1; // vertical frames start a bit closer
  const z = interpolate(camT, [0, 1], [minZoom, Math.max(minZoom, zoom)]);
  const cx = interpolate(camT, [0, 1], [width / 2, target[0]]);
  const cy = interpolate(camT, [0, 1], [height / 2, target[1]]);
  const toScreen = (p: [number, number]): [number, number] => {
    const q = projection(p) ?? [0, 0];
    return [(q[0] - cx) * z + width / 2, (q[1] - cy) * z + height / 2];
  };

  // Route drawn progressively, densified along great circles.
  const routePts = useMemo(() => {
    const pts: [number, number][] = [];
    for (let i = 0; i < route.length - 1; i++) {
      const interp = geoInterpolate(route[i], route[i + 1]);
      for (let k = 0; k < 30; k++) pts.push(interp(k / 30) as [number, number]);
    }
    if (route.length) pts.push(route[route.length - 1]);
    return pts;
  }, [route]);
  const routeT = interpolate(frame, [start + frames * 0.2, start + frames * 0.85], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  const shown = routePts.slice(0, Math.max(1, Math.round(routeT * routePts.length)));
  const screenRoute = shown.map(toScreen);
  const routeD = screenRoute.map((p, i) => `${i ? "L" : "M"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const head = screenRoute[screenRoute.length - 1];

  return (
    <AbsoluteFill style={{ backgroundColor: theme.water }}>
      <svg width={width} height={height}>
        <defs>
          <radialGradient id="sea" cx="50%" cy="45%" r="75%">
            <stop offset="0%" stopColor={theme.bgTop} />
            <stop offset="100%" stopColor={theme.water} />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#sea)" />
        <g transform={`translate(${width / 2} ${height / 2}) scale(${z}) translate(${-cx} ${-cy})`}>
          <path d={graticule} fill="none" stroke={theme.muted} strokeOpacity={0.15} strokeWidth={1} vectorEffect="non-scaling-stroke" />
          {countries.map((c, i) => (
            <path
              key={i}
              d={c.d}
              fill={c.hl ? theme.accent : theme.land}
              fillOpacity={c.hl ? 0.55 + 0.25 * Math.sin(frame / 12) : 1}
              stroke={theme.bgBottom}
              strokeWidth={0.8}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
        {route.length > 1 ? (
          <>
            <path d={routeD} fill="none" stroke={theme.accent} strokeWidth={5} strokeDasharray="14 10" strokeLinecap="round" />
            {head && routeT > 0 ? (
              <g transform={`translate(${head[0]} ${head[1]})`}>
                <circle r={16} fill={theme.accent} opacity={0.3 + 0.2 * Math.sin(frame / 5)} />
                <circle r={8} fill={theme.highlight} />
              </g>
            ) : null}
          </>
        ) : null}
        {markers.map((m, i) => {
          const appear = start + (frames * 0.7 * i) / Math.max(1, markers.length) + frames * 0.1;
          const s = interpolate(frame, [appear, appear + 10, appear + 16], [0, 1.25, 1], clamp);
          const [x, y] = toScreen([m.lon, m.lat]);
          const pulse = ((((frame - appear) % 40) + 40) % 40) / 40;
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
              <circle r={14 + pulse * 30} fill="none" stroke={theme.danger} strokeWidth={3} opacity={1 - pulse} />
              <circle r={11} fill={theme.danger} stroke="#fff" strokeWidth={3} />
              {m.label ? (
                <g transform="translate(0 -28)">
                  <text
                    textAnchor="middle"
                    fontFamily={theme.bodyFont}
                    fontWeight={900}
                    fontSize={vertical ? 38 : 32}
                    fill={theme.text}
                    stroke="#000"
                    strokeWidth={6}
                    paintOrder="stroke"
                  >
                    {m.label}
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
