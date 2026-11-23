import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * A dark product-photography studio baked into an environment map:
 * mostly black surround with a few bright soft boxes, so glass reads as glass
 * (sharp strip highlights) instead of a milky white RoomEnvironment.
 */
function buildStudio() {
  const scene = new THREE.Scene()

  const panel = (hex, intensity, w, h, pos, rot) => {
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(hex).multiplyScalar(intensity),
      side: THREE.DoubleSide,
    })
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat)
    mesh.position.set(...pos)
    mesh.rotation.set(...rot)
    scene.add(mesh)
  }

  // dark shell
  const shell = new THREE.Mesh(
    new THREE.BoxGeometry(40, 40, 40),
    new THREE.MeshBasicMaterial({ color: '#0d0308', side: THREE.BackSide })
  )
  scene.add(shell)

  // Narrow strips only: a broad front panel would wash the whole bottle white
  // instead of giving glass the vertical highlights product shots are known for.
  panel('#fff6ef', 3.5, 18, 14, [0, 12, 0], [Math.PI / 2, 0, 0]) // soft ceiling
  panel('#ffffff', 9, 2.4, 16, [-8, 2, 5], [0, Math.PI / 2.1, 0]) // key strip
  panel('#ff5f7e', 8, 2.2, 14, [8, 3, -4], [0, -Math.PI / 2.5, 0]) // pink rim strip
  panel('#ffd9c2', 1.2, 16, 10, [0, -11, 2], [-Math.PI / 2, 0, 0]) // warm bounce

  return scene
}

/** Image-based lighting without downloading an HDR. */
export function Env({ intensity = 1 }) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const studio = buildStudio()
    const rt = pmrem.fromScene(studio, 0.03)
    scene.environment = rt.texture
    if ('environmentIntensity' in scene) scene.environmentIntensity = intensity

    studio.traverse((o) => {
      if (o.geometry) o.geometry.dispose()
      if (o.material) o.material.dispose()
    })

    return () => {
      scene.environment = null
      rt.texture.dispose()
      pmrem.dispose()
    }
  }, [gl, scene, intensity])

  return null
}
