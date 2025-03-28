import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Single cube component that orbits around the x-axis.
function MovingCube({ x, initialAngle, radius, speed, color, blockSize }) {
    const meshRef = useRef()
    const angleRef = useRef(initialAngle)

    // Update the cube's position each frame, orbiting around the x-axis.
    useFrame((state, delta) => {
        angleRef.current += speed * delta
        const y = radius * Math.cos(angleRef.current)
        const z = radius * Math.sin(angleRef.current)
        if (meshRef.current) {
            meshRef.current.position.set(x, y, z)
        }
    })

    return (
        <mesh ref={meshRef} rotation={[0, 0, 0]}>
            <boxGeometry args={[blockSize, blockSize, blockSize]} />
            <meshStandardMaterial color={color} />
        </mesh>
    )
}

function TornadoColumn({ cubeCount = 100 }) {
    const cubes = []
    const blockSize = 0.2

    // Helper to return a uniform random value.
    const randBetween = (min, max) => Math.random() * (max - min) + min

    // Generate an x coordinate biased toward 0.
    // Squaring a uniform random number (and applying a random sign)
    // clusters values near 0.
    const biasedX = () => {
        const sign = Math.random() < 0.5 ? -1 : 1
        return sign * (Math.random() ** 2) * 5
    }

    // Define the radial range in the yz-plane.
    const minRadius = 0.5
    const maxRadius = 2

    for (let i = 0; i < cubeCount; i++) {
        const x = biasedX()
        const radius = randBetween(minRadius, maxRadius)
        const initialAngle = Math.random() * 2 * Math.PI
        // Rotation speed is directly proportional to the orbit radius.
        const speed = radius * 1.5
        const color = new THREE.Color(`hsl(${Math.random() * 360}, 100%, 50%)`)

        cubes.push(
            <MovingCube
                key={i}
                x={x}
                initialAngle={initialAngle}
                radius={radius}
                speed={speed}
                color={color}
                blockSize={blockSize}
            />
        )
    }

    return <group>{cubes}</group>
}

export default function App() {
    return (
        <Canvas style={{ width: '100vw', height: '100vh' }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} />
            <TornadoColumn cubeCount={120} />
        </Canvas>
    )
}
