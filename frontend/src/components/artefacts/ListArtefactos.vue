<script>
import { mapState, mapActions } from "pinia"
import { artefactosStore } from "@/stores/artefacts"
import DataTable from "primevue/datatable"
import Column from "primevue/column"
import ColumnGroup from "primevue/columngroup"
import Row from "primevue/row"
import InputText from "primevue/inputtext"
import CountryFlag from "vue-country-flag-next"
import ArtefactImage from "@/components/artefacts/ArtefactImage.vue"
import countriesJson from "@/assets/countries.json"
import ConfirmDialog from "primevue/confirmdialog"
import Toast from "primevue/toast"
import { useToast } from "primevue/usetoast"
import ProgressSpinner from "primevue/progressspinner"
import { db, storage } from "@/utils/firebase"
import { collection, addDoc, doc, setDoc, where } from "firebase/firestore"
import { ref, uploadBytes, getBlob, getDownloadURL } from "firebase/storage"
import { usersStore } from "@/stores/users"

const listCountries = countriesJson.countries

export default {
  props: {
    listname: {
      type: String,
      required: true,
    },
  },
  components: { DataTable, Column, ColumnGroup, Row, InputText, CountryFlag, ArtefactImage, ConfirmDialog, Toast, ProgressSpinner },
  data() {
    return {
      filters: {
        global: { value: null },
      },
      isLoading: true,
      selectedRow: null,
      advancedSearch: false,
      country: '',
      tipoArtefact: '',
      category: '',
      subCategory: '',
      caliber: '',
      tabFilters: [],
      showModal: false,
      /////// para archivo csv
      categoriesCSV: [],
      subCategoriesCSV: [],
      typesCSV: [],
      csvData: [],
      headers: [],
    }
  },
  computed: {
    ...mapState(artefactosStore, ['listArtefacts']),
    ...mapState(usersStore, ["user"]),
  },
  methods: {
    ...mapActions(artefactosStore, ['getArtefactos', 'deleteArtefact']),
    ...mapActions(usersStore, ['userIsAdmin', 'userIsConsultation']),

    esOwner(artefact) {
      return artefact.owner === this.user?.uid ? true : false
    },
    getCountryCode(countryName) {
      const country = countriesJson.countries.find((c) => c.name === countryName)
      return country ? country.code : null
    },
    goToNewArtefact() {
      this.$router.push({ name: "newartefact" })
    },
    viewDetailsArtefact(event) {
      this.$router.push({ name: "viewartefact", params: { id: event.data.id } })
    },
    editArtefact(event, artefact) {
      event.stopPropagation()
      this.$router.push({ name: "editartefact", params: { id: artefact.id } })
    },
    borrarArtefact(event, artefact) {
      event.stopPropagation()
      this.$confirm.require({
        message: 'Are you sure to delete this artefact with id "' + artefact.id + '" ?',
        header: "Delete confirmation",
        icon: "pi pi-info-circle",
        acceptClass: "p-button-danger",
        acceptLabel: "Yes",
        accept: () => {
          if (this.listname === "pendientes") {
            this.deleteArtefact(artefact, "artefactosPendientes")
          } else if (this.listname === "confirmados") {
            this.deleteArtefact(artefact, "artefactosConfirmados")
          }
          this.$toast.add({ severity: "success", summary: "Deleted", detail: artefact.id, life: 3000 })
        },
        reject: () => {
          this.$toast.add({ severity: "error", summary: "Delete", detail: "Cancelled", life: 3000 })
        },
      })
    },
    getReducedImagePath(artefact) {
      let reducedImagePath = ""
      if (artefact.files) {
        const reducedImageFile = artefact.files.find((file) => file.principal == true)
        if (reducedImageFile) {
          reducedImagePath = reducedImageFile.pathReduced
        }
      }
      return reducedImagePath
    },
    validArtefact(event, artefact) {
      event.stopPropagation()
      this.$confirm.require({
        message: 'You are about to valid the artefact. Continue ?',
        header: "Valid confirmation",
        icon: "pi pi-info-circle",
        acceptClass: "p-button-danger",
        acceptLabel: "Yes",
        accept: async () => {
          try {
            this.showModal = true
            const uploadPromises = []
            const filesArtefact = []
            const dataArtefact = { ...artefact, files: [] }
            const collectionRef = collection(db, 'artefactosConfirmados')
            await addDoc(collectionRef, dataArtefact).then((resp) => {
              const idArtefact = resp.id
              if (artefact.files) {
                artefact.files.forEach((file) => {
                  const fileOrigineRef = ref(storage, file.pathOrigine)
                  const rutaOriginNueva = "artefactosConfirmados/" + idArtefact + "/" + fileOrigineRef.name
                  const fileOriginValidRef = ref(storage, rutaOriginNueva)
                  const uploadPromiseOrigine = getBlob(fileOrigineRef).then((blob) => {
                    return uploadBytes(fileOriginValidRef, blob).then(() => {
                      return getDownloadURL(fileOriginValidRef)
                    })
                  })
                  // Add the promise to the array
                  uploadPromises.push(uploadPromiseOrigine)

                  const dataFile = { ...file, pathOrigine: rutaOriginNueva }
                  if (dataFile.pathReduced) {
                    const fileReducedRef = ref(storage, dataFile.pathReduced)
                    const rutaReducedNueva = "artefactosConfirmados/" + idArtefact + "/" + fileReducedRef.name
                    dataFile.pathReduced = rutaReducedNueva
                    const fileReducedValidRef = ref(storage, rutaReducedNueva)
                    const uploadPromiseReduced = getBlob(fileReducedRef).then((blob) => {
                      return uploadBytes(fileReducedValidRef, blob).then(() => {
                        return getDownloadURL(fileReducedValidRef)
                      })
                    })
                    // Add the promise to the array
                    uploadPromises.push(uploadPromiseReduced)
                  }
                  filesArtefact.push(dataFile)
                  const artefactValidRef = doc(db, "artefactosConfirmados", idArtefact)
                  setDoc(artefactValidRef, { files: filesArtefact }, { merge: true })
                })
                // Wait for all file upload promises to resolve
                Promise.all(uploadPromises).then((downloadURLs) => {                
                  this.deleteArtefact(artefact, 'artefactosPendientes')
                  this.showModal = false
                  this.$toast.add({ severity: "success", summary: "Validated", detail: artefact.id, life: 3000 })
                })
                  .catch((error) => {
                    console.error('Error uploading files:', error);
                  })
              }
            })
          } catch (error) {
            console.error("Error on valid artefact :", error.code)
            if (error.code) {
              this.$toast.add({
                severity: "error",
                summary: "Permission Error",
                detail: "You do not have the necessary permissions to perform this operation",
                life: 5000,
              })
            }
          }
        },
        reject: () => {
          this.$toast.add({ severity: "error", summary: "Delete", detail: "Cancelled", life: 3000 })
        },
      })
    },
    cancelArtefact(event, artefact) {
      event.stopPropagation()
      this.$confirm.require({
        message: 'You are about to cancel the artefact. Continue ?',
        header: "Cancel confirmation",
        icon: "pi pi-info-circle",
        acceptClass: "p-button-danger",
        acceptLabel: "Yes",
        accept: async () => {
          try {
            this.showModal = true
            const uploadPromises = []
            const filesArtefact = []
            const dataArtefact = { ...artefact, files: [] }
            const collectionRef = collection(db, 'artefactosPendientes')
            await addDoc(collectionRef, dataArtefact).then((resp) => {
              const idArtefact = resp.id
              if (artefact.files) {
                artefact.files.forEach((file) => {
                  const fileOrigineRef = ref(storage, file.pathOrigine)
                  const rutaOriginNueva = "artefactosPendientes/" + idArtefact + "/" + fileOrigineRef.name
                  const fileOriginValidRef = ref(storage, rutaOriginNueva)
                  const uploadPromiseOrigine = getBlob(fileOrigineRef).then((blob) => {
                    return uploadBytes(fileOriginValidRef, blob).then(() => {
                      return getDownloadURL(fileOriginValidRef)
                    })
                  })
                  // Add the promise to the array
                  uploadPromises.push(uploadPromiseOrigine)

                  const dataFile = { ...file, pathOrigine: rutaOriginNueva }
                  if (dataFile.pathReduced) {
                    const fileReducedRef = ref(storage, dataFile.pathReduced)
                    const rutaReducedNueva = "artefactosPendientes/" + idArtefact + "/" + fileReducedRef.name
                    dataFile.pathReduced = rutaReducedNueva
                    const fileReducedValidRef = ref(storage, rutaReducedNueva)
                    const uploadPromiseReduced = getBlob(fileReducedRef).then((blob) => {
                      return uploadBytes(fileReducedValidRef, blob).then(() => {
                        return getDownloadURL(fileReducedValidRef)
                      })
                    })
                    // Add the promise to the array
                    uploadPromises.push(uploadPromiseReduced)
                  }
                  filesArtefact.push(dataFile)
                  const artefactValidRef = doc(db, "artefactosPendientes", idArtefact)
                  setDoc(artefactValidRef, { files: filesArtefact }, { merge: true })
                })
                // Wait for all file upload promises to resolve
                Promise.all(uploadPromises).then((downloadURLs) => {
                  this.deleteArtefact(artefact, 'artefactosConfirmados')
                  this.showModal = false
                  this.$toast.add({ severity: "success", summary: "Validated", detail: artefact.id, life: 3000 })
                })
                  .catch((error) => {
                    console.error('Error uploading files:', error);
                  })
              }
            })            
          } catch (error) {
            console.error("Error on cancel artefact :", error.code)
            if (error.code) {
              this.$toast.add({
                severity: "error",
                summary: "Permission Error",
                detail: "You do not have the necessary permissions to perform this operation",
                life: 5000,
              })
            }
          }
        },
        reject: () => {
          this.$toast.add({ severity: "error", summary: "Delete", detail: "Cancelled", life: 3000 })
        },
      })
    },
    async loadArtefactsByType(type) {
      this.advancedSearch = false
      this.isLoading = true
      let collectionName = type === "pendientes" ? "artefactosPendientes" : "artefactosConfirmados"
      try {
        await this.getArtefactos(collectionName, [])
      } catch (error) {
        console.error("Error on loading artefacts:", error)
      } finally {
        this.isLoading = false
      }
    },
    toogleSearchMode() {
      this.advancedSearch = !this.advancedSearch
      this.filters.global.value = null
      this.clearFilters()
    },
    clearFilters() {
      this.country = ''
      this.tipoArtefact = ''
      this.category = ''
      this.subCategory = ''
      this.caliber = ''
      this.tabFilters = []
      if (this.listname === "pendientes") {
        this.getArtefactos('artefactosPendientes', this.tabFilters)
      } else if (this.listname === "confirmados") {
        this.getArtefactos('artefactosConfirmados', this.tabFilters)
      }
    },
    aplicarFiltros() {
      this.tabFilters = []
      if (this.country) {
        this.tabFilters.push(where("country", "==", this.country))
      }
      if (this.category) {
        this.tabFilters.push(where("category", "==", this.category))
      }
      if (this.subCategory) {
        this.tabFilters.push(where("subCategory", "==", this.subCategory))
      }
      if (this.tipoArtefact) {
        this.tabFilters.push(where("tipoArtefact", "==", this.tipoArtefact))
      }
      if ((this.caliber) && (this.caliber != '0')) {
        this.tabFilters.push(where("caliber", "==", this.caliber))
      }

      if (this.listname === "pendientes") {
        this.getArtefactos('artefactosPendientes', this.tabFilters)
      } else if (this.listname === "confirmados") {
        this.getArtefactos('artefactosConfirmados', this.tabFilters)
      }
    },
    parseCSV(fileContent) {
      const lines = fileContent.split('\n')
      const tabHeaders = lines[0].split(';')
      const data = []
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(';')
        if (row.length === tabHeaders.length) {
          const rowData = {}
          for (let j = 0; j < tabHeaders.length; j++) {
            rowData[tabHeaders[j].trim()] = row[j].trim()
          }
          data.push(rowData);
        }
      }
      this.headers = tabHeaders
      this.csvData = data

      const tab1 = []
      const tab2 = []
      const tab3 = []
      this.csvData.forEach((val) => {
        ////// categoriesCSV
        if (!tab1.includes(val.codeCategory)) {
          tab1.push(val.codeCategory)
          const cat = { code: val.codeCategory, name: val.category }
          this.categoriesCSV.push(cat)
        }
        ////// subCategoriesCSV
        if (!tab2.includes(val.codeSubcategory)) {
          tab2.push(val.codeSubcategory)
          const subcat = { code: val.codeSubcategory, name: val.subcategory }
          this.subCategoriesCSV.push(subcat)
        }
        ////// typesCSV
        if (val.type != '') {
          const tab = val.type.split('|')
          tab.forEach((tipo) => {
            if (!tab3.includes(tipo.trim())) {
              tab3.push(tipo.trim())
            }
          })
        }
      })
      this.typesCSV = tab3.map((valor, index) => {
        return { code: index + 1, name: valor }
      })
    },
    async loadCSV() {
      try {
        const response = await fetch('/src/assets/file.csv')
        const fileContent = await response.text()
        this.parseCSV(fileContent)
      } catch (error) {
        console.error('Error loading CSV:', error)
      }
    }
  },
  watch: {
    listname(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.loadArtefactsByType(newValue)
      }
    },
  },
  async created() {
    this.advancedSearch = false
    this.countries = listCountries.map((value, index) => {
      return { id: index + 1, code: value.code, name: value.name }
    })
    await this.loadCSV()
  },

  async mounted() {
    this.toast = useToast()
    this.loadArtefactsByType(this.listname)
  },
}
</script>
<template>
  <Toast />
  <ConfirmDialog></ConfirmDialog>
  <div class="container p-2">
    <h1 class="titulo p-3 mb-1">{{ listname === "pendientes" ? "STANDBY ARTEFACTS LIST" : "VALID ARTEFACTS LIST" }}</h1>
    <div v-if="isLoading">
      Loading artefacts...
      <ProgressSpinner />
    </div>

    <div v-else class="alert alert-light">
      <div class="d-flex justify-content-between align-items-center">
        <div class="d-inline-flex p-3 align-items-center me-2" v-if="listArtefacts.length > 0">
          <span class="p-input-icon-left me-4">
            <i class="pi pi-search" />
            <InputText :disabled="advancedSearch" v-model="filters['global'].value" placeholder="Global Search" />
          </span>
          <div class="form-check form-check-inline">
            <input class="form-check-input advanced-search" type="checkbox" id="advancedsearch" value="option1"
              @click="toogleSearchMode">
            <label class="form-check-label" for="advancedsearch">Advanced Search</label>
          </div>
        </div>
        <button v-if="listname === 'pendientes'" type="button" class="btn btn-success ms-3"
          @click="goToNewArtefact"><font-awesome-icon icon="fa-solid fa-plus" size="lg" class="me-2" />New
          Artefact</button>
      </div>

      <div v-if="advancedSearch" class="container alert alert-secondary py-2 mb-1">
        <div class="row mb-2">
          <div class="col-md-4">
            <label for="country" class="form-label fw-bold">Country</label>
            <select class="form-select" v-model="country" @change="aplicarFiltros">
              <option value="" selected>--select a country--</option>
              <option v-for="country of countries" :value="country.name">{{ country.name }}</option>
            </select>
          </div>
          <div class="col-md-4">
            <label for="category" class="form-label fw-bold">Category</label>
            <select class="form-select" v-model="category" @change="aplicarFiltros">
              <option value="" selected>--select a category--</option>
              <option v-for="category of categoriesCSV" :value="category.name">{{ category.name }}</option>
            </select>
          </div>
          <div class="col-md-4">
            <label for="subcategory" class="form-label fw-bold">Subcategory</label>
            <select class="form-select" v-model="subCategory" @change="aplicarFiltros">
              <option value="" selected>--select a subcategory--</option>
              <option v-for="subcategory of subCategoriesCSV" :value="subcategory.name">{{ subcategory.name }}</option>
            </select>
          </div>
        </div>
        <div class="row mb-1">
          <div class="col-md-4">
            <label for="type" class="form-label fw-bold">Type</label>
            <select class="form-select" v-model="tipoArtefact" @change="aplicarFiltros">
              <option value="" selected>--select a type--</option>
              <option v-for="tipo of typesCSV" :value="tipo.name">{{ tipo.name }}</option>
            </select>
          </div>
          <div class="col-md-4 me-5">
            <label for="diameter" class="form-label fw-bold">Caliber / Diameter (mm)</label>
            <input type="number" class="form-control" id="diameter" placeholder="diameter in mm" v-model="caliber"
              @change="aplicarFiltros" />
          </div>
          <div class="col-md-3 mt-4 d-inline-flex align-items-center ms-4">
            <button @click="clearFilters" type="button" class="btn btn-secondary">Clear Filters</button>
          </div>
        </div>
      </div>

      <div v-if="showModal" class="custom-backdrop"></div>
      <div v-if="showModal" class="custom-modal">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header"></div>
            <div class="modal-body my-1">
              <div v-if="listname === 'pendientes'" class="container">
                <div class="row">
                  <div class="col-md-6 text-center me-2">
                    <ProgressSpinner />
                  </div>
                  <div class="col-md-5 py-5">
                    Validation in progress...
                  </div>
                </div>
              </div>
              <div v-if="listname === 'confirmados'" class="container">
                <div class="row">
                  <div class="col-md-6 text-center me-2">
                    <ProgressSpinner />
                  </div>
                  <div class="col-md-5 py-5">
                    Cancellation in progress...
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer"></div>
          </div>
        </div>
      </div>

      <DataTable class="p-3 alert alert-dark" v-if="listArtefacts.length > 0" :value="listArtefacts"
        tableStyle="min-width: 50rem" v-model:filters="filters" paginator :rows="6" @row-click="viewDetailsArtefact"
        v-model:selection="selectedRow" selectionMode="single" dataKey="id">
        <Column field="name" header="Name" sortable></Column>
        <Column>
          <template #body="slotProps">
            <ArtefactImage :path="getReducedImagePath(slotProps.data)" :key="slotProps.data.id" />
          </template>
        </Column>
        <Column field="country" sortField="country" header="Country" sortable>
          <template #body="{ data }">
            <div class="flex align-items-center gap-2">
              <country-flag v-if="data.country" :country="getCountryCode(data.country)" size="normal" class="me-0" />
              <span>{{ data.country }}</span>
            </div>
          </template>
        </Column>
        <Column field="category" header="Category" sortable></Column>
        <Column field="subCategory" header="Sub Category" sortable></Column>
        <Column field="tipoArtefact" header="Type" sortable></Column>
        <Column :exportable="false" style="min-width: 8rem">
          <template #body="slotProps">
            <font-awesome-icon v-if="listname === 'pendientes' && (userIsAdmin() || esOwner(slotProps.data))"
              icon="pen-to-square" style="color: #e5a50a" class="icon me-4" @click="editArtefact($event, slotProps.data)"
              data-bs-toggle="tooltip" data-bs-placement="right" title="clic here to update this artefact" />
            <font-awesome-icon v-if="listname === 'pendientes' && (userIsAdmin() || esOwner(slotProps.data))" icon="trash"
              style="color: #d11515" class="icon me-4" @click="borrarArtefact($event, slotProps.data)"
              data-bs-toggle="tooltip" data-bs-placement="right" title="clic here to delete this artefact" />
            <font-awesome-icon v-if="listname === 'pendientes' && userIsAdmin()" icon="fa-solid fa-circle-check"
              style="color: #35751a" class="icon" @click="validArtefact($event, slotProps.data)" data-bs-toggle="tooltip"
              data-bs-placement="right" title="clic here to valid this artefact" />
            <font-awesome-icon v-else-if="listname === 'confirmados' && userIsAdmin()" icon="fa-solid fa-rotate-left"
              style="color: #d40a2b" size="lg" class="icon" @click="cancelArtefact($event, slotProps.data)"
              data-bs-toggle="tooltip" data-bs-placement="right" title="clic here to cancel this artefact" />
          </template>
        </Column>
      </DataTable>

      <div v-else class="text-center alert alert-dark p-5 mb-0">
        <p class="fw-bold">No artefacts found</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.icon {
  cursor: pointer;
}

.icon:hover {
  transform: scale(1.5);
}

.custom-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.custom-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 600px;
  background-color: #ece7e7;
  padding: 20px;
  border-radius: 8px;
  z-index: 1050;
  overflow: auto;
}
</style>
