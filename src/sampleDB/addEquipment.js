import { processCsvFile } from "../library/cvsUtil/csvUtil.js";
import * as farmosUtil from "../library/farmosUtil/farmosUtil.js";

import { basename, dirname } from "path";
import { fileURLToPath } from "url";
import { LocalStorage } from 'node-localstorage';

/*
 * Set the name of the CSV file to be processed and the
 * messages to be printed before and after processing here.
 * The CSV file is assumed to be in the sampleData directory.
 */
const csv_file = "equipment.csv";
const startMsg = "Adding equipment from " + csv_file + "...";
const endMsg = "Equipment added.";

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
let ls = new LocalStorage('scratch');

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

let categoryId = null;
let categoryName = null;

/*
 * Implement this function to processes each row of the CSV file.
 * The contents of the row arrive as an array with each entry being
 * a column from the line of the CSV file.
 */
async function processRow(row) {
  if (row[0] != "") {
    console.log("  Adding equipment category " + row[0] + "...");
    const category = farm.asset.create({
      type: "asset--equipment",
      attributes: {
        name: row[0],
        description: row[1],
      },
    });

    try {
      const result = await farm.asset.send(category);
      categoryId = result.id;
      categoryName = row[0];
    } catch (e) {
      console.log("API error sending measure " + row[0]);
      console.log(e);
      process.exit(1);
    }
    console.log("  Added.");
  } else if (row[1] != "") {
    console.log(
      "  Adding equipment " + row[1] + " to category " + categoryName + "..."
    );
    const equipment = farm.asset.create({
      type: "asset--equipment",
      attributes: {
        name: row[1],
        manufacturer: row[2],
        model: row[3],
        description: row[4],
      },
    });
    equipment.relationships.parent.push({
      type: "asset--equipment",
      id: categoryId,
    });

    try {
      const result = await farm.asset.send(equipment);
    } catch (e) {
      console.log("API error sending unit " + row[1]);
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
