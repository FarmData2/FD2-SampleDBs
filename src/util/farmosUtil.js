import farmOS from "farmos";
import { LocalStorage } from "node-localstorage";

import { basename, dirname } from "path";
import { fileURLToPath } from "url";

/**
 * Handle the localStorage in a way that will accommodate running
 * in both node.js and a web browser.  In node.js we need to create
 * our own localStorage, where as in a browser it already exists.
 */
function getLocalStorage() {
  let ls = null;
  try {
    localStorage;
  } catch (e) {
    const rootDir = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
    ls = new LocalStorage(rootDir + "/scratch");
  }

  if (ls == null) {
    ls = localStorage;
  }

  return ls;
}

/**
 * Get an instance of the `farmos.js` `farmOS` object that can be used
 * to interact with the farmOS host.  The `farmOS` instance will have the
 * same permissions as the `user`/`pass` that are used for authentication.
 * The default 'farm' client is sufficient for most uses, but any client
 * that exists in on farmOS host can be used.  The `farmOS` object will
 * also have its schema set.
 *
 * @param {string} hostURL url of the farmOS instance to which to connect.
 * @param {string} client the farmOS api client to use.
 * @param {string} user the username of the farmOS user to use for authentication.
 * @param {string} pass the farmOS password for the user.
 * @returns the connected and configured `farmos.js` `farmOS` object.
 */
export async function getFarmOSInstance(hostURL, client, user, pass) {
  const config = {
    host: hostURL,
    clientId: client,
    getToken: () => JSON.parse(getLocalStorage().getItem("token")),
    setToken: (token) =>
      getLocalStorage().setItem("token", JSON.stringify(token)),
  };
  const options = { remote: config };

  /*
   * Enable this to be used both in Node, where farmOS is
   * not recognized but farmOS.default is and in Cypress for
   * testing where farmOS is recognized, but farmOS.default
   * is not.
   */
  let farm = null;
  if (typeof farmOS != "function") {
    farm = farmOS.default(options);
  } else {
    farm = farmOS(options);
  }

  if (farm.remote.getToken() === null) {
    await farm.remote.authorize(user, pass);
  }

  const schemata = await farm.schema.fetch();
  farm.schema.set(schemata);

  return farm;
}

/**
 * Print out the JSON structure of the specified farmOS record type.
 * (e.g. asset--land, log--harvest, etc...
 *
 * @param {object} farm a `farmOS` object returned from `getFarmOSInstance`.
 * @param {string} recordType the type of farmOS record to display.
 */
export function printObject(farm, recordType) {
  const obj = farm.log.create({ type: recordType });
  console.dir(obj);
}

/**
 * Get an array containing all of the users from the farmOS host.
 *
 * NOTE: This function makes an API call to the farmOS host.  Thus,
 * if the array is to be used multiple times it should be cached
 * by the calling code.
 *
 * @param {object} farm a `farmOS` object returned from `getFarmOSInstance`.
 * @returns an array of farmOS `user` objects.
 */
export async function getUsers(farm) {
  const users = await farm.user.fetch({
    filter: {
      type: "user--user",
    },
    limit: Infinity,
  });

  return users.data;
}

/**
 * Get a map from the user 'display_name` to the corresponding
 * farmOS user object.
 *
 * NOTE: The `Anonymous` user is dropped from this `Map'.
 *
 * NOTE: This function makes an API call to the farmOS host.  Thus,
 * if the array is to be used multiple times it should be cached
 * by the calling code.
 *
 * @param {object} farm a `farmOS` object returned from `getFarmOSInstance`.
 * @returns an `Map` from the user `display_name` to the `user` object.
 */
export async function getUsernameToUserMap(farm) {
  const users = await getUsers(farm);

  const map = new Map(
    users.map((user) => [user.attributes.display_name, user])
  );

  map.delete("Anonymous");

  return map;
}

/**
 * Get a map from the user `id` to the farmOS user object.
 *
 * NOTE: The `Anonymous` user is dropped from this `Map.`
 *
 * NOTE: This function makes an API call to the farmOS host.  Thus,
 * if the array is to be used multiple times it should be cached
 * by the calling code.
 *
 * @param {object} farm a `farmOS` object returned from `getFarmOSInstance`.
 * @returns an `Map` from the user `display_name` to the `user` object.
 */
export async function getUserIdToUserMap(farm) {
  const users = await getUsers(farm);

  // Drop the Anonymous users.
  users.shift()

  const map = new Map(users.map((user) => [user.id, user]));

  return map;
}

/**
 * Add the user specified by the `ownerID` to the `obj` as the owner
 * of the asset or log.
 *
 * @param {object} obj a farmOS asset or log. This pushes an user
 *  object to the `relationships.owner` property of `obj`.
 * @param {string} ownerId the id of the user to assign as the owner.
 * @throws {ReferenceError} if the `obj` does not have a `relationships.owner` property.
 * @return the `obj` with the owner added.
 */
export function addOwnerRelationship(obj, ownerId) {
  if (!obj?.relationships.owner) {
    throw new ReferenceError("The obj parameter does not have a relationships.owner property")
  } else {
    obj.relationships.owner.push({
      type: "user--user",
      id: ownerId,
    });
  }

  return obj;
}

/**
 * Add the user specified by the `parentID` to the `obj` as the parent
 * of the asset or log.
 *
 * @param {object} obj a farmOS asset, log. This pushes an user
 *  object to the `relationships.parent` property of `obj`.
 * @param {string} parentId the id of the user to assign as the parent.
 * @throws {ReferenceError} if the `obj` does not have a `relationships.parent` property.
 * @returns the `obj` with the parent added.
 */
export function addParentRelationship(obj, parentId, parentType) {
  if (!obj?.relationships.parent) {
    throw new ReferenceError("The obj parameter does not have a relationships.parent property")
  } else {
    obj.relationships.parent.push({
      type: parentType,
      id: parentId,
    });
  }

  return obj;
}

// Separate maps for direct seedings in the ground (fields/beds)
// Tray seedings (greenhouses)

// GET MAPS
// USE type and land_type, structure_type 



/**
 * Some of the farmOS objects contain circular references -
 * at least according to JSON.stringify. This function will
 * remove those circular references.  In most cases this seems
 * to produce an equivalent object or at least one that is good
 * enough for the purposes here.
 *
 *  From: https://codedamn.com/news/javascript/how-to-fix-typeerror-converting-circular-structure-to-json-in-js
 */
// function dropCircularRefsStringify(obj) {
//   let cache = [];
//   let str = JSON.stringify(obj, function (key, value) {
//     if (typeof value === "object" && value !== null) {
//       if (cache.indexOf(value) !== -1) {
//         // Circular reference found, discard key
//         return;
//       }
//       // Store value in our collection
//       cache.push(value);
//     }
//     return value;
//   });
//   cache = null; // reset the cache
//   return str;
// }
