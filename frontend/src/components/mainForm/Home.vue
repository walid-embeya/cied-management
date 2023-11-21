<template>
  <div class="home-background"></div>
</template>
  
<style scoped>
.home-background {
    height: 70vh;
    width: 100vw;
    background-image: url('/LOGO-CIED-MANAGEMENTV3.webp');
    background-position: center 50%;
    background-repeat: no-repeat;
    display: flex;
    justify-content: center;
    align-items: center;
}

@media  (min-width: 901px) {
    .home-background {
        background-size: 45%;
    }
}

@media (min-width: 501px) and (max-width: 900px) {
    .home-background {
        background-size: 60%;
    }
}

@media (min-width: 200px) and (max-width: 500px) {
    .home-background {
        background-size: 70%;
    }
}

@media  (max-width: 199px) {
    .home-background {
        background-size: 70%;
    }
}
</style>
