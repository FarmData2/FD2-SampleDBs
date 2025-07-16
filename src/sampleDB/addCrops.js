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

    const harvestUnit = await getHarvestUnit(row, 2);
    //const unitConversions = getUnitConversions(row, 3);

    /*
     * TODO: IMPLEMENT UNIT CONVERSIONS
     *       CONSIDER HAVING PARENT CATEGORY FOR ADDED UNITS.
     *         E.G. COUNT FOR BUNCHES
     *         E.G. WEIGHT FOR POUNDS
     *         ETC.
     */

    const crop = farm.term.create({
      type: "taxonomy_term--plant_type",
      attributes: {
        name: row[1],
      },
      crop_family: {
        type: "taxonomy_term--crop_family",
        id: cropFamilyId,
      },
      fd2_harvest_unit: harvestUnit,
      //fd2_unit_conversions: unitConversions,
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
        parentCropName +
        "-" +
        row[2] +
        " to crop family " +
        cropFamilyName +
        " with parent crop " +
        parentCropName +
        "..."
    );

    const harvestUnit = await getHarvestUnit(row, 3);

    const crop = farm.term.create({
      type: "taxonomy_term--plant_type",
      attributes: {
        name: parentCropName + "-" + row[2],
      },
      crop_family: {
        type: "taxonomy_term--crop_family",
        id: cropFamilyId,
      },
      fd2_harvest_unit: harvestUnit,
    });
    crop.relationships.parent.push({
      type: "taxonomy_term--plant_type",
      id: parentCropId,
    });

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

async function getHarvestUnit(row, index) {
  const harvestUnitName = row[index];
  console.log("    Getting unit " + harvestUnitName + "...");
  let harvestUnit = unitMap.get(harvestUnitName);   
  if (!harvestUnit) {
    harvestUnit = await makeUnit(harvestUnitName);
  }

  const unit = {
    type: "taxonomy_term--unit",
    id: harvestUnit.id
  };

  console.log("    Got unit.");

  return unit;
}

async function makeUnit(unitName) {
  console.log("      Adding unit " + unitName + "...");
  const unit = farm.term.create({
    type: "taxonomy_term--unit",
    attributes: {
      name: unitName,
      description: "The " + unitName + " unit.",
    },
  });

  try {
    const result = await farm.term.send(unit);
    unitMap.set(unitName,result);
    console.log("      Added unit");
    
    return result.id;
  } catch (e) {
    console.log("API error sending unit " + unitName);
    console.log(e);
    process.exit(1);
  }
}

function getUnitConversions(row, startIndex) {
  return [];
}
