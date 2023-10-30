import { processCsvFile } from "../util/csvUtil.js";
import * as farmosUtil from "../util/farmosUtil.js";

import { basename, dirname } from "path";
import { fileURLToPath } from "url";

/*
 * Set the name of the CSV file to be processed and the
 * messages to be printed before and after processing here.
 * The CSV file is assumed to be in the sampleData directory.
 */
const csv_file = "crops.csv";
const startMsg = "Adding crops from " + csv_file + "...";
const endMsg = "Crops added.";

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
 * Get a fully initialized and logged in instance of the farmOS.js
 * farmOS object that will be used to write assets, logs, etc.
 */
const farm = await farmosUtil.getFarmOSInstance(URL, client, user, pass);

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

let cropFamilyId = null;
let cropFamilyName = null;
let parentCropId = null;
let parentCropName = null;

/*
 * Implement this function to processes each row of the CSV file.
 * The contents of the row arrive as an array with each entry being
 * a column from the line of the CSV file.
 */
async function processRow(row) {
  if (row[0] != "") {
    console.log("  Adding crop family " + row[0] + "...");
    const cropFamily = farm.term.create({
      type: "taxonomy_term--crop_family",
      attributes: {
        name: row[0],
      },
    });

    try {
      const result = await farm.term.send(cropFamily);
      cropFamilyId = result.id;
      cropFamilyName = row[0];
    } catch (e) {
      console.log("API error sending crop family " + row[0]);
      console.log(e);
      process.exit(1);
    }
    console.log("  Added.");
  } else if (row[1] != "") {
    console.log(
      "  Adding crop " + row[1] + " to crop family " + cropFamilyName + "..."
    );
    const crop = farm.term.create({
      type: "taxonomy_term--plant_type",
      attributes: {
        name: row[1],
      },
      crop_family: {
        type: "taxonomy_term--crop_family",
        id: cropFamilyId,
      },
    });

    try {
      const result = await farm.term.send(crop);
      parentCropId = result.id;
      parentCropName = row[1];
    } catch (e) {
      console.log("API error sending crop " + row[1]);
      console.log(e);
      process.exit(1);
    }
    console.log("  Added.");
  } else if (row[2] != "") {
    console.log(
      "  Adding crop " +
        row[2] +
        " to crop family " +
        cropFamilyName +
        " with parent crop " +
        parentCropName +
        "..."
    );
    const crop = farm.term.create({
      type: "taxonomy_term--plant_type",
      attributes: {
        name: row[2],
      },
      crop_family: {
        type: "taxonomy_term--crop_family",
        id: cropFamilyId,
      },
    });
    farmosUtil.addParentRelationship(
      crop,
      parentCropId,
      "taxonomy_term--plant_type"
    );

    try {
      const result = await farm.term.send(crop);
    } catch (e) {
      console.log("API error sending crop " + row[1]);
      console.log(e);
      process.exit(1);
    }
    console.log("  Added.");
  } else {
    console.log("Invalid data in " + csv_file + ".");
    console.log(row);
    process.exit(1);
  }
}
