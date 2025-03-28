import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { OrbitControls } from '@react-three/drei'

// A single cube that orbits around the horizontal (X) axis
function MovingCube({ x, initialAngle, radius, speed, color, rotation, blockSize }) {
    const meshRef = useRef()
    const angleRef = useRef(initialAngle)

    // Update the cube's position on each frame without altering its own rotation.
    useFrame((state, delta) => {
        angleRef.current += speed * delta
        const y = radius * Math.cos(angleRef.current)
        const z = radius * Math.sin(angleRef.current)
        if (meshRef.current) {
            meshRef.current.position.set(x, y, z)
        }
    })

    return (
        <mesh ref={meshRef} rotation={rotation}>
            <boxGeometry args={[blockSize, blockSize, blockSize]} />
            <meshStandardMaterial color={color} />
        </mesh>
    )
}

function TornadoColumn({ cubeCount = 120 }) {
    const cubes = []
    const blockSize = 0.15

    // Simple helper for random values
    const randBetween = (min, max) => Math.random() * (max - min) + min

    // Generate an x coordinate biased toward 0.
    // Squaring a uniform random number (and applying a random sign)
    // clusters values near 0.
    const biasedX = () => {
        const sign = Math.random() < 0.5 ? -1 : 1
        return sign * (Math.random() ** 2) * 5
    }


    // Define minimum and maximum radii for the cubes
    const minRadius = 1
    const maxRadius = 2
    for (let i = 0; i < cubeCount; i++) {
        // X position along the horizontal pipe/column
       // const x = randBetween(-4, 4)
        const x = biasedX()
        // Biased random radius using a squared random to cluster near the centre:
        //const radius = minRadius + (maxRadius - minRadius) * Math.pow(Math.random(), 2)
        // Distance from the central X-axis (affects orbit radius)
        const radius = randBetween(1.5, 2)
        // Random starting angle
        const initialAngle = Math.random() * 2 * Math.PI
        // Orbit speed proportional to radius (further cubes move faster)
        const speed = 1 //radius; //2;
        // Colour for the cube (random hue)
        const color = new THREE.Color(`hsl(${Math.random() * 360}, 100%, 50%)`)
        // Fixed rotation so cubes don't rotate themselves
        const rotation = [0, 0, 0]

        cubes.push(
            <MovingCube
                key={i}
                x={x}
                initialAngle={initialAngle}
                radius={radius}
                speed={speed}
                color={color}
                rotation={rotation}
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
            <TornadoColumn cubeCount={2000} />
            <OrbitControls />
        </Canvas>
    )
}
