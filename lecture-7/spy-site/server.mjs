import http from 'http'
import fs from 'fs'

const PORT = 4001

const app = http.createServer((req, res) => {

  console.log(req.url)

  switch(req.method) {
    case 'GET':
      if (req.url === '/') {
        serveHTML(res, 'homepage')
      } else if (req.url === '/cookie') {
        serveHTML(res, 'cookie')
      } else {
        serveHTML(res, '404')
      }
      break;
    case 'POST':
      if (req.url === '/onmouseover') {
        recieveData(req)
        .then((bodyData) => {
          let data = {user_footprint: req.headers['user-agent'], bodyData}

          data = JSON.stringify(data)

          fs.appendFile('./data.json', data, err => {
            if (err) console.log(err)

            console.log('added user mouse to file')
          })

        })

        res.end()
      }
      break;
  }

    //res.write('<html><h1>lort</h1></html>')
})

function recieveData(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => {
      data += chunk
    })
    req.on('end', () => {
      resolve(JSON.parse(data))
    })
  })
}

function serveHTML(res, page) {
  switch(page) {
    case 'homepage':

      res.writeHead(200, {'Content-Type': 'text/html'})

      fs.readFile('./serve.html', 'utf8', (err, data) => {
        if (err) return

        res.write(data)
        res.end()
      })
      break;
    case 'cookie':
      fs.readFile('./cookie.html', 'utf8', (err, data) => {
        if (err) return

        res.write(data)
        res.end()
      })
      break;
    case '404':
      res.writeHead(404, {'Content-Type': 'text/plain'})
      res.write('404: File not found')
      res.end()
      break;
  }
}

app.listen(PORT)