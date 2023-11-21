<script>
import { artefactosStore } from "@/stores/artefacts"
import { usersStore } from "@/stores/users"
import { mapState, mapActions } from "pinia"
import { storage } from "@/utils/firebase.js"
import { ref, getDownloadURL, getBytes } from "firebase/storage"
import ArtefactImage from "@/components/artefacts/ArtefactImage.vue"
import DataTable from "primevue/datatable"
import Column from "primevue/column"
import ColumnGroup from "primevue/columngroup"
import Row from "primevue/row"
import InputText from "primevue/inputtext"
import View3D from "@/components/artefacts/View3D.vue"
import { formatDate, convertTimestampToDate } from '@/utils/utils'
import Dialog from "primevue/dialog"

export default {
  components: { ArtefactImage, DataTable, Column, ColumnGroup, Row, InputText, View3D, Dialog },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      artefact: null,
      filters: {
        global: {
          value: null,
        },
      },
      noPrincipalImagePath: "/NoPrincipalImage.webp",
      isModalVisible: false,
      pathModal: null,
      moreDetails: false,
      visible: false,
      mensajeDialog: "",
    }
  },
  computed: {
    ...mapState(artefactosStore, ["artefactStore"]),
    ...mapState(usersStore, ["userStore"]),
    principalImagePath() {
      if (this.artefact && this.artefact.files) {
        const principalFile = this.artefact.files.find((file) => file.principal)
        return principalFile ? principalFile.pathOrigine : null
      }
      return null
    },
  },
  methods: {
    ...mapActions(artefactosStore, ["getArtefactPorId"]),
    ...mapActions(usersStore, ["getUserPorId"]),

    async viewPicture(path) {
      try {
        const url = await getDownloadURL(ref(storage, path))
        window.open(url, "_blank")
      } catch (error) {
        console.error("Error on download file : ", error)
      }
    },
    async downloadFile(path) {
      try {
        const arrayBuffer = await getBytes(ref(storage, path))
        const blob = new Blob([arrayBuffer], { type: "application/octet-stream" })
        let link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = path.split("/").pop()
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        console.error("Error on download file : ", error)
      }
    },
    extractRoute(url) {
      return url.split("/").pop()
    },
    async downloadAllFiles() {
      if (!this.artefact || !this.artefact.files) return

      for (let file of this.artefact.files) {
        await this.downloadFile(file.pathOrigine)
      }
    },
    viewModal(path) {
      this.pathModal = path
      this.isModalVisible = true
    },
    viewPrincipal3D() {
      const file3DPrincipal = this.artefact.files.find((file) => file.principal3D)
      if (file3DPrincipal) {
        this.viewModal(file3DPrincipal.pathOrigine)
      }
      else {
        this.visible = true
        this.mensajeDialog = "There is no file 3D for this artefact"
      }
    },
    is3DFile(filePath) {
      const fileExtension = filePath.split(".").pop().toLowerCase()
      return fileExtension === "obj" || fileExtension === "stl"
    },
    convertTimestampToDate(timestamp) {
      return convertTimestampToDate(timestamp)
    },
    formatDate(date) {
      return formatDate(date)
    }
  },
  async created() {
    await this.getArtefactPorId(this.$route.params.id)
    this.artefact = { ...this.artefactStore }
  },
}
</script>

<template>
  <Dialog v-model:visible="visible" modal header="Mensaje" :style="{ width: '30vw' }">
    <p>
      <font-awesome-icon icon="fa-solid fa-circle-exclamation" size="2xl" style="color: #ff0000" class="me-3" />
      {{ mensajeDialog }}
    </p>
    <template #footer>
      <div class="d-flex justify-content-center">
        <button class="btn btn-secondary" @click="visible = false">OK</button>
      </div>
    </template>
  </Dialog>

  <div class="container p-3">
    <h1 class="titulo p-3">ARTEFACT DETAILS</h1>
    <div v-if="artefact">
      <div class="alert alert-secondary border rounded p-1 mb-0">
        <div class="row">
          <div class="col-md-6">
            <div class="mb-1">
              <div class="row mb-3">
                <div class="col-md-12">
                  <ArtefactImage :path="principalImagePath ? principalImagePath : noPrincipalImagePath" size="large" />
                </div>
              </div>
              <div class="row justify-content-center">
                <div class="col-md-12 text-center">
                  <label class="form-label fw-bold">{{ artefact.name }}</label>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="container mb-1">
              <div class="row mb-3">
                <div class="col-md-6 text-center pt-3">
                  <label class="form-label mb-0"><span class="fw-bold">COUNTRY</span></label>
                  <div>{{ artefact.country }}</div>
                </div>
                <div class="col-md-6 text-center pt-3">
                  <label class="form-label mb-0"><span class="fw-bold">CATEGORY</span></label>
                  <div>{{ artefact.category }}</div>
                </div>
                <div class="col-md-6 text-center pt-3">
                  <label class="form-label mb-0"><span class="fw-bold">SUBCATEGORY</span></label>
                  <div>{{ artefact.subCategory }}</div>
                </div>
                <div v-if="artefact.tipoArtefact" class="col-md-6 text-center pt-3">
                  <label class="form-label mb-0"><span class="fw-bold">TYPE</span></label>
                  <div>{{ artefact.tipoArtefact }}</div>
                </div>
                <div v-if="artefact.caliber >= 0" class="col-md-6 text-center pt-3">
                  <label class="form-label mb-0"><span class="fw-bold">CALIBER / DIAMETER (mm)</span></label>
                  <div>{{ artefact.caliber }}</div>
                </div>
                <div v-if="artefact.height >= 0" class="col-md-6 text-center pt-3">
                  <label class="form-label mb-0"><span class="fw-bold">HEIGHT (mm)</span></label>
                  <div>{{ artefact.height }}</div>
                </div>
                <div v-if="artefact.grossWeight >= 0" class="col-md-6 text-center pt-3">
                  <label class="form-label mb-0"><span class="fw-bold">GROSS WEIGHT (gr)</span></label>
                  <div>{{ artefact.grossWeight }}</div>
                </div>
                <div v-if="artefact.explosiveWeight >= 0" class="col-md-6 text-center pt-3">
                  <label class="form-label mb-0"><span class="fw-bold">EXPLOSIVE WEIGHT (gr)</span></label>
                  <div>{{ artefact.explosiveWeight }}</div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-12 text-center">
                  <label class="form-label mb-1"><span class="fw-bold">DESCRIPTION</span></label>
                </div>
                <div class="col-md-12">
                  <p>{{ artefact.descriptionArtefact }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="container alert alert-warning text-center p-0 mb-0 fw-bold details" @click="moreDetails = !moreDetails">
        More details</div>
      <div v-if="moreDetails" class="container alert alert-secondary mt-0">
        <div class="row">
          <div class="col-md-6">
            <label for="name" class="form-label fw-bold">Created by:</label>
            <div>{{ artefact.ownerName }}</div>
            <div>{{ formatDate(convertTimestampToDate(artefact.createdDate)) }}</div>
          </div>
          <div class="col-md-6" v-if="artefact.modifiedByName">
            <label for="name" class="form-label fw-bold">Modified by:</label>
            <div>{{ artefact.modifiedByName }}</div>
            <div>{{ formatDate(convertTimestampToDate(artefact.updatedDate)) }}</div>
          </div>
        </div>
      </div>
      <div class="d-flex justify-content-center mb-3 mt-3">
        <button type="submit" class="btn btn-danger me-2" @click="this.$router.go(-1)">
          <font-awesome-icon icon="fa-solid fa-xmark" size="lg" class="me-2" />
          Close</button>
        <button type="submit" class="btn btn-success me-2" @click="viewPrincipal3D()"><font-awesome-icon
            icon="fa-solid fa-cube" size="lg" class="me-2" />View 3D</button>
      </div>

      <div v-if="isModalVisible" class="modal-backdrop show"></div>
      <div v-if="isModalVisible" class="modal d-block show" tabindex="-1">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">3D Viewer</h5>
              <button type="button" class="btn-close" @click="isModalVisible = false"></button>
            </div>
            <div class="modal-body" style="max-height: 80vh; overflow: auto">
              <View3D :path="pathModal" />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="isModalVisible = false">Close</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="artefact.files && artefact.files.length > 0" class="table-scrollable alert alert-dark"
        style="max-height: 300px; overflow-y: auto">
        <DataTable :value="artefact.files" tableStyle="min-width: 50rem" v-model:filters="filters">
          <template #header>
            <div class="d-flex justify-content-between align-items-center">
              <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText v-model="filters['global'].value" placeholder="Global Search" />
              </span>
              <button type="button" class="btn btn-primary me-2" @click="downloadAllFiles()"><font-awesome-icon
                  icon="fa-solid fa-download" size="lg" class="me-2" />Download All Files</button>
            </div>
          </template>
          <Column field="tipoFile" header="Type" sortable></Column>
          <Column field="principal" header="Principal">
            <template #body="slotProps">
              {{ slotProps.data.principal ? "Yes" : "No" }}
            </template>
          </Column>
          <Column field="pathOrigine" header="Name" sortable>
            <template #body="slotProps">
              {{ extractRoute(slotProps.data.pathOrigine) }}
            </template>
          </Column>
          <Column field="descriptionFile" header="Description"></Column>
          <Column :exportable="false" style="min-width: 8rem">
            <template #body="slotProps">
              <font-awesome-icon v-if="is3DFile(slotProps.data.pathOrigine)" icon="fa-solid fa-cube"
                style="color: #35751a" class="icon me-4" @click="viewModal(slotProps.data.pathOrigine)" />
              <font-awesome-icon v-else icon="eye" style="color: #35751a" class="icon me-4"
                @click="viewPicture(slotProps.data.pathOrigine)" />
              <font-awesome-icon icon="download" style="color: #d11515" class="icon"
                @click="downloadFile(slotProps.data.pathOrigine)" />
            </template>
          </Column>
        </DataTable>
      </div>
      <div v-else class="text-center alert alert-secondary">This artefact has no files</div>
    </div>
    <div v-else class="text-center alert alert-secondary">No artefact found</div>
  </div>
</template>

<style scoped>
.icon,
.details {
  cursor: pointer;
}

.icon:hover {
  transform: scale(2);
}
</style>
