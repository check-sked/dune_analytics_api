import { createObjectCsvWriter } from "csv-writer";

export {};
const queryID = process.argv[2];
console.log(queryID); // Check that Query ID is passing through
import { Headers } from "node-fetch";
import fetch from "node-fetch";

// Insert API Key here
const meta = {
  "x-dune-api-key": "YOUR_API_KEY",
};
const header = new Headers(meta);

// Example of adding parameters we would pass to the query. Comment out if not needed.
var params = {
  query_parameters: {
    wallet_address: "YOUR_WALLET_ADDRESS",
  },
};
var body = JSON.stringify(params); // Convert params to a string

//  Fetch Dune API for Execution Id
try {
  const response = await fetch(
    `https://api.dune.com/api/v1/query/${queryID}/execute`, // Query ID previously 1258228
    {
      method: "POST",
      headers: header,
      body: body, // Parameters passed here. Comment out if not needed.
    }
  );
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const response_object = await response.text();
  console.log(response_object);

  // Write requested data to a CSV file
  const csvWriter = createObjectCsvWriter({
    path: "response.csv",
    header: ["response"],
  });

  const records = [{ response: response_object }];

  csvWriter.writeRecords(records).then(() => {
    // Notify if CSV was successfully created
    console.log("The CSV file was written successfully");
  });
} catch (error) {
  console.error("Error:", error);
}
