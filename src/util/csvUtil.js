import fs from 'fs';
import { parse } from 'csv';

/*
 * This function will:
 *  - Read the specified CSV file
 *  - Print the startMsg
 *  - Invoke the rowFunction on each row from the file.
 *  - Print the endMsg.
 */
export function processCsvFile(csv_file, processRow, startMsg, endMsg) {
  fs.createReadStream(csv_file).pipe(
    parse(
      {
        delimiter: ",",
        comment: "#",
        relax_column_count: true, // allow lines with different column counts.
        skip_empty_lines: true,
      },
      async function (err, data) {
        console.log(startMsg);
        for (const row of data) {
          await processRow(row);
        }
        console.log(endMsg);
      }
    )
  );
}


