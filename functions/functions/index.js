const functions = require('firebase-functions')
const admin = require('firebase-admin')
const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors({ origin: true }))
app.use(express.json())

admin.initializeApp()

const authenticate = async (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    res.status(403).send('Unauthorized')
    return
  }
  const idToken = req.headers.authorization.split('Bearer ')[1]
  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken)
    req.user = decodedIdToken
    next()
  } catch (e) {
    res.status(403).send('Unauthorized')
    return
  }
}

const checkIfAdmin = async (req, res, next) => {
  try {
    const userRef = admin.firestore().collection('users').doc(req.user.uid)
    const doc = await userRef.get()
    if (!doc.exists) {
      res.status(404).send('User not found in Firestore')
      return
    }
    const user = doc.data()
    if (user.profile === 'administrator') {
      next()
    } else {
      res.status(403).send('Unauthorized')
    }
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

app.post('/register', authenticate, checkIfAdmin, async (req, res) => {
  const { email, password } = req.body
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
    })
    res.status(201).send({ uid: userRecord.uid })
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
})

app.delete('/users/:uid', authenticate, checkIfAdmin, async (req, res) => {
  const { uid } = req.params
  try {
    await admin.auth().deleteUser(uid)
    res.send({ success: true, message: `User with UID ${uid} deleted.` })
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).send({ error: error.message })
  }
})

app.get('/usersUid/:uid', authenticate, checkIfAdmin, async (req, res) => {
  const { uid } = req.params
  try {
    const userRecord = await admin.auth().getUser(uid)
    res.send({ success: true, user: userRecord })
  } catch (error) {
    console.error('Error fetching user data:', error)
    res.status(500).send({ error: error.message })
  }
})

app.get('/usersByEmail/:email', authenticate, checkIfAdmin, async (req, res) => {
  const email = req.params.email
  try {
    const userRecord = await admin.auth().getUserByEmail(email)
    res.send({ success: true, user: userRecord })
  } catch (error) {
    console.error('Error fetching user data:', error)
    res.status(500).send({ error: error.message })
  }
})

app.get('/', (req, res) => {
  res.send('Cloud Function Proyecto CIED-COE OK')
})

// Iniciar función en servidor

// Nube
exports.api = functions.https.onRequest(app)

// localhost (ejecutar comando: "node index.js")
// const PORT = 3000
// app.listen(PORT, () => {
//   console.log(`Servidor corriendo en http://localhost:${PORT}`)
// })