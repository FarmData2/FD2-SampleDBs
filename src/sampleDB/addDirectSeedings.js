import { processCsvFile } from "../library/cvsUtil/csvUtil.js";
import * as farmosUtil from "../library/farmosUtil/farmosUtil.js";
import { lib as directSeeding } from "../library/directSeeding/lib.js";

import { basename, dirname } from "path";
import { fileURLToPath } from "url";
import { LocalStorage } from "node-localstorage";

/*
 * Set the name of the CSV file to be processed and the
 * messages to be printed before and after processing here.
 * The CSV file is assumed to be in the sampleData directory.
 */
const csv_file = "directSeedings.csv";
const startMsg = "Adding direct seedings from " + csv_file + "...";
const endMsg = "Direct seedings added.";

/*
 * Setup the information for connecting to the farmOS instance
 * in the FarmData2 development environment.  Note: URL cannot
 * have a trailing /.
 */
const URL = "http://farmos";
const client = "farm";
const user = "admin";
const pass = "admin";

/*
 * Get a local storage object that we'll use to simulate the
 * browser's localStorage and sessionStorage when running in node.
 */
let ls = new LocalStorage("scratch");

/*
 * Get a fully initialized and logged in instance of the farmOS.js
 * farmOS object that will be used to write assets, logs, etc.
 */
const farm = await farmosUtil.getFarmOSInstance(URL, client, user, pass, ls);

/*
 * Get any farmos id maps that we need for processing the data.
 */
//const usernameMap = await farmosUtil.getUsernameToUserMap(farm);

/*
 * Kick off the the pipeline that reads the csv file and passes
 * each row of data from the file to the processRow function.
 */
const data_file =
  dirname(fileURLToPath(import.meta.url)) + "/sampleData/" + csv_file;
processCsvFile(data_file, processRow, startMsg, endMsg);

/*
 * Implement this function to processes each row of the CSV file.
 * The contents of the row arrive as an array with each entry being
 * a column from the line of the CSV file.
 */
async function processRow(row) {

  // Split the location and bed names as necessary.
  const locationNames = row[2].split(";");
  const bedNames = locationNames.slice(1);

  // Split the equipment names as necessary.
  let equipmentNames = [];
  if (row[6] != "") {
    equipmentNames = [... row[6].split(";")];
  }
    
  let form = {
    seedingDate: row[0],
    cropName: row[1],
    locationName: locationNames[0],
    beds: bedNames,
    bedFeet: row[3],
    rowsPerBed: row[4],
    bedWidth: row[5],
    equipment: equipmentNames,
    depth: row[7],
    speed: row[8],
    comment: row[9],
  };

  console.log(
    "  Adding direct seeding on " +
      form.seedingDate +
      " for " +
      form.cropName +
      " in " +
      form.locationName +
      "..."
  );

  await directSeeding.submitForm(form).catch((err) => {
    console.log("  " + err);
  });

  console.log("  Added.");
}
