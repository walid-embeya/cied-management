<script setup>
import { db } from '@/utils/firebase'
import { doc, setDoc } from "firebase/firestore"
import { ref, onMounted } from 'vue'
import { usersStore } from '@/stores/users'
import Dialog from "primevue/dialog"
import { useRouter } from 'vue-router'

const router = useRouter()
const store = usersStore()
const userToEdit = ref(null)
const idUser = ref('')

////// para dialog primevue
const visible = ref(false)
const mensajeDialog = ref('')
const userUpdated = ref(false)

async function update() {
  if (userToEdit.value.id) {
    delete userToEdit.value.id
  }
  const userRef = doc(db, 'users', idUser.value)
  await setDoc(userRef, userToEdit.value).then((resp) => {
    userUpdated.value = true
    visible.value = true
    mensajeDialog.value = "data user updated with success"
    store.getUsers()
  })
    .catch((error) => {
      console.error("Error on updating user", error)
      userUpdated.value = false
      visible.value = true
      mensajeDialog.value = "Error on updating user !"
    })
}

onMounted(async () => {
  idUser.value = router.currentRoute.value.params.id
  await store.getUserPorId(idUser.value)
  userToEdit.value = { ...store.userStore }
})
</script>

<template>
  <Dialog v-model:visible="visible" modal header="Mensaje" :style="{ width: '30vw' }">
    <p>
      <font-awesome-icon v-if="userUpdated" icon="fa-solid fa-check" size="2xl" style="color: #0f8f35" class="me-3" />
      <font-awesome-icon v-else icon="fa-solid fa-circle-exclamation" size="2xl" style="color: #ff0000" class="me-3" />
      {{ mensajeDialog }}
    </p>
    <template #footer>
      <div class="d-flex justify-content-center">
        <button class="btn btn-secondary" @click="visible = false">OK</button>
      </div>
    </template>
  </Dialog>
  <div class="container mt-5 p-5">
    <div class="row justify-content-center py-5">
      <div class="col-md-5 alert alert-dark border rounded">
        <h1 class="titulo">EDIT USER</h1>
        <hr>
        <form v-if="userToEdit" @submit.prevent="update">
          <div class="mb-3 mt-4">
            <div class="input-group">
              <span class="input-group-text"><font-awesome-icon icon="fa-solid fa-user" size="lg"
                  style="color: #77767b;" /></span>
              <input type="email" class="form-control fw-bold" id="floatingInput" placeholder="name@example.com"
                v-model="userToEdit.email" :disabled="true">
            </div>
          </div>
          <div class="mb-3">
            <div class="form-floating">
              <input type="text" class="form-control" id="name" v-model="userToEdit.name" placeholder="name surname"
                required>
              <label for="name">Name Surname</label>
            </div>
          </div>
          <div class="mb-3">
            <div class="form-floating">
              <input type="text" class="form-control" id="empleo" v-model="userToEdit.empleo"
                placeholder="employment/position" required>
              <label for="empleo">Employment/Position</label>
            </div>
          </div>
          <div class="mb-3">
            <div class="form-floating">
              <input type="text" class="form-control" id="unidad" v-model="userToEdit.unidad" placeholder="unit/organism"
                required>
              <label for="unidad">Unit/Organism</label>
            </div>
          </div>
          <div class="mb-4">
            <div class="form-floating">
              <select class="form-select" v-model="userToEdit.profile" required>
                <option value="" disabled selected>--assign a profile to user--</option>
                <option value="administrator">Administrator</option>
                <option value="analyst">Analyst</option>
                <option value="consultation">Consultation</option>
              </select>
              <label for="profile">Profile</label>
            </div>
          </div>
          <div class="input-group justify-content-center mb-1">
            <button type="submit" class="btn btn-secondary me-2 border rounded"><font-awesome-icon
                icon="fa-solid fa-pen-to-square" size="lg" class="me-2" />Update</button>
            <button type="button" class="btn btn-secondary border rounded"
              @click="router.push({ name: 'listusers' })"><font-awesome-icon icon="fa-solid fa-xmark" size="lg"
                class="me-2" />Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>