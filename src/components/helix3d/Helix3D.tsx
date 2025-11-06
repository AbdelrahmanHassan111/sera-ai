/**
 * 3D DNA Helix Visualization
 * 
 * Interactive Three.js helix with color-coded genetic markers
 */

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { GeneticMarker, Recommendation } from '@/types/domain';
import { getConfidenceColor } from '@/lib/utils';

interface HelixProps {
  markers?: GeneticMarker[];
  recommendations?: Recommendation[];
  animate?: boolean;
  lowPerformance?: boolean;
}

interface HelixGeometryProps {
  markers: GeneticMarker[];
  recommendations: Recommendation[];
  animate: boolean;
  lowPerformance: boolean;
}

const HelixGeometry: React.FC<HelixGeometryProps> = ({
  markers,
  recommendations,
  animate,
  lowPerformance,
}) => {
  const strand1Ref = useRef<THREE.Mesh>(null);
  const strand2Ref = useRef<THREE.Mesh>(null);
  const rungsRef = useRef<THREE.Group>(null);
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);

  // Animation
  useFrame((state) => {
    if (!animate) return;
    if (strand1Ref.current) {
      strand1Ref.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
    if (strand2Ref.current) {
      strand2Ref.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
    if (rungsRef.current) {
      rungsRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  // Generate helix geometry
  const { strand1Points, strand2Points, rungs } = useMemo(() => {
    const numTurns = 3;
    const pointsPerTurn = lowPerformance ? 20 : 40;
    const totalPoints = numTurns * pointsPerTurn;
    const height = 8;
    const radius = 1.5;

    const s1Points: THREE.Vector3[] = [];
    const s2Points: THREE.Vector3[] = [];
    const rungsData: Array<{
      start: THREE.Vector3;
      end: THREE.Vector3;
      marker?: GeneticMarker;
      recommendation?: Recommendation;
    }> = [];

    for (let i = 0; i < totalPoints; i++) {
      const t = (i / totalPoints) * numTurns * Math.PI * 2;
      const y = ((i / totalPoints) * height) - height / 2;

      // Strand 1
      const x1 = Math.cos(t) * radius;
      const z1 = Math.sin(t) * radius;
      s1Points.push(new THREE.Vector3(x1, y, z1));

      // Strand 2 (180 degrees offset)
      const x2 = Math.cos(t + Math.PI) * radius;
      const z2 = Math.sin(t + Math.PI) * radius;
      s2Points.push(new THREE.Vector3(x2, y, z2));

      // Create rungs every N points
      if (i % (lowPerformance ? 4 : 3) === 0) {
        const rungIndex = Math.floor(i / (lowPerformance ? 4 : 3));
        const marker = markers[rungIndex % markers.length];
        const rec = marker
          ? recommendations.find((r) => r.rsid === marker.rsid)
          : undefined;

        rungsData.push({
          start: new THREE.Vector3(x1, y, z1),
          end: new THREE.Vector3(x2, y, z2),
          marker,
          recommendation: rec,
        });
      }
    }

    return {
      strand1Points: s1Points,
      strand2Points: s2Points,
      rungs: rungsData,
    };
  }, [markers, recommendations, lowPerformance]);

  // Create tube curves
  const strand1Curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(strand1Points);
  }, [strand1Points]);

  const strand2Curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(strand2Points);
  }, [strand2Points]);

  // Get color for rung based on recommendation confidence
  const getRungColor = (rec?: Recommendation): string => {
    if (!rec) return '#7AA398'; // Primary color (teal)
    switch (rec.confidence) {
      case 'high':
        return '#dc2626'; // Red
      case 'medium':
        return '#f59e0b'; // Amber
      case 'low':
        return '#10b981'; // Green
      default:
        return '#7AA398';
    }
  };

  return (
    <group>
      {/* Strand 1 */}
      <mesh ref={strand1Ref}>
        <tubeGeometry args={[strand1Curve, 64, 0.15, lowPerformance ? 6 : 8, false]} />
        <meshStandardMaterial color="#7AA398" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Strand 2 */}
      <mesh ref={strand2Ref}>
        <tubeGeometry args={[strand2Curve, 64, 0.15, lowPerformance ? 6 : 8, false]} />
        <meshStandardMaterial color="#7AA398" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Rungs */}
      <group ref={rungsRef}>
        {rungs.map((rung, i) => {
          const midpoint = new THREE.Vector3()
            .addVectors(rung.start, rung.end)
            .multiplyScalar(0.5);
          const direction = new THREE.Vector3().subVectors(rung.end, rung.start);
          const length = direction.length();
          const isHovered = hoveredMarker === rung.marker?.rsid;

          return (
            <group key={i} position={midpoint}>
              <mesh
                rotation={[
                  0,
                  Math.atan2(direction.z, direction.x),
                  Math.atan2(direction.y, Math.sqrt(direction.x ** 2 + direction.z ** 2)),
                ]}
                scale={isHovered ? [1.2, 1.2, 1.2] : [1, 1, 1]}
                onPointerEnter={() => rung.marker && setHoveredMarker(rung.marker.rsid)}
                onPointerLeave={() => setHoveredMarker(null)}
              >
                <cylinderGeometry args={[0.08, 0.08, length, lowPerformance ? 6 : 8]} />
                <meshStandardMaterial
                  color={getRungColor(rung.recommendation)}
                  metalness={0.2}
                  roughness={0.6}
                  emissive={getRungColor(rung.recommendation)}
                  emissiveIntensity={isHovered ? 0.3 : 0.1}
                />
              </mesh>

              {/* Tooltip on hover */}
              {isHovered && rung.marker && (
                <Html distanceFactor={10} position={[0, 0.5, 0]} center>
                  <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200 min-w-[200px] pointer-events-none">
                    <p className="font-semibold text-sm text-gray-900">
                      {rung.marker.gene || 'Unknown Gene'}
                    </p>
                    <p className="text-xs text-gray-600">{rung.marker.rsid}</p>
                    <p className="text-xs text-gray-800 mt-1">
                      Genotype: <span className="font-medium">{rung.marker.genotype}</span>
                    </p>
                    {rung.recommendation && (
                      <div className="mt-1 pt-1 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          Confidence:{' '}
                          <span className="font-medium">{rung.recommendation.confidence}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </Html>
              )}
            </group>
          );
        })}
      </group>
    </group>
  );
};

export const Helix3D: React.FC<HelixProps> = ({
  markers = [],
  recommendations = [],
  animate = true,
  lowPerformance = false,
}) => {
  // If no markers, show sample data
  const displayMarkers = markers.length > 0 ? markers : [
    { rsid: 'rs1065852', gene: 'CYP2D6', genotype: 'CT' },
    { rsid: 'rs1799853', gene: 'CYP2C9', genotype: 'CC' },
    { rsid: 'rs4244285', gene: 'CYP2C19', genotype: 'GG' },
    { rsid: 'rs776746', gene: 'CYP3A5', genotype: 'AG' },
    { rsid: 'rs9923231', gene: 'VKORC1', genotype: 'AA' },
  ];

  return (
    <div className="w-full h-full min-h-[400px] relative">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ antialias: !lowPerformance }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />
        <pointLight position={[0, 0, 0]} intensity={0.5} />

        {/* Helix */}
        <HelixGeometry
          markers={displayMarkers}
          recommendations={recommendations}
          animate={animate}
          lowPerformance={lowPerformance}
        />

        {/* Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={5}
          maxDistance={20}
          autoRotate={false}
        />
      </Canvas>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <p className="text-xs font-semibold text-gray-700 mb-2">Risk Level</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600" />
            <span className="text-xs text-gray-600">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-xs text-gray-600">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600" />
            <span className="text-xs text-gray-600">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-gray-600">No Finding</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Hover over rungs for details</p>
      </div>
    </div>
  );
};

