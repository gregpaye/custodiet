///////////////////////////////////////////
//
// TEST HARNESS FOR SERVERSTATUS EXTENSION
//
//////////////////////////////////////////
/*
This is a simple express server which only
does one thing: When the URL for the server
is called, it returns a JSON response with
echoing back the URL and a status of 0 or 1.
Set the value of the environment variable 
SERVER_STATUS_ONE_OR_ZERO to change how
the server responds to the extension
*/
//////////////////////////////////////////
const app = require("express")();


app.get('/', (req, res, next) => {
  let data = `{"response":{"url":"` + process.env.SERVER_URL_RETURNING_STATUS 
              +`","status":` + process.env.SERVER_STATUS_ONE_OR_ZERO + `}}`;
  let jsonResponse = JSON.parse(data);
  res.send(jsonResponse);
});

(async () => {
  try {
    await app.listen(3000);
    console.log(`express running port 3000`);
  }
  catch (error) {
    console.error(error);
  }
})(); 
