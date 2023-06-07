import { Headers } from "node-fetch";
import fetch from "node-fetch";
import fs from "fs";

// Get the query ID from the command line arguments
const queryID = process.argv[2]; // Example Query ID: 1258228
console.log("retrieving data for query " + queryID + "..."); // Check that Query ID is passing through

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
  try {
    // Execute the query and get the execution_id
    const executionResponse = await fetch(
      `https://api.dune.com/api/v1/query/${queryID}/execute`,
      {
        method: "POST",
        headers: header,
      }
    );

    // Check if the execution response is not ok and throw an error
    if (!executionResponse.ok) {
      throw new Error(`Error executing query: ${executionResponse.statusText}`);
    }

    const executionData = await executionResponse.json();
    const executionID = executionData.execution_id;

    let isCompleted = false;
    let attempts = 0;
    const timeout = Date.now() + 5 * 60 * 1000; // 5 minutes timeout

    // Loop until the query is completed or the maximum number of attempts is reached
    while (!isCompleted && Date.now() < timeout) {
      // Check the query execution status using the execution_id
      const statusResponse = await fetch(
        `https://api.dune.com/api/v1/execution/${executionID}/status`,
        {
          method: "GET",
          headers: header,
        }
      );

      // Check if the status response is not ok and throw an error
      if (!statusResponse.ok) {
        throw new Error(`Error fetching status: ${statusResponse.statusText}`);
      }

      const statusData = await statusResponse.json();

      console.log(statusData);

      // Check if the query state is completed
      if (statusData.state === "QUERY_STATE_COMPLETED") {
        isCompleted = true;
      } else {
        attempts++;
        await delay(5000); // Wait for 5 seconds before trying again
      }
    }

    // Throw an error if the query is not completed within the timeout
    if (!isCompleted) {
      throw new Error("Unable to fetch query results after multiple attempts");
    }

    // Fetch the query results in CSV format
    const resultsResponse = await fetch(
      `https://api.dune.com/api/v1/execution/${executionID}/results/csv`,
      {
        method: "GET",
        headers: header,
      }
    );

    // Check if the results response is not ok and throw an error
    if (!resultsResponse.ok) {
      throw new Error(`Error fetching results: ${resultsResponse.statusText}`);
    }

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
  } catch (error) {
    // Log the error message if an error occurs
    console.error("Error:", error.message);
  }
}

fetchQueryData(queryID);
