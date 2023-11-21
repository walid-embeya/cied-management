import reduce from "image-blob-reduce"

const reducer = reduce()

const TARGET_WIDTH = 100
const TARGET_HEIGHT = 70

// Forzamos la conversión a JPEG con calidad 0.4
reducer._create_blob = function (env) {
  return this.pica
    .toBlob(env.out_canvas, "image/jpeg", 0.4)
    .then(function (blob) {
      env.out_blob = blob
      return env
    });
}

// Establecer el tamaño exacto de la imagen
reducer._calculate_size = function (env) {
  env.transform_width = TARGET_WIDTH
  env.transform_height = TARGET_HEIGHT
  return env
}

export{ reducer } 
