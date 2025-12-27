import * as THREE from "three"

// Create and configure the floor texture
const textureLoader = new THREE.TextureLoader()
export const floorTexture = textureLoader.load("/seamless-light-oak-wood-parquet-floor-texture-top-.jpg")
floorTexture.wrapS = THREE.RepeatWrapping
floorTexture.wrapT = THREE.RepeatWrapping
floorTexture.repeat.set(8, 8)
