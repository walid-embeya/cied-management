<script>
import { db, storage } from "@/utils/firebase"
import { collection, addDoc, doc, setDoc } from "firebase/firestore"
import { ref, uploadBytes, uploadBytesResumable } from "firebase/storage"
import countriesJson from "@/assets/countries.json"
import { mapActions, mapState } from "pinia"
import { artefactosStore } from "@/stores/artefacts"
import { comprobarCategoria } from "@/utils/utils"
import { reducer } from "@/utils/reduceImage"
import { usersStore } from "@/stores/users"

const listCountries = countriesJson.countries

export default {
  components: {},
  data() {
    return {
      dataArtefact: {
        name: "",
        country: "",
        category: "",
        subCategory: "",
        descriptionArtefact: "",
        files: [],
        createdDate: new Date(),
      },
      countries: [],
      idArtefact: "",
      filesArtefact: [],
      fileSelected: false,
      fileSelectedName: "",
      mainFile: false,
      fileDescription: "",
      mainElegido: false,
      showModal: false,
      uploadProgress: 0,
      listSubcategActive: false,
      mainFile3D: false,
      saveArtefact: true,

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
    ...mapState(artefactosStore, ["listArtefacts"]),
    ...mapState(usersStore, ["user", "userStore"]),
  },
  methods: {
    ...mapActions(artefactosStore, ["getArtefactos"]),
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
      if (this.subCategoriesCSV) {
        this.listSubcategActive = true
      }
      this.activarCampos()
    },
    activarCampos() {
      if (this.dataArtefact.category && this.dataArtefact.subCategory) {
        this.typeVisible = true
        this.caliberVisible = true
        this.heightVisible = true
        this.grossWeightVisible = true
        this.explosiveWeightVisible = true

        ///// buscar data a partir un category y un subcategory
        const elemento = this.csvData.find((data) => data.category === this.dataArtefact.category && data.subcategory === this.dataArtefact.subCategory)
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
    cleanComponent() {
      this.dataArtefact.name = ""
      this.dataArtefact.country = ""
      this.dataArtefact.category = ""
      this.dataArtefact.subCategory = ""
      this.dataArtefact.descriptionArtefact = ""

      delete this.dataArtefact.caliber 
      delete this.dataArtefact.height 
      delete this.dataArtefact.grossWeight 
      delete this.dataArtefact.explosiveWeight 
      delete this.dataArtefact.tipoArtefact 
      
      this.tipoArtefact = ''
      this.caliber = 0
      this.height = 0
      this.grossWeight = 0
      this.explosiveWeight = 0
      this.typeVisible = true
      this.caliberVisible = true
      this.heightVisible = true
      this.grossWeightVisible = true
      this.explosiveWeightVisible = true

      this.listSubcategActive = false
      this.idArtefact = ""
      this.filesArtefact = []
      this.fileSelected = false
      this.fileSelectedName = ""
      this.mainFile = false
      this.fileDescription = ""
      this.mainElegido = false
      this.uploadProgress = 0
      this.saveArtefact = true
    },
    async addArtefact() {
      if (comprobarCategoria(this.dataArtefact.category, this.dataArtefact.subCategory)) {
        if (this.typeVisible) {
          this.dataArtefact.tipoArtefact = this.tipoArtefact
        }
        if (this.caliberVisible) {
          this.dataArtefact.caliber = this.caliber
        }
        if (this.heightVisible) {
          this.dataArtefact.height = this.height
        }
        if (this.grossWeightVisible) {
          this.dataArtefact.grossWeight = this.grossWeight
        }
        if (this.explosiveWeightVisible) {
          this.dataArtefact.explosiveWeight = this.explosiveWeight
        }
        const collectionRef = collection(db, "artefactosPendientes")
        await addDoc(collectionRef, this.dataArtefact)
          .then((resp) => {
            this.idArtefact = resp.id
            this.listArtefacts.push(this.dataArtefact)
            this.saveArtefact = false
          })
          .catch((error) => {
            console.error("Error on creation a new artefact : ", error.code)
          })
      } else {
        console.error("subcategory incompatible with category !")
      }
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
            console.error("Error uploading:", error);
            this.uploadProgress = 0
          },
          async () => {
            const isImage = file.type.startsWith("image/");
            const dataFile = {
              principal: this.mainFile,
              pathOrigine: ruta,
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
            setDoc(artefactRef, { files: this.filesArtefact }, { merge: true })
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
    this.loadCSV()
  },
  async mounted() {
    this.dataArtefact.owner = this.user.uid
    await this.getUserPorId(this.user.uid)
    this.dataArtefact.ownerName = this.userStore.name
    await this.getArtefactos("artefactosPendientes", [])
  },
}
</script>

<template>
  <div class="container p-2">
    <h1 class="titulo p-3 mb-1">ADD NEW ARTEFACT</h1>
    <form class="p-2 border rounded">
      <div class="container alert alert-secondary border rounded mb-1">
        <div class="row mb-3">
          <div class="col-md-4">
            <label for="name" class="form-label fw-bold">Name</label>
            <input type="text" class="form-control" id="name" v-model="dataArtefact.name"
              placeholder="name of the artefact" required />
          </div>
          <div class="col-md-4">
            <label for="category" class="form-label fw-bold">Category</label>
            <select class="form-select" v-model="dataArtefact.category"
              @change="selectSubcategoriesCSV(dataArtefact.category)" required>
              <option value="" disabled selected>--select a category--</option>
              <option v-for="category of categoriesCSV" :value="category.name">{{ category.name }}</option>
            </select>
          </div>
          <div class="col-md-4">
            <label for="subcategory" class="form-label fw-bold">Subcategory</label>
            <select class="form-select listSubcat" v-model="dataArtefact.subCategory" :disabled="!listSubcategActive"
              @click="activarCampos" required>
              <option value="" disabled selected>--select a subcategory--</option>
              <option v-for="subcategory of subCategoriesCSV" :value="subcategory.name">{{ subcategory.name }}</option>
            </select>
          </div>
          <div class="col-md-4">
            <label for="country" class="form-label fw-bold">Country</label>
            <select class="form-select" v-model="dataArtefact.country" required>
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
            <input type="number" class="form-control" id="diameter" v-model="caliber"
              placeholder="diameter in mm" required />
          </div>
          <div class="col-md-4" v-if="heightVisible">
            <label for="height" class="form-label fw-bold">Height (mm)</label>
            <input type="number" class="form-control" id="height" v-model="height"
              placeholder="height in mm" required />
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
            <label for="description" class="form-label fw-bold">Artefact Description</label>
            <textarea class="form-control" id="description" rows="3" v-model="dataArtefact.descriptionArtefact"
              placeholder="description of the artefact" style="resize: none"></textarea>
          </div>
          <div v-if="idArtefact" class="col-md-3 my-5 d-inline-flex">
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
              <h1 class="modal-title fs-5" id="exampleModalLabel">File Data</h1>
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
                    <label for="description-file" class="form-label text-dark fw-bold">File Description</label>
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

      <div class="d-flex justify-content-center p-2 mb-1">
        <button :disabled="!saveArtefact" type="submit" class="btn btn-secondary me-2" @click.prevent="addArtefact"><font-awesome-icon
            icon="fa-solid fa-floppy-disk" size="lg" class="me-2" />Save</button>
        <button type="submit" class="btn btn-secondary me-2" @click.prevent="cleanComponent"><font-awesome-icon
            icon="fa-solid fa-plus" size="lg" class="me-2" />New</button>
        <button type="submit" class="btn btn-secondary me-2"
          @click="this.$router.push({ name: 'home' })"><font-awesome-icon icon="fa-solid fa-xmark" size="lg"
            class="me-2" />Close</button>
      </div>
      <div v-if="listArtefacts" class="container alert alert-dark border rounded p-2 mb-0">
        <div class="list-artefacts table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th scope="col" class="test">Name</th>
                <th scope="col">Country</th>
                <th scope="col">Category</th>
                <th scope="col">Subcategory</th>
                <th scope="col">Type</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border" v-for="artefact in listArtefacts" :key="artefact.id">
                <th scope="row">{{ artefact.name }}</th>
                <td>{{ artefact.country }}</td>
                <td>{{ artefact.category }}</td>
                <td>{{ artefact.subCategory }}</td>
                <td>{{ artefact.tipoArtefact }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="d-flex justify-content mt-2">
          <h5 class="fw-blod text-dark me-3">Total :</h5>
          <h5 class="fw-blod text-danger">{{ listArtefacts.length }} artefacts</h5>
        </div>
      </div>
      <div v-else class="text-center alert alert-dark border rounded p-5 mb-0">
        <h4>Loading list of artefacts...</h4>
      </div>
    </form>
  </div>
</template>

<style>
.choose {
  cursor: pointer;
}

.list-artefacts {
  height: 200px;
  overflow-y: scroll;
}

.custom-file-upload:hover {
  cursor: pointer;
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

.listSubcat:disabled {
  background-color: rgb(187, 187, 183);
}
</style>
