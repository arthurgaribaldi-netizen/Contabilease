'use client';

import { useMemo, useRef, useState } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    return {
      start: Math.max(0, startIndex - overscan),
      end: Math.min(items.length - 1, endIndex + overscan),
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1);
  }, [items, visibleRange]);

  // Calculate total height
  const totalHeight = items.length * itemHeight;

  // Handle scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${visibleRange.start * itemHeight}px)`,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={visibleRange.start + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleRange.start + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook para virtualização de tabelas
export function useVirtualizedTable<T>(
  data: T[],
  rowHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / rowHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / rowHeight),
      data.length - 1
    );

    return {
      start: Math.max(0, startIndex - overscan),
      end: Math.min(data.length - 1, endIndex + overscan),
    };
  }, [scrollTop, rowHeight, containerHeight, data.length, overscan]);

  const visibleData = useMemo(() => {
    return data.slice(visibleRange.start, visibleRange.end + 1);
  }, [data, visibleRange]);

  const totalHeight = data.length * rowHeight;

  return {
    visibleData,
    visibleRange,
    totalHeight,
    setScrollTop,
  };
}

// Componente de tabela virtualizada
interface VirtualizedTableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T;
    header: string;
    width?: number;
    render?: (value: any, item: T, index: number) => React.ReactNode;
  }>;
  rowHeight: number;
  containerHeight: number;
  className?: string;
}

export function VirtualizedTable<T>({
  data,
  columns,
  rowHeight,
  containerHeight,
  className = '',
}: VirtualizedTableProps<T>) {
  const { visibleData, visibleRange, totalHeight, setScrollTop } =
    useVirtualizedTable(data, rowHeight, containerHeight);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      className={`overflow-auto border border-gray-200 rounded-lg ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <table className="w-full">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr style={{ height: visibleRange.start * rowHeight }} />
          {visibleData.map((item, index) => (
            <tr
              key={visibleRange.start + index}
              className="hover:bg-gray-50 border-b border-gray-100"
              style={{ height: rowHeight }}
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className="px-4 py-2 text-sm text-gray-900"
                  style={{ width: column.width }}
                >
                  {column.render
                    ? column.render(item[column.key], item, visibleRange.start + index)
                    : String(item[column.key] || '')}
                </td>
              ))}
            </tr>
          ))}
          <tr style={{ height: (data.length - visibleRange.end - 1) * rowHeight }} />
        </tbody>
      </table>
    </div>
  );
}
