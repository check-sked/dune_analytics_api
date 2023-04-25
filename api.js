const queryID = process.argv[2]; // Example Query ID: 1258228
console.log(queryID); // Check that Query ID is passing through
import { Headers } from "node-fetch";
import fetch from "node-fetch";
import fs from "fs";

// Add the API key to header object
const meta = {
  "x-dune-api-key": "[INSERT_YOUR_API_KEY]",
};
const header = new Headers(meta);

// Delay function
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Async function to fetch query data and loop until completed
async function fetchQueryData(queryID) {
  // Execute the query and get the execution_id
  const executionResponse = await fetch(
    `https://api.dune.com/api/v1/query/${queryID}/execute`,
    {
      method: "POST",
      headers: header,
    }
  );
  const executionData = await executionResponse.json();
  const executionID = executionData.execution_id;

  let isCompleted = false;

  while (!isCompleted) {
    // Check the query execution status using the execution_id
    const statusResponse = await fetch(
      `https://api.dune.com/api/v1/execution/${executionID}/status`,
      {
        method: "GET",
        headers: header,
      }
    );
    const statusData = await statusResponse.json();

    console.log(statusData);

    if (statusData.state === "QUERY_STATE_COMPLETED") {
      isCompleted = true;
    } else {
      await delay(5000); // Wait for 5 seconds before trying again
    }
  }

  // Fetch the query results in CSV format
  const resultsResponse = await fetch(
    `https://api.dune.com/api/v1/execution/${executionID}/results/csv`,
    {
      method: "GET",
      headers: header,
    }
  );
  const resultsData = await resultsResponse.text();

  // Save the CSV data to a file
  const fileName = `results_${queryID}.csv`;
  fs.writeFile(fileName, resultsData, (err) => {
    if (err) {
      console.error(`Error writing the CSV file: ${fileName}`, err);
    } else {
      console.log(`CSV file has been saved as ${fileName}`);
    }
  });
}

fetchQueryData(queryID);
