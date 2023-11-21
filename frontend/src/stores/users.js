import { defineStore } from "pinia"
import { ref } from "vue"
import { auth, db } from "@/utils/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { getDocs, collection } from 'firebase/firestore'

export const usersStore = defineStore("autentticacion", () => {
  const user = ref(null)
  const listUsers = ref([])
  const userStore = ref(null)

  onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      user.value = currentUser
    } else {
      user.value = null
    }
  })
  async function getUsers() {
    listUsers.value = []
    await getDocs(collection(db, 'users')).then((resp) => {
      resp.docs.forEach((userDoc) => {
        listUsers.value.push({ ...userDoc.data(), id: userDoc.id })
      })
    })
  }
  function getUserPorId(idUser) {
    userStore.value = listUsers.value.find((user) => user.id === idUser)
  }

  function userIsAdmin() {
    const currentUser = auth.currentUser
    const foundUser = currentUser && listUsers.value.find(user => user.id === currentUser.uid)
    return foundUser && foundUser.profile === 'administrator'
  }

  function userIsConsultation() {
    const currentUser = auth.currentUser
    const foundUser = currentUser && listUsers.value.find(user => user.id === currentUser.uid)
    return foundUser && foundUser.profile === 'consultation'
  }

  return { user, listUsers, userStore, getUsers, getUserPorId, userIsAdmin, userIsConsultation }
})
