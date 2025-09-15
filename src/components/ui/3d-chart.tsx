'use client';

import { cn } from '@/lib/utils';
import { Box, OrbitControls, Text } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';

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
        <motion.group
          key={index}
          position={[point.x, point.height / 2, point.z]}
          initial={animated ? { scale: 0 } : { scale: 1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
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
        </motion.group>
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
