const n = 10000000
const doors = 3


class Doors {
  constructor() {
    this.door = ['goat', 'goat', 'goat']

    this.chosen = false
    this.open = false

    this.door[Math.floor(Math.random() * 3)] = 'car'
  }

  chooseRandomDoor() {
    this.chosen = Math.floor(Math.random() * 3)
  }

  openRandomDoor() {
    let random = Math.floor(Math.random() * 3) 
    while (this.door[random] === 'car' || random === this.chosen) {
      random = Math.floor(Math.random() * 3) 
    }
    this.open = random
  }

  getDoorWithGoat() {
    let i = 0
    while (true) {
      if (this.door[i] === 'car') return i
      i++
    }
  }

  pickLastDoor() {
    let i = 0
    while (i === this.chosen || i === this.open ) {
      i++
    }
    return i
  }
}

let good_guesses = 0
let bad_guesses = 0

for (let i = 0; i < n; i++) {
  const myDoors = new Doors()

  myDoors.chooseRandomDoor()
  
  myDoors.openRandomDoor()

  //console.log('First guess: ' + myDoors.chosen)
  //console.log('Opened by vært: ' + myDoors.open)

  let new_door = myDoors.pickLastDoor()
  let door_with_goat = myDoors.getDoorWithGoat()

  //console.log('Den nye valgte dør: ' + new_door)
  //console.log('Door with goat: ' + door_with_goat)

  if (new_door === door_with_goat) {
    good_guesses += 1
  } else {
    bad_guesses += 1
  }
}

console.log(`Antal gange bilen er fundet ved at skifte dør: ${good_guesses} / ${n} = ${good_guesses / n}`)
console.log(`Antal gange bilen ikke er fundet ved at skifte dør: ${bad_guesses} / ${n} = ${bad_guesses / n}`)