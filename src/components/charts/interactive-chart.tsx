'use client';

import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useState } from 'react';

interface DataPoint {
  x: number | string;
  y: number;
  label?: string;
  color?: string;
}

interface InteractiveChartProps {
  data: DataPoint[];
  type?: 'line' | 'bar' | 'area';
  height?: number;
  className?: string;
  showTooltip?: boolean;
  animated?: boolean;
  colors?: string[];
}

export function InteractiveChart({
  data,
  type = 'line',
  height = 300,
  className,
  showTooltip = true,
  animated = true,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
}: InteractiveChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const maxY = Math.max(...data.map(d => d.y));
  const minY = Math.min(...data.map(d => d.y));
  const rangeY = maxY - minY;
  const padding = 40;

  const getPointPosition = (point: DataPoint, index: number) => {
    const x = padding + (index / (data.length - 1)) * (height - 2 * padding);
    const y = padding + ((maxY - point.y) / rangeY) * (height - 2 * padding);
    return { x, y };
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find closest data point
    const closestIndex = data.reduce((closest, _, index) => {
      const pos = getPointPosition(data[index], index);
      const currentDistance = Math.abs(pos.x - x);
      const closestDistance = Math.abs(getPointPosition(data[closest], closest).x - x);
      return currentDistance < closestDistance ? index : closest;
    }, 0);

    setHoveredPoint(data[closestIndex]);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className={cn('relative', className)}>
      <svg
        ref={svgRef}
        width='100%'
        height={height}
        className='overflow-visible'
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Grid lines */}
        <defs>
          <pattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'>
            <path
              d='M 20 0 L 0 0 0 20'
              fill='none'
              stroke='currentColor'
              strokeWidth='0.5'
              opacity='0.1'
            />
          </pattern>
        </defs>
        <rect width='100%' height='100%' fill='url(#grid)' />

        {/* Chart content based on type */}
        {type === 'line' && (
          <motion.path
            d={data
              .map((point, index) => {
                const pos = getPointPosition(point, index);
                return `${index === 0 ? 'M' : 'L'} ${pos.x} ${pos.y}`;
              })
              .join(' ')}
            fill='none'
            stroke={colors[0]}
            strokeWidth='3'
            strokeLinecap='round'
            strokeLinejoin='round'
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: animated ? 1 : 0, ease: 'easeInOut' }}
          />
        )}

        {type === 'area' && (
          <>
            <motion.path
              d={`M ${padding} ${height - padding} ${data
                .map((point, index) => {
                  const pos = getPointPosition(point, index);
                  return `L ${pos.x} ${pos.y}`;
                })
                .join(' ')} L ${height - padding} ${height - padding} Z`}
              fill={colors[0]}
              fillOpacity='0.2'
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: animated ? 1 : 0, ease: 'easeInOut' }}
            />
            <motion.path
              d={data
                .map((point, index) => {
                  const pos = getPointPosition(point, index);
                  return `${index === 0 ? 'M' : 'L'} ${pos.x} ${pos.y}`;
                })
                .join(' ')}
              fill='none'
              stroke={colors[0]}
              strokeWidth='3'
              strokeLinecap='round'
              strokeLinejoin='round'
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: animated ? 1 : 0, ease: 'easeInOut', delay: 0.2 }}
            />
          </>
        )}

        {type === 'bar' && (
          <>
            {data.map((point, index) => {
              const pos = getPointPosition(point, index);
              const barWidth = ((height - 2 * padding) / data.length) * 0.8;
              const barHeight = height - padding - pos.y;

              return (
                <motion.rect
                  key={index}
                  x={pos.x - barWidth / 2}
                  y={pos.y}
                  width={barWidth}
                  height={barHeight}
                  fill={colors[index % colors.length]}
                  fillOpacity='0.8'
                  initial={{ height: 0 }}
                  animate={{ height: barHeight }}
                  transition={{
                    duration: animated ? 0.5 : 0,
                    delay: index * 0.1,
                    ease: 'easeOut',
                  }}
                />
              );
            })}
          </>
        )}

        {/* Data points */}
        {data.map((point, index) => {
          const pos = getPointPosition(point, index);
          const isHovered = hoveredPoint === point;

          return (
            <motion.circle
              key={index}
              cx={pos.x}
              cy={pos.y}
              r={isHovered ? 8 : 4}
              fill={point.color || colors[0]}
              stroke='white'
              strokeWidth='2'
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                duration: animated ? 0.3 : 0,
                delay: index * 0.1,
                ease: 'easeOut',
              }}
              whileHover={{ scale: 1.2 }}
              className='cursor-pointer'
            />
          );
        })}
      </svg>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className='absolute z-50 px-3 py-2 bg-popover border border-border rounded-lg shadow-lg pointer-events-none'
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y - 10,
              transform: 'translateY(-100%)',
            }}
          >
            <div className='text-sm font-medium text-popover-foreground'>
              {hoveredPoint.label || `Valor: ${hoveredPoint.y}`}
            </div>
            <div className='text-xs text-muted-foreground'>
              {typeof hoveredPoint.x === 'string' ? hoveredPoint.x : `X: ${hoveredPoint.x}`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
