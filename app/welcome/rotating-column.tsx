import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { OrbitControls } from '@react-three/drei'


// Optional: If you installed drei, you can import extra helpers:
// import { OrbitControls } from '@react-three/drei'

function RotatingColumn() {
  const groupRef = useRef()

  // Rotate the entire group a little each frame
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.01
    }
  })

  // Create a bunch of cubes arranged around the Y-axis
  const cubes = []
  const cubeCount = 1000
  const radius = 2
  const width = 6

  for (let i = 0; i < cubeCount; i++) {
    // Random angle around the central axis
    const angle = Math.random() * 2 * Math.PI
      const y = (Math.random()) * radius * Math.cos(angle)
      const z = (Math.random()) * radius * Math.sin(angle)

    // Random horizontal position within the column width
    const x = (Math.random() - 0.5) * width

    // Assign a random colour or gradient logic
    const color = new THREE.Color(`hsl(${Math.random() * 360}, 100%, 50%)`)

    cubes.push(
      <mesh key={i} position={[x, y, z]}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
    )
  }

  return <group ref={groupRef}>{cubes}</group>
}

export default function App() {
  return (
    <Canvas style={{ height: '100vh' }}>
      {/* A simple ambient and point light for illumination */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} />

      {/* Uncomment if using OrbitControls for camera interaction */}
      <OrbitControls />

      <RotatingColumn />
    </Canvas>
  )
}