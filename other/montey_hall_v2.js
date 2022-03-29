const iterations = 10000000
const doors = 3
const winPrize = 'car'
const losePrize = 'goat'

function randomNumber(n) {
  return Math.floor(Math.random() * n)
}

function generatePrizeIndex(doors) {
const winPrizeIndex = randomNumber(doors)
return winPrizeIndex
}

class gameShow {
  constructor(doors) {
    this.winPrizeIndex = generatePrizeIndex(doors)
    this.chosenDoorIndex = undefined
    this.doorToChooseIndex 
  }

  chooseRandomDoor() {
    this.chosenDoorIndex = randomNumber(doors)
  }

  findOneLockedDoor() {
    let index
    
    if (this.chosenDoorIndex === this.winPrizeIndex) {
      let index = randomNumber(doors)
      while (index === this.winPrizeIndex) {
        index = randomNumber(doors)
      }
    } else {
      index = this.winPrizeIndex
    }

    this.doorToChooseIndex = index
  }

  chooseSecondDoorAndCheckPrize() {
    return (this.doorToChooseIndex === this.winPrizeIndex) ? true : false
  }
}

let wins = 0
let defeats = 0

for (let i = 0; i < iterations; i++) {
  const game = new gameShow(doors)

  game.chooseRandomDoor()
  game.findOneLockedDoor()
  if (game.chooseSecondDoorAndCheckPrize()) {
    wins++
  } else {
    defeats++
  }
}

console.log(`Wins: ${wins} / ${iterations} = ${(wins / iterations).toFixed(2)} with ${doors} doors`)
console.log(`Defeats: ${defeats} / ${iterations} = ${(defeats / iterations).toFixed(2)} with ${doors} doors`)

//const game = new gameShow(doors)
//game.chooseRandomDoor()
//game.findOneLockedDoor()
//console.log(game.chooseSecondDoorAndCheckPrize())