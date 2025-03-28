import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { OrbitControls } from '@react-three/drei'

// Helper to map x position to a rainbow colour.
// The mapping is piecewise so that:
//   x = -maxX => blue (240°)
//   x = -maxX/2 => green (120°)
//   x = 0      => yellow (60°)
//   x = maxX/2 => orange (30°)
//   x = maxX   => red (0°)
function getRainbowColor(x, maxX) {
    const norm = (x + maxX) / (2 * maxX)  // normalize x to [0, 1]
    let hue
    if (norm < 0.25) {
        const t = norm / 0.25
        hue = 240 + t * (120 - 240) // from 240 (blue) to 120 (green)
    } else if (norm < 0.5) {
        const t = (norm - 0.25) / 0.25
        hue = 120 + t * (60 - 120)  // from 120 (green) to 60 (yellow)
    } else if (norm < 0.75) {
        const t = (norm - 0.5) / 0.25
        hue = 60 + t * (30 - 60)    // from 60 (yellow) to 30 (orange)
    } else {
        const t = (norm - 0.75) / 0.25
        hue = 30 + t * (0 - 30)     // from 30 (orange) to 0 (red)
    }
    return new THREE.Color().setHSL(hue / 360, 1, 0.5)
}

// Gaussian random number using the Box-Muller transform.
// stdDev is set so that ~99.7% of values fall within [-maxX, maxX] when multiplied by (maxX/3).
function gaussianRandom(stdDev = 1) {
    let u = 0, v = 0
    while (u === 0) u = Math.random() // avoid zero
    while (v === 0) v = Math.random()
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev
}

// New biased X using a Gaussian distribution.
function biasedX(maxX) {
    const val = gaussianRandom(maxX / 3)
    return Math.max(-maxX, Math.min(maxX, val))
}

// New helper to generate a biased radius using a Gaussian distribution.
// It centres on the middle of the range with stdDev = (max - min)/3.
function biasedRadius(min, max) {
    const mean = (min + max) / 2
    const stdDev = (max - min) / 3
    const value = gaussianRandom(stdDev) + mean
    return Math.max(min, Math.min(max, value))
}

// A single cube that orbits around the horizontal (X) axis.
function MovingCube({ x, initialAngle, radius, speed, blockSize, maxX }) {
    const meshRef = useRef()
    const angleRef = useRef(initialAngle)

    useFrame((state, delta) => {
        angleRef.current += speed * delta
        const y = radius * Math.cos(angleRef.current)
        const z = radius * Math.sin(angleRef.current)
        if (meshRef.current) {
            meshRef.current.position.set(x, y, z)
        }
    })

    // Determine colour based on x position.
    const color = getRainbowColor(x, maxX)

    return (
        <mesh ref={meshRef} rotation={[0, 0, 0]}>
            <boxGeometry args={[blockSize, blockSize, blockSize]} />
            <meshStandardMaterial color={color} />
        </mesh>
    )
}

function TornadoColumn({ cubeCount = 120 }) {
    const cubes = []
    const blockSize = 0.15
    const maxX = 5  // maximum absolute x value
    const randBetween = (min, max) => Math.random() * (max - min) + min

    // Define radial range in the YZ plane.
    const minRadius = 1
    const maxRadius = 2.5

    for (let i = 0; i < cubeCount; i++) {
        const x = biasedX(maxX)
        //const radius = randBetween(minRadius, maxRadius)
        // Use the biasedRadius helper instead of a uniform random.
        const radius = biasedRadius(minRadius, maxRadius)
        const initialAngle = Math.random() * 2 * Math.PI
        const speed = radius // speed directly proportional to radius
        cubes.push(
            <MovingCube
                key={i}
                x={x}
                initialAngle={initialAngle}
                radius={radius}
                speed={speed}
                blockSize={blockSize}
                maxX={maxX}
            />
        )
    }
    return <group>{cubes}</group>
}

export default function App() {
    return (
        <Canvas style={{ width: '100vw', height: '100vh', backgroundColor: '#022' }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} />
            <TornadoColumn cubeCount={1000} />
            <OrbitControls />
        </Canvas>
    )
}
