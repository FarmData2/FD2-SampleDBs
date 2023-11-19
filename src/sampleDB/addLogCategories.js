import { processCsvFile } from "../util/csvUtil.js";
import * as farmosUtil from "../util/farmosUtil.js";

import { basename, dirname } from "path";
import { fileURLToPath } from "url";

/*
 * Set the name of the CSV file to be processed and the
 * messages to be printed before and after processing here.
 * The CSV file is assumed to be in the sampleData directory.
 */
const csv_file = "logCategories.csv";
const startMsg = "Adding Log categories from " + csv_file + "...";
const endMsg = "Log categories added.";

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
 * Kick off the the pipeline that reads the csv file and passes
 * each row of data from the file to the processRow function.
 */
const data_file = (dirname(fileURLToPath(import.meta.url))) + "/sampleData/" + csv_file;
processCsvFile(data_file, processRow, startMsg, endMsg);

/*
 * Implement this function to processes each row of the CSV file.
 * The contents of the row arrive as an array with each entry being
 * a column from the line of the CSV file.
 */
async function processRow(row) {

      console.log("  Adding Log category " + row[0] + "...");

      const traySize = farm.term.create({
        type: "taxonomy_term--log_category",
        attributes: {
          name: row[0],
          description: row[1],
        },
      });

      try {
        const result = await farm.term.send(traySize);
      } catch (e) {
        console.log("API error sending log category " + row[0]);
        console.log(e);
        process.exit(1);
      }

      console.log("  Added.");
}
