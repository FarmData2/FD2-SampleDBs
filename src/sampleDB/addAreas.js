import { processCsvFile } from "../util/csvUtil.js";
import * as farmosUtil from "../util/farmosUtil.js";

import { basename, dirname } from "path";
import { fileURLToPath } from "url";

/*
 * Set the name of the CSV file to be processed and the
 * messages to be printed before and after processing here.
 * The CSV file is assumed to be in the sampleData directory.
 */
const csv_file = "areas.csv";
const startMsg = "Adding areas from " + csv_file + "...";
const endMsg = "Areas added.";

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
const usernameMap = await farmosUtil.getUsernameToUserMap(farm);

/*
 * Kick off the the pipeline that reads the csv file and passes
 * each row of data from the file to the processRow function.
 */
const data_file = (dirname(fileURLToPath(import.meta.url))) + "/sampleData/" + csv_file;
processCsvFile(data_file, processRow, startMsg, endMsg);

let parentAreaId = null;
let parentAreaType = null;
let parentAreaName = null;

/*
 * Implement this function to processes each row of the CSV file.
 * The contents of the row arrive as an array with each entry being
 * a column from the line of the CSV file.
 */
async function processRow(row) {
  if (row[0] != "") {
    if (row[1] == "field") {
      console.log("  Adding field " + row[0] + "...");

      const field = farm.asset.create({
        type: "asset--land",
        attributes: {
          name: row[0],
          notes: row[2],
          is_location: true,
          is_fixed: true,
          land_type: "field",
        },
      });
      farmosUtil.addOwnerRelationship(field, usernameMap.get("admin").id);

      try {
        const result = await farm.asset.send(field);
        parentAreaId = result.id;
        parentAreaType = "asset--land";
        parentAreaName = row[0];
      } catch (e) {
        console.log("API error sending field " + row[0]);
        console.log(e);
        process.exit(1);
      }

      console.log("  Added.");
    } else if (row[1] == "greenhouse") {
      console.log("  Adding greenhouse " + row[0] + "...");

      const greenhouse = farm.asset.create({
        type: "asset--structure",
        attributes: {
          name: row[0],
          notes: row[2],
          is_location: true,
          is_fixed: true,
          structure_type: "greenhouse",
        },
      });
      farmosUtil.addOwnerRelationship(greenhouse, usernameMap.get("admin").id);

      try {
        const result = await farm.asset.send(greenhouse);
        parentAreaId = result.id;
        parentAreaType = "asset--structure";
        parentAreaName = row[0];
      } catch (e) {
        console.log("API error sending greenhouse " + row[0]);
        console.log(e);
        process.exit(1);
      }

      console.log("  Added.");
    } else {
      console.log("Invalid field or greenhouse data in area.csv.");
      console.log(row);
      process.exit(1);
    }
  } else if (row[2] == "bed") {
    console.log(
      "  Adding bed " + row[1] + " with parent " + parentAreaName + "..."
    );

    const bed = farm.log.create({
      type: "asset--land",
      attributes: {
        name: row[1],
        notes: row[3],
        is_location: true,
        is_fixed: true,
        land_type: "bed",
      },
    });
    farmosUtil.addOwnerRelationship(bed, usernameMap.get("admin").id);
    farmosUtil.addParentRelationship(bed, parentAreaId, parentAreaType);

    try {
      await farm.asset.send(bed);
    } catch (e) {
      console.log("API error sending bed " + row[1]);
      console.log(e);
      process.exit(1);
    }

    console.log("  Added");
  } else {
    console.log("Invalid data in area.csv.");
    console.log(row);
    process.exit(1);
  }
}
