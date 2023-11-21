## Descripción

**C-IED Management** es una aplicación web diseñada para el Centro de Excelencia Contra Artefactos Explosivos Improvisados (C-IED CoE) con el fin de agilizar la gestión de municiones vinculadas al mundo C-IED.

![Logo](https://git.institutomilitar.com/VICENTEEC/C-IED-Management/-/wikis/imagenes/LOGO%20CIED%20MANAGEMENT80.jpg)

A través de esta aplicación se podrá:

+ Llevar un registro de todos los artefactos de interés para el (C-IED CoE).
+ Integrar y consultar los archivos correspondientes a los artefactos (imagenes, video, documentos, imagen 3D, etc).

## Diagrama de clases

![Diagrama_de_clases](https://git.institutomilitar.com/VICENTEEC/C-IED-Management/-/wikis/diagramas/diag_clase_COE.png)

## Instalación

### Pre-requisitos e IDEs utilizados

Para Backend

- Cuenta de Google para utilizar [firebase](https://console.firebase.google.com/u/1/):
  - Firestore Database: Base de datos NoSQL.
  - Storage: Almacenamiento de archivos.
  - Authentication: Autenticación en la aplicación y permisos.
  - Cloud Functions: Para utilizar funciones en la nube de Google.

Para Front

- npm@9.5.0 o superior.
- nodejs@18.14.2 o superior.
- vue3+vite
- IDE Visual Studio Code@1.77.3 o superior.
- Navegador Firefox/Chrome/Edge

Otros

- Git
- Postman

### Pasos de instalación para pruebas en local

#### Preparación del back

Navegar a [firebase](https://firebase.google.com/products-build?hl=es) de Google

1. Hacer click en `Comenzar ahora` y posteriormente en `Agregar proyecto`.
2. Ingresar el nombre del proyecto y hacer click en `Continuar`.
   1. Deshabilitar `Google Analytics` para este proyecto y hacer click en `Crear proyecto`.
   2. Cuando salga el mensaje `Tu proyecto nuevo está listo`, hacer click en `Continuar`.
3. En `Compilación`, hacer click en `Authentication`.
   1. Hacer click en `Comenzar`.
   2. Elegir en `Proveedores nativos` `Correo electrónico/contraseña`.
   3. Habilitar `Correo electrónico/contraseña` y hacer click en `Guardar`.
   4. En la parte superior navegar hasta `Users`y `Agregar usuario` introduciendo Correo electrónico y Contraseña.
4. En `Compilación`, hacer click en `Firestore Database`.
   1. Hacer click en `Crear base de datos`.
   2. Dejar la `Ubicación` por defecto y pulsar `Siguiente`.
   3. Seleccionar `Comenzar en modo de prueba` y pulsar `Habilitar`.
5. En `Compilación`, hacer click en `Storage`.
   1. Hacer click en `Comenzar`.
   2. Seleccionar `Comenzar en modo de prueba` y pulsar `Siguiente`.
   3. Dejar la `Ubicación` por defecto y pulsar `Listo`.
5. En `Compilación`, hacer click en `Functions`.
   1. Hacer click en `Actualizar proyecto`.
   2. Elegir el plan de Prepago `Blaze` y pulsar `Continuar` (para usar las Cloud Functions se necesita introducir una tarjeta de débito/crédito).
   3. Elegir un importe en € y pulsar `Continuar` (solamente cobrarían tarifas muy bajas en el caso que haya un tráfico muy elevado) y `Comprar`.
   4. Volvemos de nuevo a `Compilación` y `Functions` y pulsar en `Comenzar`, `Continuar`y `Finalizar`.
6. En la parte superior, en `Descripción general`, hacer click en la rueda de configuración e ir a `Configuración del proyecto`, posteriormente a `General`y en la parte inferior se puede visualizar el mensaje `No hay apps en tu proyecto`. 
   1. Hacer click en `</>`.
   2. Registrar app introducinedo un nombre.
   3. No marcar la casilla de `Firebase Hosting`.
   4. Hacer click en `Registrar app`.
   5. Hacer click en `Ir a la consola`.
   6. Copiar el código del objeto `const firebaseConfig` que aparece para utilizarlo más adelante.


#### Instalación front

1. Abrir una carpeta cualquiera y abrir una terminal.
2. Clonar el repositorio con el comando ``git clone https://git.institutomilitar.com/VICENTEEC/C-IED-Management.git`
3. Introducir credenciales para descargar el proyecto.
4. Moverse a la carpeta `/C-IED-Management/frontend` y ejecutar `npm install` para que se importen las librerías.
5. Ir al archivo `firebase.js` localizado en `/C-IED-Management/frontend/src/utils`.
6. Sustituir las propiedades del objeto  `const firebaseConfig` por las del punto 6.6 de preparación del back.
7. Ejecutar los siguientes comandos desde `/C-IED-Management/functions/functions` para poder subir las cloud functions a firebase:
   1. npm install -g firebase tools.
   2. firebase login.
   3. Navegar a la url que se muestra en la terminal e introducir email del proyecto y contraseña.
   4. Volver a la terminal y ejecurar firebase init.
   5. Seleccionar `Cloud Functions`.
   6. Seleccionar el nombre del proyecto de firebase.
   7. Seleccionar `Javascript` como lenguaje.
   8. Seleccionar `No` a la hora de usar ESLint.
   9. Seleccionar `Yes` para instalar dependencias con npm.
   10. Subir las Cloud Functions a Firebase con el comando `firebase deploy --only functions`.
8. En `/C-IED-Management/frontend` arrancar la aplicación en local con `npm run dev`.

## URLs del proyecto
  1. Repositorio del proyecto: https://git.institutomilitar.com/VICENTEEC/C-IED-Management

## Despliegue en Internet
  1. Backend: https://console.firebase.google.com/u/1/project/gestion-cied-coe/overview
  2. Web: https://ciedmanagement.netlify.app/#/home

## Equipo SCRUM

- **Scrum Master**: Comandante D. Ismael Lanchas Díaz (@Awes0meM4n)

- **Product Owner**: D. Walid Embeya (@walid-embeya)

- **Equipo Desarrollo**:
  - Comandante D. Walid Embeya (@walid-embeya) 
  - Capitán D. Vicente Espiñera Cachaza (@VICENTEEC)

