<script>
import { mapState, mapActions } from "pinia"
import { artefactosStore } from "@/stores/artefacts"
import { db, storage } from "@/utils/firebase"
import { doc, setDoc } from "firebase/firestore"
import { ref, deleteObject, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage"
import countriesJson from "@/assets/countries.json"
import { comprobarCategoria } from "@/utils/utils"
import ConfirmDialog from "primevue/confirmdialog"
import Toast from "primevue/toast"
import { useToast } from "primevue/usetoast"
import Dialog from "primevue/dialog"
import { reducer } from "@/utils/reduceImage"
import { usersStore } from "@/stores/users"

const listCountries = countriesJson.countries

export default {
  components: { ConfirmDialog, Toast, Dialog },
  data() {
    return {
      artefactToEdit: null,
      countries: [],
      idArtefact: "",
      filesArtefact: [],
      fileSelected: false,
      fileSelectedName: "",
      mainFile: false,
      fileDescription: "",
      mainElegido: false,
      showModal: false,
      visible: false,
      mensajeDialog: "",
      uploadProgress: 0,
      mainFile3D: false,

      /////// para archivo csv
      categoriesCSV: [],
      subCategoriesCSV: [],
      typesCSV: [],
      csvData: [],
      headers: [],
      typeVisible: true,
      caliberVisible: true,
      heightVisible: true,
      grossWeightVisible: true,
      explosiveWeightVisible: true,
      caliber: 0,
      height: 0,
      grossWeight: 0,
      explosiveWeight: 0,
      tipoArtefact: '',
    }
  },
  computed: {
    ...mapState(artefactosStore, ["artefactStore"]),
    ...mapState(usersStore, ['user', 'userStore']),
  },
  methods: {
    ...mapActions(artefactosStore, ["getArtefactPorId"]),
    ...mapActions(usersStore, ["getUserPorId"]),

    selectSubcategoriesCSV(category) {
      const selectedData = this.csvData.filter((data) => data.category === category)
      if (selectedData) {
        this.subCategoriesCSV = []
        const tab = []
        selectedData.forEach((val) => {
          if (!tab.includes(val.codeSubcategory)) {
            tab.push(val.codeSubcategory)
            const subcat = { code: val.codeSubcategory, name: val.subcategory }
            this.subCategoriesCSV.push(subcat)
          }
        })
      }
      this.activarCampos()
    },
    activarCampos() {
      if (this.artefactToEdit.category && this.artefactToEdit.subCategory) {
        this.typeVisible = true
        this.caliberVisible = true
        this.heightVisible = true
        this.grossWeightVisible = true
        this.explosiveWeightVisible = true

        ///// find data a partir un category y un subcategory
        const elemento = this.csvData.find((data) => data.category === this.artefactToEdit.category && data.subcategory === this.artefactToEdit.subCategory)
        if (elemento) {
          if (elemento.caliber.toLowerCase() != 'true') {
            this.caliberVisible = false
          }
          if (elemento.height.toLowerCase() != 'true') {
            this.heightVisible = false
          }
          if (elemento.grossWeight.toLowerCase() != 'true') {
            this.grossWeightVisible = false
          }
          if (elemento.explosiveWeight.toLowerCase() != 'true') {
            this.explosiveWeightVisible = false
          }

          if (elemento.type != '') {
            const tab = elemento.type.split('|')
            this.typesCSV = tab.map((valor, index) => {
              return { code: index + 1, name: valor.trim() }
            })
            if (!this.typesCSV) {
              this.typeVisible = false
            }
          }
          else {
            this.typeVisible = false
          }
        }
      }
    },
    getNameFile(file) {
      const fileOrigineRef = ref(storage, file.pathOrigine)
      return fileOrigineRef.name
    },
    async editArtefact() {
      if (comprobarCategoria(this.artefactToEdit.category, this.artefactToEdit.subCategory)) {
        delete this.artefactToEdit.caliber
        delete this.artefactToEdit.height
        delete this.artefactToEdit.grossWeight
        delete this.artefactToEdit.explosiveWeight
        delete this.artefactToEdit.tipoArtefact

        if (this.typeVisible) {
          this.artefactToEdit.tipoArtefact = this.tipoArtefact
        }
        if (this.caliberVisible) {
          this.artefactToEdit.caliber = this.caliber
        }
        if (this.heightVisible) {
          this.artefactToEdit.height = this.height
        }
        if (this.grossWeightVisible) {
          this.artefactToEdit.grossWeight = this.grossWeight
        }
        if (this.explosiveWeightVisible) {
          this.artefactToEdit.explosiveWeight = this.explosiveWeight
        }
        if (this.artefactToEdit.id) {
          delete this.artefactToEdit.id
        }
        this.artefactToEdit.modifiedBy = this.user.uid
        this.artefactToEdit.updatedDate = new Date()
        this.artefactToEdit.modifiedByName = this.userStore.name
        const artefactRef = doc(db, 'artefactosPendientes', this.idArtefact)
        await setDoc(artefactRef, this.artefactToEdit)
          .then((resp) => {
            this.visible = true
            this.mensajeDialog = "data artefact updated with success"
          })
          .catch((error) => {
            console.error("Error on updating artefact", error)
            this.visible = true
            this.mensajeDialog = "Error on updating artefact !"
          })
      } else {
        console.error("subcategoria incompatible con categoria !")
      }
    },
    addFilesToArtefact() {
      this.showModal = true
      const filePrincipal = this.filesArtefact.find((file) => file.principal === true)
      if (filePrincipal) {
        this.mainElegido = true
      } else {
        this.mainElegido = false
      }
    },
    cancelUpload() {
      this.showModal = false
      this.fileSelected = false
      this.fileSelectedName = ""
      this.mainFile = false
      this.fileDescription = ""
      this.uploadProgress = 0
    },
    deleteFileArtefact(file) {
      this.$confirm.require({
        message: 'Are you sure to delete the file artefact "' + this.getNameFile(file) + '" ?',
        header: "Delete confirmation",
        icon: "pi pi-info-circle",
        acceptClass: "p-button-danger",
        acceptLabel: "Yes",
        accept: async () => {
          const fileOrigineRef = ref(storage, file.pathOrigine)
          deleteObject(fileOrigineRef)
          if (file.principal) {
            const fileReducedRef = ref(storage, file.pathReduced)
            deleteObject(fileReducedRef)
          }

          let indexToRemove = this.filesArtefact.indexOf(file)
          this.filesArtefact.splice(indexToRemove, 1)

          const artefactRef = doc(db, "artefactosPendientes", this.idArtefact)
          setDoc(artefactRef, { files: this.filesArtefact, modifiedBy: this.user.uid, updatedDate: new Date(), modifiedByName: this.userStore.name }, { merge: true })
          this.$toast.add({ severity: "success", summary: "Deleted", detail: this.getNameFile(file), life: 3000 })
        },
        reject: () => {
          this.$toast.add({ severity: "error", summary: "Delete", detail: "Cancelled", life: 3000 })
        },
      })
    },
    uploadFile() {
      if (this.fileSelected) {
        const file = this.$refs.myfile.files[0]
        let ruta = "artefactosPendientes/" + this.idArtefact + "/" + file.name
        const storageRef = ref(storage, ruta)
        const uploadTask = uploadBytesResumable(storageRef, file)
        uploadTask.on('state_changed',
          (snapshot) => {
            this.uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          },
          (error) => {
            console.error("Error uploading:", error)
            this.uploadProgress = 0
          },
          async () => {
            const isImage = file.type.startsWith("image/")
            const dataFile = {
              principal: this.mainFile,
              pathOrigine: uploadTask.snapshot.ref.fullPath,
              descriptionFile: this.fileDescription,
            }
            const tab = file.type.split("/")
            dataFile.tipoFile = tab[0]
            const tabName = file.name.split(".")
            const extension = tabName.pop()
            if (extension === "stl" || extension === "obj") {
              dataFile.tipoFile = "3D"
              if (!this.mainFile3D) {
                dataFile.principal3D = true
                this.mainFile3D = true
              }
            }
            if (dataFile.principal && isImage) {
              const reducedFile = await reducer.toBlob(file, { max: 100 })
              const routeReduced = "artefactosPendientes/" + this.idArtefact + "/" + "Reduced_" + file.name
              const reducedStorageRef = ref(storage, routeReduced)
              uploadBytes(reducedStorageRef, reducedFile)
              dataFile.pathReduced = routeReduced
            }
            this.filesArtefact.push(dataFile)
            const artefactRef = doc(db, "artefactosPendientes", this.idArtefact)
            setDoc(artefactRef, { files: this.filesArtefact, modifiedBy: this.user.uid, updatedDate: new Date(), modifiedByName: this.userStore.name }, { merge: true })
            if (this.mainFile) {
              this.mainElegido = true
            }
            this.fileSelected = false
            this.fileSelectedName = ""
            this.mainFile = false
            this.fileDescription = ""
            this.uploadProgress = 0
          }
        )
      } else {
        console.error("no file selected")
      }
    },
    handleFileChange(event) {
      const selectedFile = event.target.files[0]
      if (selectedFile) {
        this.fileSelected = true
        this.fileSelectedName = selectedFile.name
      } else {
        this.fileSelected = false
      }
    },
    showFileArtefact(file) {
      const fileOrigineRef = ref(storage, file.pathOrigine)
      getDownloadURL(fileOrigineRef)
        .then((url) => {
          window.open(url, "_blank")
        })
        .catch((error) => {
          console.error("Error on recovering url of the file  :", error)
        })
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
  created() {
    this.countries = listCountries.map((value, index) => {
      return { id: index + 1, code: value.code, name: value.name }
    })
  },
  async mounted() {
    this.toast = useToast()
    this.idArtefact = this.$route.params.id
    await this.getArtefactPorId(this.idArtefact)
    this.artefactToEdit = { ...this.artefactStore }
    this.filesArtefact = this.artefactToEdit.files

    await this.getUserPorId(this.user.uid)

    await this.loadCSV()

    this.selectSubcategoriesCSV(this.artefactToEdit.category)

    const file3DPrincipal = this.filesArtefact.find((file) => file.principal3D)
    if (file3DPrincipal) {
      this.mainFile3D = true
    }

    if (this.artefactToEdit.tipoArtefact) {
      this.typeVisible = true
      this.tipoArtefact = this.artefactToEdit.tipoArtefact
    }
    else {
      this.typeVisible = false
      this.tipoArtefact = ''
    }
    if (this.artefactToEdit.caliber >= 0) {
      this.caliberVisible = true
      this.caliber = this.artefactToEdit.caliber
    }
    else {
      this.caliberVisible = false
      this.caliber = 0
    }
    if (this.artefactToEdit.height >= 0) {
      this.heightVisible = true
      this.height = this.artefactToEdit.height
    }
    else {
      this.heightVisible = false
      this.height = 0
    }
    if (this.artefactToEdit.grossWeight >= 0) {
      this.grossWeightVisible = true
      this.grossWeight = this.artefactToEdit.grossWeight
    }
    else {
      this.grossWeightVisible = false
      this.grossWeight = 0
    }
    if (this.artefactToEdit.explosiveWeight >= 0) {
      this.explosiveWeightVisible = true
      this.explosiveWeight = this.artefactToEdit.explosiveWeight
    }
    else {
      this.explosiveWeightVisible = false
      this.explosiveWeight = 0
    }
  },
}
</script>

<template>
  <Dialog v-model:visible="visible" modal header="Mensaje" :style="{ width: '30vw' }">
    <p>
      <font-awesome-icon icon="fa-solid fa-check" size="2xl" style="color: #0f8f35" class="me-3" />
      {{ mensajeDialog }}
    </p>
    <template #footer>
      <div class="d-flex justify-content-center">
        <button class="btn btn-secondary" @click="visible = false">OK</button>
      </div>
    </template>
  </Dialog>

  <Toast />
  <ConfirmDialog></ConfirmDialog>

  <div class="container p-2">
    <h1 class="titulo p-3 mb-1">EDIT ARTEFACT</h1>
    <form v-if="artefactToEdit" class="p-2 border rounded">
      <div class="container alert alert-secondary border rounded mb-1 pb-0">
        <div class="row mb-3">
          <div class="col-md-4">
            <label for="name" class="form-label fw-bold">Name</label>
            <input type="text" class="form-control" id="name" v-model="artefactToEdit.name"
              placeholder="name of the artefact" required />
          </div>
          <div class="col-md-4">
            <label for="category" class="form-label fw-bold">Category</label>
            <select class="form-select" v-model="artefactToEdit.category"
              @change="selectSubcategoriesCSV(artefactToEdit.category)" required>
              <option value="" disabled selected>--select a category--</option>
              <option v-for="category of categoriesCSV" :value="category.name">{{ category.name }}</option>
            </select>
          </div>
          <div class="col-md-4">
            <label for="subcategory" class="form-label fw-bold">Subcategory</label>
            <select class="form-select" v-model="artefactToEdit.subCategory" @click="activarCampos" required>
              <option value="" disabled selected>--select a subcategory--</option>
              <option v-for="subcategory of subCategoriesCSV" :value="subcategory.name">{{ subcategory.name }}</option>
            </select>
          </div>
          <div class="col-md-4">
            <label for="country" class="form-label fw-bold">Country</label>
            <select class="form-select" v-model="artefactToEdit.country" required>
              <option value="" disabled selected>--select a country--</option>
              <option v-for="country of countries" :value="country.name">{{ country.name }}</option>
            </select>
          </div>
          <div class="col-md-4" v-if="typeVisible">
            <label for="type" class="form-label fw-bold">Type</label>
            <select class="form-select" v-model="tipoArtefact" required>
              <option value="" disabled selected>--select a type--</option>
              <option v-for="tipo of typesCSV" :value="tipo.name">{{ tipo.name }}</option>
            </select>
          </div>
          <div class="col-md-4" v-if="caliberVisible">
            <label for="diameter" class="form-label fw-bold">Caliber / Diameter (mm)</label>
            <input type="number" class="form-control" id="diameter" v-model="caliber" placeholder="diameter in mm"
              required />
          </div>
          <div class="col-md-4" v-if="heightVisible">
            <label for="height" class="form-label fw-bold">Height (mm)</label>
            <input type="number" class="form-control" id="height" v-model="height" placeholder="height in mm" required />
          </div>
          <div class="col-md-4" v-if="grossWeightVisible">
            <label for="grosweight" class="form-label fw-bold">Gross weight (gr)</label>
            <input type="number" class="form-control" id="grosweight" v-model="grossWeight"
              placeholder="gros weight in gr" required />
          </div>
          <div class="col-md-4" v-if="explosiveWeightVisible">
            <label for="diameter" class="form-label fw-bold">Explosive weight (gr)</label>
            <input type="number" class="form-control" id="diameter" v-model="explosiveWeight"
              placeholder="explosive weight in gr" required />
          </div>
        </div>
        <div class="row">
          <div class="col-md-8 me-5">
            <label for="description" class="form-label fw-bold">Artefact description</label>
            <textarea class="form-control" id="description" rows="3" v-model="artefactToEdit.descriptionArtefact"
              placeholder="description of the artefact" style="resize: none"></textarea>
          </div>
          <div class="col-md-3 my-5 d-inline-flex">
            <button @click="addFilesToArtefact" type="button" class="btn btn-dark"><font-awesome-icon
                icon="fa-solid fa-folder-plus" size="lg" class="me-2" />Add Files to artefact</button>
          </div>
        </div>
      </div>

      <div v-if="showModal" class="custom-backdrop"></div>
      <div v-if="showModal" class="custom-modal">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="exampleModalLabel">File data</h1>
              <button type="button" class="btn-close" @click="cancelUpload" aria-label="Close"></button>
            </div>
            <div class="modal-body my-1">
              <div class="container alert alert-dark border rounded mb-1">
                <div class="row mb-3">
                  <div class="col-md-6">
                    <div class="form-check form-check-inline">
                      <input class="form-check-input" type="checkbox" id="principal" value="option1" v-model="mainFile"
                        :disabled="mainElegido" />
                      <label class="form-check-label text-dark fw-bold" for="principal">main picture</label>
                    </div>
                  </div>
                </div>
                <div class="row mb-1">
                  <div class="col-md-5">
                    <label for="fileInput" class="custom-file-upload text-black fw-bold choose"> <font-awesome-icon
                        icon="fa-solid fa-folder-open" class="me-2" />Choose a file... </label>
                    <input type="file" id="fileInput" ref="myfile" style="display: none" @change="handleFileChange" />
                  </div>
                </div>
                <div class="row mb-3">
                  <div class="col-md-5 text-center mt-3 text-danger fw-bold">
                    <span v-if="fileSelected">{{ fileSelectedName }}</span>
                    <span v-else>No file selected</span>
                  </div>
                  <div class="col-md-5 mt-3">
                    <progress :value="uploadProgress" max="100"></progress>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-12">
                    <label for="description-file" class="form-label text-dark fw-bold">File description</label>
                    <textarea class="form-control" id="description-file" rows="2" v-model="fileDescription"
                      placeholder="description of the file" style="resize: none"></textarea>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary me-2" @click="cancelUpload"><font-awesome-icon
                  icon="fa-solid fa-square-xmark" class="me-2" />Cancel</button>
              <button :disabled="(uploadProgress != 0) || !fileSelected" type="button" class="btn btn-success my-2"
                @click="uploadFile"><font-awesome-icon class="me-2" icon="fa-solid fa-file-arrow-up" />Upload</button>
            </div>
          </div>
        </div>
      </div>

      <!-- botones de guardar y cancelar -->
      <div class="d-flex justify-content-center p-2 mb-1">
        <button type="submit" class="btn btn-secondary me-2" @click.prevent="editArtefact"><font-awesome-icon
            icon="fa-solid fa-pen-to-square" size="lg" class="me-2" />Update</button>
        <button type="submit" class="btn btn-secondary me-2"
          @click="this.$router.push({ name: 'listartefactspendientes' })"><font-awesome-icon icon="fa-solid fa-xmark"
            size="lg" class="me-2" />Cancel</button>
      </div>

      <!-- list of files added to artefact -->
      <div v-if="artefactToEdit.files && artefactToEdit.files.length > 0"
        class="container alert alert-dark border rounded p-2 mb-0">
        <div class="table-responsive">
          <table class="table table-striped table-hover mb-0">
            <thead>
              <tr>
                <th scope="col">Type</th>
                <th scope="col">Main picture</th>
                <th scope="col">Title</th>
                <th scope="col">Description</th>
                <th scope="col"></th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              <tr class="border" v-for="file in filesArtefact">
                <td>{{ file.tipoFile }}</td>
                <td v-if="file.principal">Yes</td>
                <td v-else>No</td>
                <td>{{ getNameFile(file) }}</td>
                <td>{{ file.descriptionFile }}</td>
                <td><font-awesome-icon icon="fa-solid fa-eye" size="lg" @click="showFileArtefact(file)" class="icon" />
                </td>
                <td><font-awesome-icon icon="fa-solid fa-circle-minus" style="color: #ed333b" size="lg"
                    @click="deleteFileArtefact(file)" class="icon" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="text-center alert alert-dark border rounded p-5 mb-0">
        <h4>No files added to this artefact</h4>
      </div>
    </form>
  </div>
</template>

<style>
.icon,
.choose {
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
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  z-index: 1050;
  overflow: auto;
  max-height: 90vh;
}
</style>
