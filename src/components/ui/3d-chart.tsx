'use client';

import { cn } from '@/lib/utils';
import { Box, OrbitControls, Text } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import * as React from 'react';
import { useRef } from 'react';
import { Group } from 'three';

interface DataPoint3D {
  x: number;
  y: number;
  z: number;
  value: number;
  label?: string;
  color?: string;
}

interface Chart3DProps {
  data: DataPoint3D[];
  className?: string;
  height?: number;
  animated?: boolean;
}

function AnimatedGroup({
  children,
  position,
  animated,
  delay,
}: {
  children: React.ReactNode;
  position: [number, number, number];
  animated: boolean;
  delay: number;
}) {
  const groupRef = useRef<Group>(null);
  const [scale, setScale] = React.useState(animated ? 0 : 1);

  React.useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setScale(1);
      }, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [animated, delay]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {children}
    </group>
  );
}

function ChartScene({ data, animated }: { data: DataPoint3D[]; animated: boolean }) {
  const maxValue = Math.max(...data.map(d => d.value));
  const normalizedData = data.map(d => ({
    ...d,
    height: (d.value / maxValue) * 5,
  }));

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {normalizedData.map((point, index) => (
        <AnimatedGroup
          key={index}
          position={[point.x, point.height / 2, point.z]}
          animated={animated}
          delay={index * 0.1}
        >
          <Box args={[0.8, point.height, 0.8]}>
            <meshStandardMaterial color={point.color || '#3b82f6'} transparent opacity={0.8} />
          </Box>

          {point.label && (
            <Text
              position={[0, point.height / 2 + 0.5, 0]}
              fontSize={0.3}
              color='white'
              anchorX='center'
              anchorY='middle'
            >
              {point.label}
            </Text>
          )}
        </AnimatedGroup>
      ))}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={animated}
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export function Chart3D({ data, className, height = 400, animated = true }: Chart3DProps) {
  return (
    <div className={cn('relative', className)}>
      <Canvas camera={{ position: [10, 10, 10], fov: 50 }} style={{ height: `${height}px` }}>
        <ChartScene data={data} animated={animated} />
      </Canvas>

      {/* Controls overlay */}
      <div className='absolute top-4 left-4 bg-card/80 backdrop-blur-sm border border-border rounded-lg p-2'>
        <div className='text-xs text-muted-foreground'>
          <div>🖱️ Arraste para rotacionar</div>
          <div>🔍 Scroll para zoom</div>
          <div>📱 Toque para navegar</div>
        </div>
      </div>
    </div>
  );
}
