const m = 11
const c1 = 1
const c2 = 3

const arr = [10, 22, 31, 4, 15, 28, 17, 88, 59]

function linearHashing(arr) {
  const h = (k) => k

  let hashtable = []

  arr.forEach((k) => {
    let i = 0
    let hash = (h(k) + i) % m
    while (hashtable[hash]) {
      i++
      hash = (h(k) + i) % m
    }
    hashtable[hash] = k
  })

  return hashtable
}

function quadraticHashing(arr) {
  const h = (k) => k

  let hashtable = []

  arr.forEach((k) => {
    let i = 0
    let hash = (h(k) + c1 * i + c2 * Math.pow(i, 2)) % m
    while (hashtable[hash]) {
      i++
      hash = (h(k) + c1 * i + c2 * Math.pow(i, 2)) % m
    }
    hashtable[hash] = k
  })

  return hashtable
}

function doubleHashing(arr) {
  const h1 = (k) => k
  const h2 = (k) => 1 + (k % (m - 1))

  let hashtable = []

  arr.forEach((k) => {
    let i = 0
    let hash = (h1(k) + i * h2(k)) % m
    while (hashtable[hash]) {
      i++
      hash = (h1(k) + i * h2(k)) % m
    }
    hashtable[hash] = k
  })

  return hashtable
}

console.log('Linear Hashing: ', linearHashing(arr))
console.log('Quadratic Hashing: ', quadraticHashing(arr))
console.log('Double Hashing: ', doubleHashing(arr))
