import React, { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { OrthographicCamera, OrbitControls } from '@react-three/drei'


// Custom Orthographic Camera that uses the canvas size for bounds.
// function MyOrthoCamera(props) {
//     const { size } = useThree()
//     return (
//         <OrthographicCamera
//             makeDefault
//             position={[0, 0, 0]}
//             zoom={100}
//             near={0.1}
//             far={-5}
//             left={-size.width / 2}
//             right={size.width / 2}
//             top={size.height / 2}
//             bottom={-size.height / 2}
//             {...props}
//         />
//     )
// }

// Map x position to a rainbow colour (HSL).
// x = -maxX => blue (240°)
// x = -maxX/2 => green (120°)
// x = 0      => yellow (60°)
// x = maxX/2 => orange (30°)
// x = maxX   => red (0°)
function getRainbowColor(x, maxX) {
    const norm = (x + maxX) / (2 * maxX) // normalize x to [0, 1]
    let hue
    if (norm < 0.25) {
        const t = norm / 0.25
        hue = 240 + t * (120 - 240) // blue to green
    } else if (norm < 0.5) {
        const t = (norm - 0.25) / 0.25
        hue = 120 + t * (60 - 120)  // green to yellow
    } else if (norm < 0.75) {
        const t = (norm - 0.5) / 0.25
        hue = 60 + t * (30 - 60)    // yellow to orange
    } else {
        const t = (norm - 0.75) / 0.25
        hue = 30 + t * (0 - 30)     // orange to red
    }
    return new THREE.Color().setHSL(hue / 360, 1, 0.5)
}

// Gaussian random number using Box-Muller transform.
function gaussianRandom(stdDev = 1) {
    let u = 0, v = 0
    while (u === 0) u = Math.random()
    while (v === 0) v = Math.random()
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev
}

// Biased X using a Gaussian distribution.
function biasedX(maxX) {
    const val = gaussianRandom(maxX / 2)
    return Math.max(-maxX, Math.min(maxX, val))
}

// Biased radius using a Gaussian centered on the middle.
function biasedRadius(min, max) {
    const mean = (min + max) / 2
    const stdDev = (max - min) / 3
    const value = gaussianRandom(stdDev) + mean
    return Math.max(min, Math.min(max, value))
}

// A single cube that orbits around the horizontal (X) axis.
// Now rendered as a group with both a filled mesh and a wireframe outline.
function MovingCube({ x, initialAngle, radius, speed, blockSize, maxX }) {
    const groupRef = useRef()
    const filledMeshRef = useRef()
    const angleRef = useRef(initialAngle)
    // Pre-calculate the base rainbow colour based on x.
    const baseColor = getRainbowColor(x, maxX)

    useFrame((state, delta) => {
        angleRef.current += speed * delta
        const y = radius * Math.cos(angleRef.current)
        const z = radius * Math.sin(angleRef.current)
        if (groupRef.current) {
            groupRef.current.position.set(x, y, z)

            // Compute brightness boost based on distance along z from the camera.
            // Use a simple difference: if the cube is behind the camera (z negative relative to the camera),
            // backstop the value to maxDistance so it does not get boosted.
            const cameraZ = state.camera.position.z
            let distance = groupRef.current.position.z - cameraZ
           //console.log('distance', distance)
            const maxDistance = 0  // adjust to control the brightness falloff
            const minDistance = -15
            if (distance > 0) distance = maxDistance  // backstop: if behind the camera, use max distance
            if (distance < minDistance) distance = minDistance  // backstop: if too far, use max distance
            const factor = THREE.MathUtils.clamp(distance / minDistance, 0, 1)
           console.log('factor', factor)
            // Map factor to lightness: near the camera (factor=1) -> lightness 0.9; far away -> base lightness 0.5.
            const newLightness = 0.5 - 0.5 * factor
            const hsl = {}
            baseColor.getHSL(hsl)
            const vibrantColor = new THREE.Color().setHSL(hsl.h, hsl.s, newLightness)
            if (filledMeshRef.current) {
                filledMeshRef.current.material.color.copy(vibrantColor)
            }
        }
    })

    return (
        <group ref={groupRef} rotation={[0, 0, 0]}>
            {/* Filled cube */}
            <mesh ref={filledMeshRef}>
                <boxGeometry args={[blockSize, blockSize, blockSize]} />
                <meshStandardMaterial color={baseColor} metalness={0} roughness={0.2} />
            </mesh>
            {/* Wireframe outline */}
            <mesh>
                <boxGeometry args={[blockSize, blockSize, blockSize]} />
                <meshBasicMaterial
                    color="#022"
                    wireframe={true}
                    polygonOffset={true}
                    polygonOffsetFactor={-1}
                    polygonOffsetUnits={-1}
                />
            </mesh>
        </group>
    )
}

function TornadoColumn({ cubeCount = 120 }) {
    const cubes = []
    const blockSize = 0.15
    const maxX = 5  // maximum absolute x value

    const minRadius = 1
    const maxRadius = 2.5

    for (let i = 0; i < cubeCount; i++) {
        const x = biasedX(maxX)
        const radius = biasedRadius(minRadius, maxRadius)
        const initialAngle = Math.random() * 2 * Math.PI
        const speed = 1 / radius  // speed proportional to orbit radius
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
        <Canvas
            style={{ width: '100vw', height: '100vh', backgroundColor: '#022' }}
            camera={{ position: [0, 0, 15], fov: 35, near: 0.1, far: 100 }}
        >
            {/* <MyOrthoCamera /> */}
            <ambientLight intensity={1} />
            <pointLight position={[10, 10, 10]} intensity={1.2} />
            <TornadoColumn cubeCount={1000} />
            <OrbitControls />
        </Canvas>
    )
}