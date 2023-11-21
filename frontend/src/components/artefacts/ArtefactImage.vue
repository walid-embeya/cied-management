<script>
import { storage } from "@/utils/firebase.js"
import { ref, getDownloadURL } from "firebase/storage"

export default {
  props: {
    path: String,
    size: {
      type: String,
      default: "small",
      validator: (value) => ["small", "large"].includes(value),
    },
  },
  data: () => {
    return {
      url: "/NoListArtefactPicture.webp",
      noPrincipalImagePath: '/NoPrincipalImage.webp'
    }
  },
  mounted() {
    if (this.path) {
      if (this.path === this.noPrincipalImagePath) {
        this.url = this.noPrincipalImagePath
      } else {
        getDownloadURL(ref(storage, this.path))
          .then((download_url) => {
            this.url = download_url
          })
          .catch((error) => {
            console.error("Error obteniendo la URL de descarga:", error)
          })
      }
    }
  },
}
</script>

<template>
  <img class="artefact-image" :class="size" :src="url" alt="Main picture" />
</template>

<style scoped>
.artefact-image.small {
  height: 5vh;
}

.artefact-image.large {
  width: 100%;
  height: auto;
}
</style>
