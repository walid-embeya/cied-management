import { defineStore } from 'pinia'
import { db, storage } from '@/utils/firebase'
import { getDocs, collection, doc, deleteDoc, query } from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'

export const artefactosStore = defineStore('artefactos', {
  state: () => ({
    listArtefacts: [],
    artefactStore: null,
  }),
  actions: {
    async getArtefactos(nombreColeccion, filtros) {
      this.listArtefacts = []
      const q = query(collection(db, nombreColeccion), ...filtros)
      const querySnapshot = await getDocs(q)
      querySnapshot.forEach((doc) => {
        this.listArtefacts.push({ ...doc.data(), id: doc.id })
      })
    },
    getArtefactPorId(idDocumento) {
      this.artefactStore = this.listArtefacts.find((artefact) => artefact.id === idDocumento)
    },
    deleteArtefact(artefact, collection) {
      deleteDoc(doc(db, collection, artefact.id)).then((resp) => {
        if (artefact.files) {
          artefact.files.forEach((file) => {
            const fileOrigineRef = ref(storage, file.pathOrigine)
            deleteObject(fileOrigineRef)
            if (file.pathReduced) {
              const fileReducedRef = ref(storage, file.pathReduced)
              deleteObject(fileReducedRef)
            }
          })
        }
        let indexToRemove = this.listArtefacts.indexOf(artefact)
        this.listArtefacts.splice(indexToRemove, 1)
      }).catch((error) => {
        console.error('error on delete artefact : ', error)
      })
    },
  }
})