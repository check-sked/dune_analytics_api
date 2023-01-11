// TO DO: Replace default API key with ours when API drops
// TO DO: Add Inquirer prompt for query id # and fix error -- change module to 'commonjs' for inquirer to work or maybe //const queryId = require('./inquirer.js');
// TO DO: Replace default query id # with user response from inquirer prompt
// TO DO: Figure out what to do with the results of EXECUTE - call this: https://api.dune.com/api/v1/execution/{{execution_id}}/results
// Set options as a parameter, environment variable, or rc file.

export {};
const queryID = process.argv[2];
console.log(queryID); // Check on Query ID passing through
import { Headers } from "node-fetch";
import fetch from "node-fetch";

// Insert API Key here
const meta = {
  "x-dune-api-key": "YOUR_API_KEY",
};
const header = new Headers(meta);

// Add parameters we would pass to the query
var params = {
  query_parameters: {
    wallet_address: "YOUR_WALLET_ADDRESS",
  },
};
var body = JSON.stringify(params); // Convert params to a string

//  Fetch Dune API for Execution Id
const response = await fetch(
  `https://api.dune.com/api/v1/query/${queryID}/execute`, // Query ID previously 1258228
  {
    method: "POST",
    headers: header,
    body: body, // Parameters passed here
  }
);
const response_object = await response.text();

// Log the returned response
console.log(response_object);

// API for query results -- execution_id = body I'm pretty sure
// Result of this could be text or json
//"https://api.dune.com/api/v1/execution/{{execution_id}}/results" execution_id = body from console log
