/**
 * Enhanced 3D DNA Helix with Advanced Controls
 * Fullscreen, perspective views, marker information
 */

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2, RotateCcw, Info, Eye, Layers } from 'lucide-react';
import type { GeneticMarker, Recommendation } from '@/types/domain';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface Helix3DEnhancedProps {
  markers?: GeneticMarker[];
  recommendations?: Recommendation[];
  animate?: boolean;
}

interface HelixGeometryProps {
  markers: GeneticMarker[];
  recommendations: Recommendation[];
  animate: boolean;
}

const HelixGeometry: React.FC<HelixGeometryProps> = ({ markers, recommendations, animate }) => {
  const strand1Ref = useRef<THREE.Mesh>(null);
  const strand2Ref = useRef<THREE.Mesh>(null);
  const rungsRef = useRef<THREE.Group>(null);
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);

  // Animation
  useFrame((state) => {
    if (!animate) return;
    if (strand1Ref.current) {
      strand1Ref.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
    if (strand2Ref.current) {
      strand2Ref.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
    if (rungsRef.current) {
      rungsRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
  });

  // Generate helix geometry
  const { strand1Points, strand2Points, rungs } = useMemo(() => {
    const numTurns = 4;
    const pointsPerTurn = 50;
    const totalPoints = numTurns * pointsPerTurn;
    const height = 10;
    const radius = 1.8;

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

      // Create rungs
      if (i % 3 === 0) {
        const rungIndex = Math.floor(i / 3);
        const marker = markers[rungIndex % markers.length];
        const rec = marker ? recommendations.find((r) => r.rsid === marker.rsid) : undefined;

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
  }, [markers, recommendations]);

  // Create tube curves
  const strand1Curve = useMemo(() => new THREE.CatmullRomCurve3(strand1Points), [strand1Points]);
  const strand2Curve = useMemo(() => new THREE.CatmullRomCurve3(strand2Points), [strand2Points]);

  const getRungColor = (rec?: Recommendation): string => {
    if (!rec) return '#4A90E2';
    switch (rec.confidence) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#4A90E2';
    }
  };

  return (
    <group>
      {/* Strand 1 */}
      <mesh ref={strand1Ref}>
        <tubeGeometry args={[strand1Curve, 128, 0.18, 12, false]} />
        <meshPhysicalMaterial
          color="#4A90E2"
          metalness={0.8}
          roughness={0.2}
          emissive="#4A90E2"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Strand 2 */}
      <mesh ref={strand2Ref}>
        <tubeGeometry args={[strand2Curve, 128, 0.18, 12, false]} />
        <meshPhysicalMaterial
          color="#6C63FF"
          metalness={0.8}
          roughness={0.2}
          emissive="#6C63FF"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Rungs */}
      <group ref={rungsRef}>
        {rungs.map((rung, i) => {
          const midpoint = new THREE.Vector3().addVectors(rung.start, rung.end).multiplyScalar(0.5);
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
                scale={isHovered ? [1.3, 1.3, 1.3] : [1, 1, 1]}
                onPointerEnter={() => rung.marker && setHoveredMarker(rung.marker.rsid)}
                onPointerLeave={() => setHoveredMarker(null)}
              >
                <cylinderGeometry args={[0.1, 0.1, length, 12]} />
                <meshPhysicalMaterial
                  color={getRungColor(rung.recommendation)}
                  metalness={0.7}
                  roughness={0.3}
                  emissive={getRungColor(rung.recommendation)}
                  emissiveIntensity={isHovered ? 0.6 : 0.2}
                />
              </mesh>

              {/* Enhanced Tooltip */}
              {isHovered && rung.marker && (
                <Html distanceFactor={8} position={[0, 0.8, 0]} center>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/95 backdrop-blur-lg px-4 py-3 rounded-xl shadow-elevated border-2 border-primary/30 min-w-[280px] pointer-events-none"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-bold text-lg text-primary">
                        {rung.marker.gene || 'Unknown Gene'}
                      </p>
                      {rung.recommendation && (
                        <Badge
                          variant={
                            rung.recommendation.confidence === 'high'
                              ? 'danger'
                              : rung.recommendation.confidence === 'medium'
                              ? 'warning'
                              : 'success'
                          }
                          size="sm"
                        >
                          {rung.recommendation.confidence}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-text-muted mb-1">Variant: {rung.marker.rsid}</p>
                    <p className="text-sm text-text mb-2">
                      Genotype: <span className="font-bold text-primary">{rung.marker.genotype}</span>
                    </p>
                    {rung.recommendation && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs font-semibold text-text mb-1">Finding:</p>
                        <p className="text-xs text-text-secondary line-clamp-2">
                          {rung.recommendation.explanation}
                        </p>
                      </div>
                    )}
                    {rung.marker.note && (
                      <p className="text-xs text-text-muted mt-2 italic">
                        Note: {rung.marker.note}
                      </p>
                    )}
                  </motion.div>
                </Html>
              )}
            </group>
          );
        })}
      </group>
    </group>
  );
};

export const Helix3DEnhanced: React.FC<Helix3DEnhancedProps> = ({
  markers = [],
  recommendations = [],
  animate = true,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cameraPreset, setCameraPreset] = useState<'default' | 'top' | 'side' | 'close'>('default');
  const [showInfo, setShowInfo] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Camera positions
  const cameraPositions = {
    default: [0, 0, 12] as [number, number, number],
    top: [0, 15, 0] as [number, number, number],
    side: [15, 0, 0] as [number, number, number],
    close: [0, 0, 6] as [number, number, number],
  };

  const displayMarkers = markers.length > 0 ? markers : [
    { rsid: 'rs1065852', gene: 'CYP2D6', genotype: 'CT' },
    { rsid: 'rs1799853', gene: 'CYP2C9', genotype: 'CC' },
    { rsid: 'rs4244285', gene: 'CYP2C19', genotype: 'GG' },
    { rsid: 'rs776746', gene: 'CYP3A5', genotype: 'AG' },
    { rsid: 'rs9923231', gene: 'VKORC1', genotype: 'AA' },
  ];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleReset = () => {
    setCameraPreset('default');
  };

  const highRiskCount = recommendations.filter(r => r.confidence === 'high').length;
  const medRiskCount = recommendations.filter(r => r.confidence === 'medium').length;
  const lowRiskCount = recommendations.filter(r => r.confidence === 'low').length;

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] relative bg-gradient-to-br from-bg/50 to-primary/5 rounded-2xl overflow-hidden border-2 border-primary/20">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleFullscreen}
          className="p-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-md hover:shadow-glow transition-all border border-primary/20"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5 text-primary" /> : <Maximize2 className="w-5 h-5 text-primary" />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleReset}
          className="p-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-md hover:shadow-glow transition-all border border-primary/20"
          title="Reset View"
        >
          <RotateCcw className="w-5 h-5 text-primary" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowInfo(!showInfo)}
          className={cn(
            "p-3 backdrop-blur-sm rounded-xl shadow-md hover:shadow-glow transition-all border",
            showInfo ? "bg-primary text-white border-primary" : "bg-white/90 text-primary border-primary/20"
          )}
          title="Toggle Info"
        >
          <Info className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Perspective Preset Buttons */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        {(['default', 'top', 'side', 'close'] as const).map((preset) => (
          <motion.button
            key={preset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCameraPreset(preset)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold transition-all backdrop-blur-sm",
              cameraPreset === preset
                ? "bg-gradient-to-r from-primary to-secondary text-white shadow-glow"
                : "bg-white/90 text-primary border border-primary/20"
            )}
          >
            {preset.charAt(0).toUpperCase() + preset.slice(1)} View
          </motion.button>
        ))}
      </div>

      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-elevated max-w-xs border-2 border-primary/20"
          >
            <h4 className="font-bold text-sm text-text mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Genetic Markers
            </h4>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Total Markers:</span>
                <span className="font-bold text-primary">{displayMarkers.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Recommendations:</span>
                <span className="font-bold text-secondary">{recommendations.length}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="font-semibold text-xs mb-2">Risk Levels:</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-danger shadow-sm" />
                  <span className="text-xs">High Risk: {highRiskCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-warning shadow-sm" />
                  <span className="text-xs">Medium Risk: {medRiskCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-success shadow-sm" />
                  <span className="text-xs">Low Risk: {lowRiskCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-primary shadow-sm" />
                  <span className="text-xs">No Finding: {displayMarkers.length - recommendations.length}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-text-muted italic">
                💡 Hover over rungs for details
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Canvas */}
      <Canvas camera={{ position: cameraPositions[cameraPreset], fov: 50 }}>
        {/* Enhanced Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={0.8} color="#4A90E2" />
        <pointLight position={[5, 5, 5]} intensity={0.6} color="#6C63FF" />
        <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={0.5} color="#00D9A3" />

        {/* Helix */}
        <HelixGeometry
          markers={displayMarkers}
          recommendations={recommendations}
          animate={animate}
        />

        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          minDistance={4}
          maxDistance={25}
          autoRotate={false}
        />
      </Canvas>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md text-xs text-text-muted">
        🖱️ Drag to rotate • Scroll to zoom • Hover for details
      </div>
    </div>
  );
};

