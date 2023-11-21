<script>
import { mapState } from 'pinia'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import InputText from 'primevue/inputtext'
import ProgressSpinner from 'primevue/progressspinner'
import { usersStore } from '@/stores/users'
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { db, auth } from '@/utils/firebase'
import { doc, deleteDoc } from 'firebase/firestore'

export default {
  components: { DataTable, Column, ColumnGroup, Row, InputText, ProgressSpinner, ConfirmDialog, Toast },
  data() {
    return {
      filters: {
        global: { value: null }
      },
      isLoading: true,
      selectedRow: null
    }
  },
  computed: {
    ...mapState(usersStore, ['listUsers'])
  },
  methods: {
    editUser(event) {
      this.$router.push({ name: 'edituser', params: { id: event.data.id } })
    },
    darDeBajaUser(event, user) {
      event.stopPropagation()
      this.$confirm.require({
        message: 'Are you sure to delete this user ?',
        header: 'Delete confirmation',
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-danger',
        acceptLabel: 'Yes',
        accept: async () => {
          const userToken = await auth.currentUser.getIdToken()
          const url = `https://us-central1-proyecto-coe-20592.cloudfunctions.net/api/users/${user.id}`
          try {
            const response = await fetch(url, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${userToken}`
              }
            })
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            } else {
              deleteDoc(doc(db, 'users', user.id))
              this.$toast.add({ severity: 'success', summary: 'Deleted', detail: user.id, life: 3000 })
              let indexToRemove = this.listUsers.indexOf(user)
              this.listUsers.splice(indexToRemove, 1)
            }
          } catch (error) {
            console.error('Could not delete the user: ', error)
          }
        },
        reject: () => {
          this.$toast.add({ severity: 'error', summary: 'Delete', detail: 'Cancelled', life: 3000 })
        }
      })
    },
    darDeAltaUser() {
      this.$router.push({ name: 'register' })
    }
  },
  mounted() {
    this.toast = useToast()
    this.isLoading = true
    if (this.listUsers) {
      this.isLoading = false
    }
  }
}
</script>
<template>
  <Toast />
  <ConfirmDialog></ConfirmDialog>
  <div class="container p-2">
    <h1 class="titulo p-3 mb-1">USERS LIST</h1>
    <div v-if="isLoading">
      Loading users...
      <ProgressSpinner />
    </div>
    <div v-else class="alert alert-light">
      <div class="d-flex justify-content-between align-items-center">
        <div class="d-inline-flex p-3 align-items-center me-2">
          <span class="p-input-icon-left me-4">
            <i class="pi pi-search" />
            <InputText v-model="filters['global'].value" placeholder="Global Search" />
          </span>
        </div>
        <button type="button" class="btn btn-success ms-3" @click="darDeAltaUser"><font-awesome-icon icon="fa-solid fa-plus" size="lg" class="me-2" />New User</button>
      </div>
      <DataTable class="p-3 alert alert-dark" v-if="listUsers" :value="listUsers" tableStyle="min-width: 50rem" v-model:filters="filters" paginator :rows="6" v-model:selection="selectedRow" @row-click="editUser" selectionMode="single" dataKey="id">
        <Column field="name" header="Name" sortable></Column>
        <Column field="profile" header="Profile" sortable></Column>
        <Column field="email" header="Email" sortable></Column>
        <Column field="empleo" header="Employment/Position" sortable></Column>
        <Column field="unidad" header="Unit/Organism" sortable></Column>
        <Column :exportable="false" style="min-width: 8rem">
          <template #body="slotProps">
            <font-awesome-icon icon="trash" style="color: #d11515" class="icon me-4" @click="darDeBajaUser($event, slotProps.data)" data-bs-toggle="tooltip" data-bs-placement="right" title="clic here to delete this user" />
          </template>
        </Column>
      </DataTable>
      <div v-else class="text-center alert alert-dark p-5 mb-0">
        <p class="fw-bold">No users found</p>
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
</style>
