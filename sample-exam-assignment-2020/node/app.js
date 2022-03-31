//We use EC6 modules!
import {
  extractJSON,
  fileResponse,
  htmlResponse,
  extractForm,
  jsonResponse,
  errorResponse,
  reportError,
  startServer,
} from './server.js'
const ValidationError = 'Validation Error'
const NoResourceError = 'No Such Resource'
export { ValidationError, NoResourceError, processReq }

startServer()

/* ****************************************************************************
 * Application code for the BAC tracker application
 ***************************************************************************** */
function round2Decimals(floatNumber) {
  return Math.round(floatNumber * 100) / 100
}

//constants for validating input from the network client
const maxWeight = 300
const minWeight = 1
const minNameLength = 1
const maxNameLength = 30
const MaleGender = 'Male'
const FemaleGender = 'Female'
const alcoholInGrams = 12
const physiologicalDifference = { Male: 0.7, Female: 0.6 }

//function that validates the constraints of the drinkForm
//It  must contain valid name,weight, Gender attributes
function validateBacDrinkForm(bacDrinkFormData) {
  let nameLen
  let name
  let gender
  let weight

  try {
    /* ***************************
     *   Begin - My code
     **************************** */
    nameLen = bacDrinkFormData.name.length
    name = bacDrinkFormData.name
    gender = bacDrinkFormData.gender
    weight = bacDrinkFormData.weight
    /* ***************************
     *   End - My code
     **************************** */
  } catch (e) {
    console.log(e)
    throw new Error(ValidationError)
  }

  if (nameLen >= minNameLength && nameLen <= maxNameLength) {
    /* ***************************
     *   Begin - My code
     **************************** */
    if (gender !== MaleGender && gender !== FemaleGender) {
      throw new Error(ValidationError)
    }
    if (Number.isNaN(weight) || weight < minWeight || weight > maxWeight) {
      throw new Error(ValidationError)
    }

    let drinkData = { name: name, gender: gender, weight: Number(weight) }
    /* ***************************
     *   End - My code
     **************************** */
    return drinkData
  } else {
    throw new Error(ValidationError)
  }
}

/* "Database" emulated by maintained an in-memory array of BAC Data objects 
   Higher index means newer data record: you can insert by simply 
  'push'ing new data records 
  */

//insert some sample data
let now = new Date()
let past = new Date(now.getTime() - 2000) //some seconds in the past.
let sampleDrinkData1 = {
  name: 'Mickey',
  gender: MaleGender,
  weight: 90,
  drinkTime: past,
}
let sampleDrinkData2 = {
  name: 'Mickey',
  gender: MaleGender,
  weight: 90,
  drinkTime: past,
}
let sampleDrinkData3 = {
  name: 'Mickey',
  gender: MaleGender,
  weight: 90,
  drinkTime: now,
}
let bacDB = [sampleDrinkData1, sampleDrinkData2, sampleDrinkData3] //

function lookup(name) {
  return bacDB.find((e) => e.name === name)
}

//Adds information about a consumed new drink to the database
//A record consist of validated form data plus time the drink is consumed.
function recordDrink(drinkData) {
  drinkData.drinkTime = new Date()
  bacDB.push(drinkData)
  console.log(bacDB)
  return drinkData.drinkTime //Drink timestame not used by client in this version.
}

/* A helper function that computes the time difference between two date objects 
   (Remark, that it is simplified as it does not account for daylight savings time)
*/
//const MS_PER_HOUR = 1000 * 60 * 60;
const MS_PER_HOUR = 1000 * 10 //speedup simulation 10s corresponds to 1 hour

function dateDiffInHours(recentDate, oldDate) {
  let diff = (recentDate.getTime() - oldDate.getTime()) / MS_PER_HOUR
  return diff
}

/*
//https://www.sundhed.dk/borger/patienthaandbogen/psyke/sygdomme/alkohol/alkoholpromille-beregning/

For kvinder:
Alkohol i gram / (kropsvægten i kg x 60 %) - (0,15 x timer fra drikkestart) = promille
For mænd:
Alkohol i gram / (kropsvægten i kg x 70 %) - (0,15 x timer fra drikkestart) = promille
Du finder oversigt over forskellige drikkevarers indhold af alkohol i gram i artiklen fakta om alkohol
*/

/* *********************************************************************
   Setup HTTP route handling: Called when a HTTP request is received 
   ******************************************************************** */
function processReq(req, res) {
  console.log('GOT: ' + req.method + ' ' + req.url)

  let baseURL = 'http://' + req.headers.host + '/' //https://github.com/nodejs/node/issues/12682
  let url = new URL(req.url, baseURL)
  let searchParms = new URLSearchParams(url.search)
  let queryPath = decodeURIComponent(url.pathname) //Convert uri encoded special letters (eg æøå that is escaped by "%number") to JS string

  switch (req.method) {
    case 'POST':
      {
        let pathElements = queryPath.split('/')
        console.log(pathElements[1])
        switch (pathElements[1]) {
          case '/bac-records':
          case 'bac-records': //just to be nice
            extractJSON(req)
              .then((bacDrinkFormData) =>
                validateBacDrinkForm(bacDrinkFormData)
              )
              .then((drinkData) => jsonResponse(res, recordDrink(drinkData)))
              .catch((err) => reportError(res, err))
            break
          default:
            console.error("Resource doesn't exist")
            reportError(res, NoResourceError)
        }
      }
      break //POST URL
    case 'GET':
      {
        let pathElements = queryPath.split('/')
        console.log(pathElements)
        //USE "sp" from above to get query search parameters
        switch (pathElements[1]) {
          //
          // Begin - My code
          //
          case '/bac-records':
          case 'bac-records':
            const name = pathElements[2]
            console.log('navn: ' + name)
            if (lookup(name)) {
              jsonResponse(res, { BAC: calcBAC(name) })
            } else {
              jsonResponse(res, { BAC: 'Not found' })
            }
            break
          //
          // End - My code
          //
          case '': //
            fileResponse(res, '/html/bac.html')
            break
          case 'date':
            {
              //
              let date = new Date()
              console.log(date)
              jsonResponse(res, date)
            }
            break
          default:
            //for anything else we assume it is a file to be served
            fileResponse(res, req.url)
            break
        } //path
      } //switch GET URL
      break
    default:
      reportError(res, NoResourceError)
  } //end switch method
}

/* ***************************
 *   Begin - My code
 **************************** */

function calcBAC(name) {
  const person = lookup(name)
  const F = physiologicalDifference[person.gender]

  let sumBAC = 0

  const drinks = bacDB.filter((obj) => obj.name === name)

  drinks.forEach((obj) => {
    const T = dateDiffInHours(new Date(), obj.drinkTime)
    const BAC = alcoholInGrams / (person.weight * F) - 0.15 * T
    if (BAC > 0) sumBAC += BAC
  })

  return sumBAC
}

/* ***************************
 *   End - My code
 **************************** */
