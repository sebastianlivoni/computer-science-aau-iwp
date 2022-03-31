'use strict'
//SEE: https://javascript.info/strict-mode

/* ***************************
 *   Begin - My code
 **************************** */

let intervalRunning

const trackerButton = document.querySelector('#bac_tracker_start')

function fetchBAC(name) {
  jsonFetch(`/bac-records/${name}`).then((res) => {
    if (res.BAC === 'Not found') {
      stopFetching()
    } else {
      updateOutput(res.BAC)
      console.log('New fetch:', res.BAC)
    }
  })
}

function updateOutput(value) {
  document.querySelector('#bac_tracker_output').value = `BAC = ${value}`
}

function updateTrackerButton(value) {
  trackerButton.value = value
}

function startFetching(name, interval) {
  updateTrackerButton('Stop tracker!')
  fetchBAC(name) // do it once now and then every 2 seconds
  intervalRunning = setInterval(() => fetchBAC(name), 2000)
}

function stopFetching() {
  clearInterval(intervalRunning)
  intervalRunning = 0

  updateTrackerButton('Start tracker!')
  updateOutput('Not found')
}

function toggleTracker(e) {
  e.preventDefault()
  const name = document.querySelector('input[name="bac_tracker"]').value

  if (intervalRunning) {
    stopFetching()
  } else {
    startFetching(name)
  }
}

trackerButton.addEventListener('click', toggleTracker)

/* ***************************
 *   End - My code
 **************************** */

function showDate(data) {
  let p = document.getElementById('id1')
  let d = document.createElement('pre')
  d.textContent = String('Fetched date object: ' + data)
  p.parentElement.append(d)
}

function jsonParse(response) {
  if (response.ok)
    if (response.headers.get('Content-Type') === 'application/json')
      return response.json()
    else throw new Error('Wrong Content Type')
  else throw new Error('Non HTTP OK response')
}

function jsonFetch(url) {
  return fetch(url).then(jsonParse)
}

function jsonPost(url = '', data = {}) {
  const options = {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  }
  return fetch(url, options).then(jsonParse)
}

console.log('JS er klar!')

function extractDrinkData(e) {
  let bacDrinkData = {}
  bacDrinkData.name = document.querySelector('input[name="name"]').value
  bacDrinkData.gender = document.querySelector(
    'input[name="gender"]:checked'
  ).value
  bacDrinkData.weight = document.querySelector('input[name="weight"]').value

  console.log('Extracted')
  console.log(bacDrinkData)
  return bacDrinkData
}

function sendDrink(event) {
  event.preventDefault() //we handle the interaction with the server rather than browsers form submission
  document.getElementById('drinkBtn_id').disabled = true //prevent double submission
  let drinkData = extractDrinkData(event)

  jsonPost(document.getElementById('bacDrinkForm').action, drinkData)
    .then((drinkStatus) => {
      console.log('Status=')
      console.log(drinkStatus) //expect an empty object.
      document.getElementById('drinkBtn_id').disabled = false
    })
    .catch((e) => console.log('Ooops ' + e.message))
}

document.getElementById('bacDrinkForm').addEventListener('submit', sendDrink)
