import { createApp } from 'vue'
import App from './App.vue'
import Home from './components/mainForm/Home.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createPinia } from 'pinia'

import "primevue/resources/themes/lara-light-indigo/theme.css"
import "primevue/resources/primevue.min.css"
import "primeicons/primeicons.css"
import PrimeVue from 'primevue/config'

import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'

import '@/scss/styles.scss'
import * as bootstrap from 'bootstrap'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faUser, faEnvelope, faLock, faEye, faEyeSlash, faRightFromBracket, faFloppyDisk, faFileArrowUp, faFolderOpen, faRotateLeft, faCircleExclamation, faEnvelopeCircleCheck } from '@fortawesome/free-solid-svg-icons'
import { faPlus, faXmark, faFolderPlus, faSquareXmark, faTrash, faPenToSquare, faCircleInfo, faCube, faCircleMinus, faExclamation, faDownload, faCircleCheck, faCheck } from '@fortawesome/free-solid-svg-icons'
library.add(faUser, faEnvelope, faLock, faEye, faEyeSlash, faRightFromBracket, faFileArrowUp, faFolderOpen, faPlus, faXmark,  faTrash, faPenToSquare, faCircleInfo)
library.add(faFloppyDisk, faFolderPlus, faSquareXmark, faCube, faCircleMinus, faExclamation, faDownload, faCircleCheck, faCheck, faRotateLeft, faCircleExclamation, faEnvelopeCircleCheck)

const pinia = createPinia()

const Login = () => import('@/components/Login.vue')
const AddArtefact = () => import('@/components/artefacts/AddArtefact.vue')
const ListArtefactos = () => import('@/components/artefacts/ListArtefactos.vue')
const ViewArtefact = () => import('@/components/artefacts/ViewArtefact.vue')
const EditArtefact = () => import('@/components/artefacts/EditArtefact.vue')
const ListUsers = () => import('@/components/users/ListUsers.vue') 
const EditUser = () => import('@/components/users/EditUser.vue')  
const Register = () => import('@/components/users/Register.vue') 
const NotFound = () => import('@/components/NotFound.vue')

const routes = [
    { path: '/', redirect: '/home' },
    { path: '/home', component: Home, name: 'home' },
    { path: '/login', component: Login, name: 'login' },
    { path: '/newartefact', component: AddArtefact, name: 'newartefact' },
    { path: '/standbyartefacts', component: ListArtefactos, props: { listname: 'pendientes' }, name: 'listartefactspendientes' },
    { path: '/validartefacts', component: ListArtefactos, props: { listname: 'confirmados' }, name: 'listartefactsconfirmados' },
    { path: '/artefacts/:id', component: ViewArtefact, name: 'viewartefact', props: true },
    { path: '/artefacts/:id/editartefact', component: EditArtefact, name: 'editartefact' },
    { path: '/users', component: ListUsers, name: 'listusers' },  
    { path: '/users/:id/edituser', component: EditUser, name: 'edituser' },
    { path: '/users/register', component: Register, name: 'register' }, 
    { path: '/:pathMatch(.*)*', name: 'notfound', component: NotFound },
  ]
const router = createRouter({
    history: createWebHashHistory(),
    routes,
  })

  import { usersStore } from './stores/users'
  router.beforeEach(async (to, from) => {
    const userStore = usersStore()
    if (!userStore.user && (to.name === 'newartefact' || to.name === 'listartefactspendientes' || to.name === 'listartefactsconfirmados' || to.name === 'viewartefact' || to.name === 'editartefact')) {
      return { name: 'home' }
    }
  
    if (!userStore.userIsAdmin() && (to.name === 'listusers' || to.name === 'edituser' || to.name === 'register')) {
      return { name: 'home' }
    }
  
    if (userStore.userIsConsultation() && (to.name === 'listartefactspendientes' || to.name === 'newartefact' || to.name === 'editartefact')) {
      return { name: 'home' }
    }
  })

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(PrimeVue)
app.use(ConfirmationService);
app.use(ToastService)
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')

