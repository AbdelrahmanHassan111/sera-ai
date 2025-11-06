/**
 * Medical & Genetics Themed Floating 3D Elements
 * DNA helices, molecules, pills, cells, and medical symbols
 */

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Torus, Cylinder, TorusKnot } from '@react-three/drei';
import * as THREE from 'three';

// Mini DNA Helix
const MiniDNAHelix: React.FC<{ position: [number, number, number]; color: string }> = ({ position, color }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += 0.01;
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.3;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Helix strands */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        const y = i * 0.3 - 0.6;
        return (
          <React.Fragment key={i}>
            <Sphere position={[Math.cos(angle) * 0.3, y, Math.sin(angle) * 0.3]} args={[0.08, 16, 16]}>
              <meshPhysicalMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.5}
                metalness={0.9}
                roughness={0.1}
              />
            </Sphere>
            <Sphere position={[Math.cos(angle + Math.PI) * 0.3, y, Math.sin(angle + Math.PI) * 0.3]} args={[0.08, 16, 16]}>
              <meshPhysicalMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.5}
                metalness={0.9}
                roughness={0.1}
              />
            </Sphere>
          </React.Fragment>
        );
      })}
    </group>
  );
};

// Pill/Capsule
const Pill: React.FC<{ position: [number, number, number]; color1: string; color2: string }> = ({ position, color1, color2 }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.x += 0.01;
    groupRef.current.rotation.z += 0.005;
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6 + position[0]) * 0.4;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Cylinder body */}
      <Cylinder args={[0.2, 0.2, 0.8, 16]} rotation={[0, 0, Math.PI / 2]}>
        <meshPhysicalMaterial
          color={color1}
          metalness={0.8}
          roughness={0.2}
          emissive={color1}
          emissiveIntensity={0.3}
        />
      </Cylinder>
      {/* Cap 1 */}
      <Sphere position={[0.4, 0, 0]} args={[0.2, 16, 16]}>
        <meshPhysicalMaterial
          color={color2}
          metalness={0.8}
          roughness={0.2}
          emissive={color2}
          emissiveIntensity={0.3}
        />
      </Sphere>
      {/* Cap 2 */}
      <Sphere position={[-0.4, 0, 0]} args={[0.2, 16, 16]}>
        <meshPhysicalMaterial
          color={color1}
          metalness={0.8}
          roughness={0.2}
          emissive={color1}
          emissiveIntensity={0.3}
        />
      </Sphere>
    </group>
  );
};

// Molecule (connected spheres)
const Molecule: React.FC<{ position: [number, number, number]; color: string }> = ({ position, color }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.x += 0.008;
    groupRef.current.rotation.y += 0.012;
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.7 + position[0]) * 0.5;
  });

  const atoms = [
    { pos: [0, 0, 0], size: 0.25 },
    { pos: [0.4, 0.3, 0], size: 0.15 },
    { pos: [-0.4, 0.3, 0], size: 0.15 },
    { pos: [0, -0.4, 0.3], size: 0.18 },
    { pos: [0.3, 0, -0.4], size: 0.12 },
  ];

  return (
    <group ref={groupRef} position={position}>
      {atoms.map((atom, i) => (
        <Sphere key={i} position={atom.pos as any} args={[atom.size, 16, 16]}>
          <meshPhysicalMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={0.8}
          />
        </Sphere>
      ))}
    </group>
  );
};

// Cell (sphere with nucleus)
const Cell: React.FC<{ position: [number, number, number]; color: string }> = ({ position, color }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += 0.005;
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.4 + position[0]) * 0.3;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Cell membrane */}
      <Sphere args={[0.5, 32, 32]}>
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.4}
          metalness={0.5}
          roughness={0.3}
          transmission={0.6}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </Sphere>
      {/* Nucleus */}
      <Sphere args={[0.2, 16, 16]}>
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>
    </group>
  );
};

// Medical Cross
const MedicalCross: React.FC<{ position: [number, number, number]; color: string }> = ({ position, color }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z += 0.01;
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.4;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Vertical bar */}
      <Cylinder args={[0.08, 0.08, 0.8, 16]}>
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </Cylinder>
      {/* Horizontal bar */}
      <Cylinder args={[0.08, 0.08, 0.6, 16]} rotation={[0, 0, Math.PI / 2]}>
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </Cylinder>
    </group>
  );
};

// Chromosome (X shape)
const Chromosome: React.FC<{ position: [number, number, number]; color: string }> = ({ position, color }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z += 0.015;
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.55 + position[0]) * 0.35;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* X shape using two cylinders */}
      <Cylinder args={[0.06, 0.06, 1, 16]} rotation={[0, 0, Math.PI / 4]}>
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </Cylinder>
      <Cylinder args={[0.06, 0.06, 1, 16]} rotation={[0, 0, -Math.PI / 4]}>
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </Cylinder>
    </group>
  );
};

export const FloatingElements3D: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" style={{ height: '100vh', width: '100vw' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        {/* Enhanced lighting for medical theme */}
        <ambientLight intensity={1.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#4A90E2" />
        <pointLight position={[-10, -10, -10]} intensity={1.2} color="#6C63FF" />
        <pointLight position={[10, -10, 10]} intensity={1} color="#00D9A3" />
        <pointLight position={[-10, 10, -10]} intensity={1} color="#FF69B4" />
        <spotLight position={[0, 15, 0]} angle={0.5} penumbra={1} intensity={0.8} color="#FFD700" />
        
        {/* Mini DNA Helices */}
        <MiniDNAHelix position={[-7, 2, -6]} color="#4A90E2" />
        <MiniDNAHelix position={[7, -2, -7]} color="#6C63FF" />
        <MiniDNAHelix position={[0, 3, -9]} color="#00D9A3" />
        
        {/* Pills/Capsules */}
        <Pill position={[-5, -3, -5]} color1="#FF69B4" color2="#FFD700" />
        <Pill position={[6, 4, -8]} color1="#4A90E2" color2="#7AB8FF" />
        <Pill position={[-3, 1, -10]} color1="#10B981" color2="#4DFFCC" />
        
        {/* Molecules */}
        <Molecule position={[8, -1, -6]} color="#6C63FF" />
        <Molecule position={[-8, -4, -8]} color="#00FFFF" />
        <Molecule position={[4, 2, -9]} color="#FFA500" />
        
        {/* Cells */}
        <Cell position={[-6, 0, -7]} color="#00D9A3" />
        <Cell position={[5, -4, -6]} color="#7AB8FF" />
        <Cell position={[2, 4, -10]} color="#9990FF" />
        
        {/* Medical Crosses */}
        <MedicalCross position={[3, -2, -5]} color="#FF6347" />
        <MedicalCross position={[-4, 3, -8]} color="#00C9A7" />
        
        {/* Chromosomes */}
        <Chromosome position={[-2, -1, -9]} color="#FF1493" />
        <Chromosome position={[7, 1, -7]} color="#FFD700" />
      </Canvas>
    </div>
  );
};
