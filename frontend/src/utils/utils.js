export function comprobarCategoria(categoria, subcategoria) {
    let resultado = false

    if ((subcategoria === 'ANTI PERSONNEL') || (subcategoria === 'ANTI PERSONNEL FRAGMENTATION') || (subcategoria === 'ANTI TANK') || (subcategoria === 'SCATTERABLE') || (subcategoria === 'NAVAL')) {
        if (categoria === 'MINES') {
            resultado = true
        }
    }

    if ((subcategoria === 'PERCUSSION') || (subcategoria === 'JERK FUNCTIONING') || (subcategoria === 'TIMING') || (subcategoria === 'SELF-DESTRUCTION (SD)') || (subcategoria === 'PROXIMITY')) {
        if (categoria === 'FUZES') {
            resultado = true
        }
    }

    if ((subcategoria === 'HIGH EXPLOSIVE (HE)') || (subcategoria === 'CHEMICAL') || (subcategoria === 'TRAINING PURPOSES')) {
        if (categoria === 'HAND GRENADES') {
            resultado = true
        }
    }

    if ((subcategoria === 'ANTIPERSONNEL') || (subcategoria === 'HIGH EXPLOSIVE ANTI-TANK (HEAT)') || (subcategoria === 'HIGH EXPLOSIVE DUAL PURPOSE (HEDP)') || (subcategoria === 'SMOKE') || (subcategoria === 'INCENDIARY') || (subcategoria === 'CHEMICAL') || (subcategoria === 'ILLUMINATING') || (subcategoria === 'TRAINING PURPOSES')) {
        if (categoria === 'RIFLE GRENADES') {
            resultado = true
        }
    }

    if ((subcategoria === 'ANTI-PERSONNEL') || (subcategoria === 'HIGH EXPLOSIVE DUAL PURPOSE (HEDP)') || (subcategoria === 'SMOKE') || (subcategoria === 'INCENDIARY') || (subcategoria === 'CHEMICAL') || (subcategoria === 'ILLUMINATING') || (subcategoria === 'TRAINING PURPOSES')) {
        if (categoria === 'PROJECTED GRENADES') {
            resultado = true
        }
    }

    if ((subcategoria === 'ANTI-PERSONNEL') || (subcategoria === 'SMOKE') || (subcategoria === 'INCENDIARY') || (subcategoria === 'ILLUMINATING') || (subcategoria === 'CLUSTER')
        || (subcategoria === 'HIGH EXPLOSIVE ANTI-TANK (HEAT)') || (subcategoria === 'TRAINING PURPOSES') || (subcategoria === 'HIGH EXPLOSIVE ROCKET ASSISTED (HERA)') || (subcategoria === 'PRECISION GUIDED MUNITION MORTAR (PGMM)')) {
        if (categoria === 'MORTAR BOMBS') {
            resultado = true
        }
    }

    if ((subcategoria === 'HIGH EXPLOSIVE') || (subcategoria === 'HIGH EXPLOSIVE FRAGMENTATION (HE-F)') || (subcategoria === 'SMOKE') || (subcategoria === 'ILLUMINATING') || (subcategoria === 'INCENDIARY')
        || (subcategoria === 'KINETIC ENERGY ARMOUR PIERCING') || (subcategoria === 'CHEMICAL ENERGY ARMOUR PIERCING') || (subcategoria === 'SEMI ARMOUR PIERCING') || (subcategoria === 'FLECHETTE')
        || (subcategoria === 'CLUSTER') || (subcategoria === 'CHEMICAL') || (subcategoria === 'NUCLEAR')  || (subcategoria === 'TRAINING PURPOSES')  || (subcategoria === 'ROCKET ASSISTED PROJECTILES (RAP)')  || (subcategoria === 'EXTENDED RANGE SUBCALIBRATED')
        || (subcategoria === 'EXTENDED RANGE SUB-BORE') || (subcategoria === 'EXTENDED RANGE FULL-BORE') || (subcategoria === 'BASE-BLEED')  || (subcategoria === 'PRECISION GUIDED MUNITION (PGM)') ) {
        if (categoria === 'PROJECTILES') {
            resultado = true
        }
    }

    if ((subcategoria === 'ARTILLERY') || (subcategoria === 'AVIATION') || (subcategoria === 'PORTABLE') || (subcategoria === 'HIGH EXPLOSIVE (HE)') || (subcategoria === 'HIGH EXPLOSIVE (FRAGMENTATION)')
        || (subcategoria === 'ANTI-TANK') || (subcategoria === 'ANTI-BUNKER') || (subcategoria === 'HIGH EXPLOSIVE DUAL PURPOSE (HEDP)') || (subcategoria === 'SMOKE')
        || (subcategoria === 'ILLUMINATING') || (subcategoria === 'INCENDIARY') || (subcategoria === 'CLUSTER')  || (subcategoria === 'FLECHETTE')  || (subcategoria === 'ELECTRONIC MEASURES')  || (subcategoria === 'TRAINING PURPOSES')
        || (subcategoria === 'PRECISION-GUIDED MUNITIONS (PGM)')) {
        if (categoria === 'ROCKETS') {
            resultado = true
        }
    }

    if ((subcategoria === 'AIR TO AIR (AAM)') || (subcategoria === 'AIR TO SURFACE (ASM)') || (subcategoria === 'SURFACE TO AIR (SAM)') || (subcategoria === 'SURFACE TO SURFACE (SSM)') || (subcategoria === 'ANTI TANK GUIDED MISSILE (ATGM)')
        || (subcategoria === 'MAN PORTABLE AIR DEFENSE SYSTEM (MANPAD)') || (subcategoria === 'ANTI-SHIP')) {
        if (categoria === 'MISSILES') {
            resultado = true
        }
    }

    if ((subcategoria === 'HIGH EXPLOSIVE FRAGMENTATION (HE-F)') || (subcategoria === 'FRAGMENTATION') || (subcategoria === 'HIGH EXPLOSIVE ANTI-TANK (HEAT)') || (subcategoria === 'HIGH EXPLOSIVE DUAL PURPOSE (HEDP)')) {
        if (categoria === 'SUBMUNITIONS') {
            resultado = true
        }
    }

    if ((subcategoria === 'GENERAL PURPOSE (GP)') || (subcategoria === 'LIGHT CASE BOMB (LG)') || (subcategoria === 'ARMOR PIERCING (AP)') || (subcategoria === 'SEMI ARMOUR PIERCING (SAP)') || (subcategoria === 'DEPTH BOMB')
        || (subcategoria === 'CHEMICAL') || (subcategoria === 'SMOKE') || (subcategoria === 'INCENDIARY') || (subcategoria === 'CLUSTER')
        || (subcategoria === 'TRINING PURPOSES') || (subcategoria === 'LASER GUIDED BOMB') || (subcategoria === 'GPS GUIDED BOMB')) {
        if (categoria === 'BOMBS') {
            resultado = true
        }
    }

    if ((subcategoria === 'COMMAND') || (subcategoria === 'TIME') || (subcategoria === 'VICTIM OPERATED')) {
        if (categoria === 'IED') {
            resultado = true
        }
    }

    if ((subcategoria === 'FLIGHT CONTROL SYSTEM') || (subcategoria === 'IMAGERY SYSTEM') || (subcategoria === 'WEAPON SYSTEM')) {
        if (categoria === 'UAV') {
            resultado = true
        }
    }

    return resultado
}

export function convertTimestampToDate(timestamp) {
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000)
}

export function formatDate(date) {
    return date.toLocaleDateString('en-GB', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
}