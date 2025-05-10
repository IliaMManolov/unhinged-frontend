'use client';

import React, { useEffect, useState, useRef } from 'react';

interface RadarChartProps {
  data: number[];
  labels: string[];
  size?: number;
  maxValue?: number;
  color?: string;
}

interface ValueTextPoint {
  x: number;
  y: number;
  value: number;
}

const RadarChart: React.FC<RadarChartProps> = ({
  data,
  labels,
  size = 300,
  maxValue = 10,
  color = 'rgba(0, 122, 255, 0.4)',
}) => {
  if (data.length !== 6 || labels.length !== 6) {
    console.error('RadarChart requires 6 data points and 6 labels.');
    return null;
  }

  const [animatedData, setAnimatedData] = useState(() => data.map(() => 0));
  const previousDataRef = useRef<number[] | undefined>(undefined);
  const animationFrameIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const animationStartValues = [...animatedData];
    
    let startFrom = previousDataRef.current && JSON.stringify(previousDataRef.current) !== JSON.stringify(data) 
                      ? animationStartValues 
                      : (data.every(d => d === 0) ? data : data.map(() => 0));

    const animationDuration = 500;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / animationDuration, 1);

      const nextAnimatedData = data.map((targetVal, i) => {
        const initialVal = startFrom[i];
        return initialVal + (targetVal - initialVal) * progress;
      });
      setAnimatedData(nextAnimatedData);

      if (progress < 1) {
        animationFrameIdRef.current = requestAnimationFrame(animate);
      } else {
        setAnimatedData(data);
      }
    };

    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    
    if (!previousDataRef.current || JSON.stringify(previousDataRef.current) !== JSON.stringify(data)){
        animationFrameIdRef.current = requestAnimationFrame(animate);
    }

    previousDataRef.current = [...data];

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [data, maxValue]);

  const center = size / 2;
  const radius = center * 0.7;

  const points = animatedData.map((value, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const normalizedValue = Math.min(Math.max(value, 0), maxValue) / maxValue;
    const x = center + radius * normalizedValue * Math.cos(angle);
    const y = center + radius * normalizedValue * Math.sin(angle);
    return `${x},${y}`;
  });

  const polygonPoints = points.join(' ');

  const axisLines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  const labelPoints: { x: number; y: number; label: string }[] = [];
  const valueTextPoints: ValueTextPoint[] = [];

  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x1 = center;
    const y1 = center;
    const x2 = center + radius * Math.cos(angle);
    const y2 = center + radius * Math.sin(angle);
    axisLines.push({ x1, y1, x2, y2 });

    const labelRadiusMultiplier = 1.3;
    const labelRadiusEffective = radius * labelRadiusMultiplier;
    const lx = center + labelRadiusEffective * Math.cos(angle);
    const ly = center + labelRadiusEffective * Math.sin(angle);
    labelPoints.push({ x: lx, y: ly, label: labels[i] });

    const valueData = animatedData[i];
    const normalizedValuePoint = Math.min(Math.max(valueData, 0), maxValue) / maxValue;
    
    const valueRadiusOffsetFromDataPoint = 12;
    const valueTextRadius = (radius * normalizedValuePoint) + valueRadiusOffsetFromDataPoint;
    
    const effectiveValueTextRadius = Math.min(valueTextRadius, labelRadiusEffective - 25);

    const vx = center + effectiveValueTextRadius * Math.cos(angle);
    const vy = center + effectiveValueTextRadius * Math.sin(angle);
    valueTextPoints.push({ x: vx, y: vy, value: Math.round(valueData) });
  }

  const numberOfSteps = 10;
  const backgroundHexagons = Array.from({ length: numberOfSteps }, (_, stepIndex) => {
    const scale = (stepIndex + 1) / numberOfSteps;
    const currentRadius = radius * scale;
    const hexagonPoints = Array.from({ length: 6 }, (__, pointIndex) => {
      const angleHex = (Math.PI / 3) * pointIndex - Math.PI / 2;
      const x = center + currentRadius * Math.cos(angleHex);
      const y = center + currentRadius * Math.sin(angleHex);
      return `${x},${y}`;
    }).join(' ');

    return (
      <polygon
        key={`hexagon-scale-${scale}`}
        points={hexagonPoints}
        fill="none"
        stroke="rgba(200, 200, 200, 0.5)"
        strokeWidth="1"
        strokeDasharray={scale === 1 ? "none" : "2,4"}
      />
    );
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90 overflow-visible">
        <g transform={`rotate(90 ${center} ${center})`}>
          {backgroundHexagons}
          {axisLines.map((line, i) => (
            <line
              key={`axis-${i}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="rgba(150, 150, 150, 0.7)"
              strokeWidth="1"
            />
          ))}
          <polygon
            points={polygonPoints}
            fill={color}
            stroke={color.replace('0.4', '1')}
            strokeWidth="2"
            style={{ transition: 'points 0.3s ease-out' }}
          />
          {labelPoints.map((p, i) => (
            <text
              key={`label-${i}`}
              x={p.x}
              y={p.y}
              dy=".3em"
              textAnchor={Math.abs(p.x - center) < 1e-6 ? "middle" : (p.x < center ? "end" : "start")}
              fontSize="12"
              fill="rgba(50, 50, 50, 1)"
              className="font-sans"
            >
              {p.label}
            </text>
          ))}
          {animatedData.map((value, i) => {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            const normalizedValue = Math.min(Math.max(value, 0), maxValue) / maxValue;
            const pointX = center + radius * normalizedValue * Math.cos(angle);
            const pointY = center + radius * normalizedValue * Math.sin(angle);
            return (
              <React.Fragment key={`data-${i}`}>
                <circle
                  cx={pointX}
                  cy={pointY}
                  r="4"
                  fill={color.replace('0.4', '1')}
                  stroke="white"
                  strokeWidth="1"
                />
                <text
                  x={valueTextPoints[i].x}
                  y={valueTextPoints[i].y}
                  dy=".3em"
                  textAnchor={Math.abs(valueTextPoints[i].x - center) < 1e-6 ? "middle" : (valueTextPoints[i].x < center ? "end" : "start")}
                  fontSize="10"
                  fill="rgba(0, 0, 0, 0.85)"
                  className="font-semibold"
                >
                  {`${valueTextPoints[i].value}/${maxValue}`}
                </text>
              </React.Fragment>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default RadarChart; 