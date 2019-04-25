const express = require('express')
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');

const app = express()

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('good')
})

app.post('/download', (req, res) => {
  let { no, urls } = req.body;
  let error_message = undefined
  let status = 200
  let promises = []

  if(!no) error_message = 'missing parameter dir'
  if(!Array.isArray(urls) || !urls || urls.length === 0) error_message = 'missing parameter urls'
  if(!error_message) {
    promises = urls.map((url) => new Promise((resolve, reject) => {
      let re = new RegExp(`${no}\.(.*)\\?`);
      let filePath = `./Download/fc2-${no}`
      let fileName = `${url.match(/sukebeiPost%2F\d{6,7}\.(.*)\?/)[1]}`
      let fullPath = `${filePath}/${fileName}`
      let file = fs.createWriteStream(fullPath);
      https.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
          file.close(() => {
            resolve(true)
          });  // close() is async, call cb after close completes.
        });
      }).on('error', function(err) { // Handle errors
        fs.unlink(fullPath); // Delete the file async. (But we don't check the result)
        reject(`download ${name} fail`)
      });
    }).catch(e => {
      console.log(e);
    }))

    Promise.all(promises).catch((error) => {
      console.log(error);
      return true
    }) .then(() => {
      res.json({status: 200})
    })
  }
  else {
    res.json({status: 200, error_message})
  }
})

app.listen(8888)
