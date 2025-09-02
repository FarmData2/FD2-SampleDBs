import { processCsvFile } from "../library/cvsUtil/csvUtil.js";
import * as farmosUtil from "../library/farmosUtil/farmosUtil.js";

import { basename, dirname } from "path";
import { fileURLToPath } from "url";
import { LocalStorage } from "node-localstorage";
import { symlinkSync } from "fs";

/*
 * Set the name of the CSV file to be processed and the
 * messages to be printed before and after processing here.
 * The CSV file is assumed to be in the sampleData directory.
 */
const csv_file = "units.csv";
const startMsg = "Adding units from " + csv_file + "...";
const endMsg = "Units added.";

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
farmosUtil.clearCachedUnits();
const unitMap = await farmosUtil.getUnitToTermMap();

/*
 * Kick off the the pipeline that reads the csv file and passes
 * each row of data from the file to the processRow function.
 */
const data_file =
  dirname(fileURLToPath(import.meta.url)) + "/sampleData/" + csv_file;
processCsvFile(data_file, processRow, startMsg, endMsg);

let unitCategoryId = null;
let unitCategoryName = null;

/*
 * Implement this function to processes each row of the CSV file.
 * The contents of the row arrive as an array with each entry being
 * a column from the line of the CSV file.
 */
async function processRow(row) {
  if (row[0] != "") {
    if (unitMap.get(row[0])) {
      console.log("  Unit category " + row[0] + " already exists.");
    }
    else {
      console.log("  Adding unit category " + row[0] + "...");
      await makeUnit(row[0],row[1]);
      console.log("  Added.");
    }
    unitCategoryId = unitMap.get(row[0]).id;
    unitCategoryName = row[0];
  } else if (row[1] != "") {
    console.log(
      "  Adding unit " + row[1] + " to unit category " + unitCategoryName + "...");
    await makeUnit(row[1],row[2],unitCategoryId);
    console.log("  Added.");
  }
}

async function makeUnit(unitName, description, parentId=null) {
  const unit = farm.term.create({
    type: "taxonomy_term--unit",
    attributes: {
      name: unitName,
      description: description,
    },
  });

  if (parentId) {
    unit.relationships.parent.push({id: parentId, type: "taxonomy_term--unit"});
  }

  try {
    const result = await farm.term.send(unit);
    unitMap.set(unitName,result);
    return result.id;
  } catch (e) {
    console.log("API error sending unit " + unitName);
    console.log(e);
    process.exit(1);
  }
}
