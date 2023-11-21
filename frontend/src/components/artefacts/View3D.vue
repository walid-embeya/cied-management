<script setup>
import { ref, onMounted, defineProps, watch } from "vue"
import { getDownloadURL, ref as fbRef } from "firebase/storage"
import { storage } from "@/utils/firebase.js"
import { Camera, Renderer, Scene, DirectionalLight } from "troisjs"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader"
import { STLLoader } from "three/examples/jsm/loaders/STLLoader"
import * as THREE from "three"

const loadingProgress = ref("")
const scene = ref()
const { path } = defineProps(["path"])
const color = ref("#808080")
let ambientLight
const lightEjeX = ref(1)
const lightEjeY = ref(1)
const lightEjeZ = ref(1)

onMounted(async () => {
  ambientLight = new THREE.AmbientLight(color.value, 0.5)
  scene.value.add(ambientLight)

  const extension = path.split(".").pop().toLowerCase()
  let loader
  if (extension === "obj") {
    loader = new OBJLoader()
  } else if (extension === "stl") {
    loader = new STLLoader()
  } else {
    console.error("Formato de archivo no soportado")
    return
  }
  const url = await getDownloadURL(fbRef(storage, path))
  loader.load(
    url,
    (object) => {
      if (extension === "obj") {
        object.traverse((child) => {
          if (child.isMesh) {
            child.geometry.computeBoundingBox()
            const center = child.geometry.boundingBox.getCenter(new THREE.Vector3()).negate()
            object.position.set(center.x, center.y, center.z)
          }
        })
        scene.value.add(object)
      } else if (extension === "stl") {
        const material = new THREE.MeshLambertMaterial()
        const mesh = new THREE.Mesh(object, material)
        mesh.geometry.computeBoundingBox()
        const center = mesh.geometry.boundingBox.getCenter(new THREE.Vector3()).negate()
        mesh.geometry.translate(center.x, center.y, center.z)
        scene.value.add(mesh)
      }
    },
    (progress) => {
      loadingProgress.value = ((progress.loaded / progress.total) * 100).toFixed(2) + "%"
    },
    (error) => {
      console.error("Ocurrió un error al cargar el archivo:", error)
    }
  )
})
watch(color, (newColor) => {
  if (ambientLight) {
    ambientLight.color.set(newColor)
  }
})
</script>

<template>
  <div class="container">
    <div class="row">
      <div class="col-md-9 p-0 renderer alert alert-warning">
        <Renderer antialias :orbit-ctrl="{ enableDamping: true }" resize="false">
          <Camera :position="{ z: 200 }" />
          <Scene ref="scene">
            <DirectionalLight color="white" :intensity="1" :position="{ x: lightEjeX, y: lightEjeY, z: lightEjeZ }" />
            <DirectionalLight color="white" :intensity="1" :position="{ x: -lightEjeX, y: -lightEjeY, z: -lightEjeZ }" />
          </Scene>
        </Renderer>
      </div>
      <div class="col-md-3 d-flex align-items-center flex-column mt-5">
        <div class="container">
          <div class="row">
            <div class="mb-3">
              <label for="colorPicker" class="me-2">Selecciona color:</label>
              <input type="color" id="colorPicker" v-model="color" />
            </div>
          </div>
          <div class="row mb-2">
            <label for="lightEjeX" class="me-2">Eje X: {{ lightEjeX }}</label>
          <input type="range" id="lightEjeX" v-model.number="lightEjeX" min="-10" max="10" step="0.1" />
          </div>
          <div class="row mb-2">
            <label for="lightEjeY" class="me-2">Eje Y: {{ lightEjeY }}</label>
          <input type="range" id="lightEjeY" v-model.number="lightEjeY" min="-10" max="10" step="0.1" />
          </div>
          <div class="row">
            <label for="lightEjeZ" class="me-2">Eje Z: {{ lightEjeZ }}</label>
          <input type="range" id="lightEjeZ" v-model.number="lightEjeZ" min="-10" max="10" step="0.1" />
          </div>
        </div>
      </div>
    </div>
    <div class="row text-center">
      <div class="progress col-md-9 p-0" role="progressbar" aria-label="Example with label" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar" style="width: 100%">{{ loadingProgress }}</div>
      </div>
    </div>
  </div>
</template>

<style>
canvas {
  z-index: 1;
}

.renderer {
  height: 60vh;
}
</style>
