import { processCsvFile } from "../library/cvsUtil/csvUtil.js";
import * as farmosUtil from "../library/farmosUtil/farmosUtil.js";

import { lib as traySeedingLib } from "../library/traySeeding/lib.js";
import { lib as transplantingLib } from "../library/transplanting/lib.js";

import { basename, dirname } from "path";
import { fileURLToPath } from "url";
import { LocalStorage } from "node-localstorage";

/*
 * Set the name of the CSV file to be processed and the
 * messages to be printed before and after processing here.
 * The CSV file is assumed to be in the sampleData directory.
 */
const csv_file = "transplantings.csv";
const startMsg = "Adding transplantings from " + csv_file + "...";
const endMsg = "Transplantings added.";

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

let traySeedingForm = null;
let traySeeding = null;

/*
 * Implement this function to processes each row of the CSV file.
 * The contents of the row arrive as an array with each entry being
 * a column from the line of the CSV file.
 */
async function processRow(row) {
  if (row[0] != "") {
    // Make the tray seeding that will be transplanted.
    traySeedingForm = {
      seedingDate: row[0],
      cropName: row[1],
      locationName: row[2],
      trays: row[3],
      traySize: row[4],
      seedsPerCell: row[5],
      comment: row[6],
    };

    console.log(
      "  Adding tray seeding on " +
        traySeedingForm.seedingDate +
        " for " +
        traySeedingForm.trays +
        " trays of " +
        traySeedingForm.cropName +
        " in " +
        traySeedingForm.locationName +
        "..."
    );

    try {
      traySeeding = await traySeedingLib.submitForm(traySeedingForm);
    } catch (err) {
      console.log("  " + err);
    }

    console.log("  Added.");
  } else if (row[1] != "") {
    // Add the transplantings for the tray seeding.

    // Split the location and bed names as necessary.
    const locationNames = row[6].split(";");
    const bedNames = locationNames.slice(1);

    //Split the equipment names as necessary.
    let equipmentNames = [];
    if (row[7] != "") {
      equipmentNames = [...row[7].split(";")];
    }

    let form = {
      cropName: traySeedingForm.cropName,
      picked: [
        {
          trays: row[2],
          data: {
            asset_uuid: traySeeding.plantAsset.id,
          },
        },
      ],
      transplantingDate: row[1],
      location: locationNames[0],
      beds: bedNames,
      bedFeet: row[3],
      bedWidth: row[4],
      rowsPerBed: row[5],
      equipment: equipmentNames,
      depth: row[8],
      speed: row[9],
      comment: row[10],
    };

    console.log(
      "  Transplanting " +
        form.picked[0].trays +
        " trays of " +
        form.cropName +
        " to " +
        form.location +
        "..."
    );

    try {
      await transplantingLib.submitForm(form);
    } catch (err) {
      console.log("  " + err);
    }

    console.log("  Transplanted.");
  } else {
    console.log("Invalid data in " + csv_file + ".");
    console.log(row);
    process.exit(1);
  }
}
