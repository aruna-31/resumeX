import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
    Float,
    MeshDistortMaterial,
    Sphere,
    PerspectiveCamera,
    ContactShadows
} from '@react-three/drei';
import * as THREE from 'three';

const NeuralCore = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const wireRef = useRef<THREE.Mesh>(null);

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.x += 0.002;
            meshRef.current.rotation.y += 0.003;
        }
        if (wireRef.current) {
            wireRef.current.rotation.x -= 0.001;
            wireRef.current.rotation.y -= 0.002;
        }
    });

    return (
        <group>
            {/* Central Distorted Core */}
            <Float speed={2} rotationIntensity={1} floatIntensity={2}>
                <Sphere ref={meshRef} args={[1, 64, 64]} scale={1.5}>
                    <MeshDistortMaterial
                        color="#3b82f6"
                        speed={3}
                        distort={0.4}
                        radius={1}
                        emissive="#1e40af"
                        emissiveIntensity={0.5}
                        roughness={0.2}
                        metalness={0.9}
                    />
                </Sphere>

                {/* Outer Wireframe Mesh */}
                <Sphere ref={wireRef} args={[1.05, 32, 32]} scale={1.6}>
                    <meshPhongMaterial
                        color="#6366f1"
                        wireframe
                        transparent
                        opacity={0.15}
                        emissive="#4f46e5"
                        emissiveIntensity={2}
                    />
                </Sphere>
            </Float>

            {/* Atmospheric Particles */}
            <Particles count={150} />

            {/* Lighting Suite */}
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#6366f1" />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#3b82f6" />
            <ambientLight intensity={0.2} />
        </group>
    );
};

const generateParticles = (count: number) => {
    const positions = new Float32Array(count * 3);
    const limit = count * 3;
    for (let i = 0; i < limit; i++) {
        positions[i] = (Math.random() - 0.5) * 15;
    }
    return positions;
};

const Particles = ({ count }: { count: number }) => {
    const points = useRef<THREE.Points>(null);

    const particlesPosition = useMemo(() => generateParticles(count), [count]);

    useFrame(() => {
        if (points.current) {
            points.current.rotation.y += 0.0005;
            points.current.rotation.x += 0.0003;
        }
    });

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    args={[particlesPosition, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                color="#ffffff"
                transparent
                opacity={0.4}
                sizeAttenuation
            />
        </points>
    );
};

export const Scene = () => {
    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
            <NeuralCore />
            <ContactShadows
                position={[0, -4, 0]}
                opacity={0.4}
                scale={20}
                blur={2}
                far={4.5}
            />
        </>
    );
};
