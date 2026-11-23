import * as THREE from 'three'

const loader = new THREE.TextureLoader()

// Preload immediately at module evaluation so GPU textures are ready from frame 1
const _skin = loader.load('/images/real-strawberry-skin.jpg')
_skin.wrapS = _skin.wrapT = THREE.RepeatWrapping
_skin.repeat.set(1.6, 1.2)
_skin.colorSpace = THREE.SRGBColorSpace
_skin.anisotropy = 8

const _skinBump = loader.load('/images/real-strawberry-skin-bump.jpg')
_skinBump.wrapS = _skinBump.wrapT = THREE.RepeatWrapping
_skinBump.repeat.set(1.6, 1.2)
_skinBump.anisotropy = 8

const _flesh = loader.load('/images/real-strawberry-flesh.jpg')
_flesh.colorSpace = THREE.SRGBColorSpace
_flesh.anisotropy = 8

const _leaf = loader.load('/images/real-strawberry-leaf.jpg')
_leaf.colorSpace = THREE.SRGBColorSpace
_leaf.anisotropy = 8

const _label = loader.load('/images/bottle-label-clean.png')
_label.colorSpace = THREE.SRGBColorSpace
_label.anisotropy = 8

export function skinTexture() {
  return _skin
}

export function skinBumpTexture() {
  return _skinBump
}

export function fleshTexture() {
  return _flesh
}

export function leafTexture() {
  return _leaf
}

export function labelTexture() {
  return _label
}
