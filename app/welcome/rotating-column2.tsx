import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { OrbitControls } from '@react-three/drei'

function RotatingColumn() {
    const groupRef = useRef()

    // Rotate the entire group
    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.01
        }
    })

    const blockSize = 0.2           // cube edge length
    const cubesPerRing = 12        // how many cubes around one ring
    const ringCount = 10           // how many rings stacked
    const spacingFactor = 1.1      // vertical spacing multiplier
    // Approximate radius so cubes fit side-by-side around circumference
    const radius = (cubesPerRing * blockSize) / (2 * Math.PI)

    const cubes = []
    for (let ring = 0; ring < ringCount; ring++) {
        // Y position for each ring (slightly more than blockSize to avoid overlap)
        const y = ring * blockSize * spacingFactor

        for (let i = 0; i < cubesPerRing; i++) {
            // Evenly space each cube around the ring
            const angle = (i / cubesPerRing) * 2 * Math.PI
            const x = radius * Math.cos(angle)
            const z = radius * Math.sin(angle)

            // Example colour logic (rainbow by angle)
            const hue = (i / cubesPerRing) * 360
            const color = new THREE.Color(`hsl(${hue}, 100%, 50%)`)

            cubes.push(
                <mesh key={`${ring}-${i}`} position={[x, y, z]}>
                    <boxGeometry args={[blockSize, blockSize, blockSize]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            )
        }
    }

    return <group ref={groupRef}>{cubes}</group>
}

export default function App() {
    return (
        <Canvas style={{ height: '100vh' }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} />
            <RotatingColumn />
            <OrbitControls />
        </Canvas>
    )
}