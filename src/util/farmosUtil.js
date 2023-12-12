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
 * (e.g. asset--land, log--harvest, etc...  This is useful as a development
 * and debugging tool.
 *
 * @param {object} farm a `farmOS` object returned from `getFarmOSInstance`.
 * @param {string} recordType the type of farmOS record to display.
 */
export function printObject(farm, recordType) {
  const obj = farm.log.create({ type: recordType });
  console.dir(obj);
}

/**
 * Get an array containing all of the active users from the farmOS host.  The users
 * will appear in the array in order by the value of the `attributes.display_name`
 * property.
 *
 * NOTE: The `Anonymous` user does not appear in the returned array.
 *
 * NOTE: This function makes an API call to the farmOS host.  Thus,
 * if the array is to be used multiple times it should be cached
 * by the calling code.
 *
 * @param {object} farm a `farmOS` object returned from `getFarmOSInstance`.
 * @returns an array of farmOS `user--user` objects.
 */
export async function getUsers(farm) {
  const users = await farm.user.fetch({
    filter: {
      type: "user--user",
      status: true,
    },
    limit: Infinity,
  });

  users.data.sort((o1, o2) =>
    o1.attributes.display_name.localeCompare(o2.attributes.display_name)
  );

  return users.data;
}

/**
 * Get a map from the user 'display_name` to the corresponding
 * farmOS user object.
 *
 * NOTE: The returned `Map` is built on the value returned by {@link getUsers}.
 *
 * @param {object} farm a `farmOS` object returned from `getFarmOSInstance`.
 * @returns an `Map` from the user `display_name` to the `user--user` object.
 */
export async function getUsernameToUserMap(farm) {
  const users = await getUsers(farm);

  const map = new Map(
    users.map((user) => [user.attributes.display_name, user])
  );

  return map;
}

/**
 * Get a map from the user `id` to the farmOS user object.
 *
 * NOTE: The returned `Map` is built on the value returned by {@link getUsers}.
 *
 * @param {object} farm a `farmOS` object returned from `getFarmOSInstance`.
 * @returns an `Map` from the user `display_name` to the `user--user` object.
 */
export async function getUserIdToUserMap(farm) {
  const users = await getUsers(farm);

  const map = new Map(users.map((user) => [user.id, user]));

  return map;
}

/**
 * Add the user specified by the `ownerID` to the `obj` as the owner
 * of the asset or log.
 *
 * This pushes an `user--user` object to the `relationships.owner` property of `obj`.
 *
 * @param {object} obj a farmOS asset or log.
 * @param {string} ownerId the id of the user to assign as the owner.
 * @throws {ReferenceError} if the `obj` does not have a `relationships.owner` property.
 * @return the `obj` with the owner added.
 */
export function addOwnerRelationship(obj, ownerId) {
  if (!obj?.relationships.owner) {
    throw new ReferenceError(
      "The obj parameter does not have a relationships.owner property"
    );
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
 * @param {object} obj a farmOS asset or log.
 * @param {string} parentId the id of the user to assign as the parent.
 * @throws {ReferenceError} if the `obj` does not have a `relationships.parent` property.
 * @returns the `obj` with the parent added.
 */
export function addParentRelationship(obj, parentId, parentType) {
  if (!obj?.relationships.parent) {
    throw new ReferenceError(
      "The obj parameter does not have a relationships.parent property"
    );
  } else {
    obj.relationships.parent.push({
      type: parentType,
      id: parentId,
    });
  }

  return obj;
}

/**
 * Get the asset objects for all of the active places that represent fields or beds.
 * These are the assets of type `asset--land` that have `land_type` of either
 * `field` or `bed`.  The fields and beds will appear in alphabetical order
 * by the value of the `attributes.name` property.
 *
 * NOTE: This function makes an API call to the farmOS host.  Thus,
 * if the array is to be used multiple times it should be cached
 * by the calling code.
 *
 * @param {object} farm a `farmOS` object returned from `getFarmOSInstance`.
 * @returns An array of all of land assets representing fields or beds.
 */
export async function getFieldsAndBeds(farm) {
  // Done as two requests for now because of a bug in the farmOS.js library.
  // https://github.com/farmOS/farmOS.js/issues/86

  const beds = await farm.asset.fetch({
    filter: {
      type: "asset--land",
      land_type: "bed",
      status: "active",
    },
    limit: Infinity,
  });

  const fields = await farm.asset.fetch({
    filter: {
      type: "asset--land",
      land_type: "field",
      status: "active",
    },
    limit: Infinity,
  });

  const land = fields.data.concat(beds.data);
  land.sort((o1, o2) => o1.attributes.name.localeCompare(o2.attributes.name));

  return land;
}

/**
 * Get a map from the name of a field or bed land asset to the
 * farmOS land asset object.
 *
 * NOTE: The returned `Map` is built on the value returned by {@link getFieldsAndBeds}.
 *
 * @param {object} farm a `farmOS` object returned from `getFarmOSInstance`.
 * @returns an `Map` from the field or bed `name` to the `asset--land` object.
 */
export async function getFieldOrBedNameToAssetMap(farm) {
  const fieldsAndBeds = await getFieldsAndBeds(farm);

  const map = new Map(
    fieldsAndBeds.map((land) => [land.attributes.name, land])
  );

  return map;
}

/**
 * Get a map from the id of a field or bed land asset to the
 * farmOS land asset object.
 *
 * NOTE: The returned `Map` is built on the value returned by {@link getFieldsAndBeds}.
 *
 * @param {object} farm a `farmOS` object returned from `getFarmOSInstance`.
 * @returns an `Map` from the field or bed `id` to the `asset--land` object.
 */
export async function getFieldOrBedIdToAssetMap(farm) {
  const fieldsAndBeds = await getFieldsAndBeds(farm);

  const map = new Map(fieldsAndBeds.map((land) => [land.id, land]));

  return map;
}

/**
 * Get the asset objects for all of the active structures that represent greenhouses.
 * These are the assets of type `asset--structure` that have `structure_type` of 
 * `greenhouse`.  The greenhouses will appear in alphabetical order
 * by the value of the `attributes.name` property.
 *
 * NOTE: This function makes an API call to the farmOS host.  Thus,
 * if the array is to be used multiple times it should be cached
 * by the calling code.
 *
 * @param {object} farm a `farmOS` object returned from `getFarmOSInstance`.
 * @returns An array of all of land assets representing greenhouses.
 */
export async function getGreenhouses(farm) {
  const greenhouses = await farm.asset.fetch({
    filter: {
      type: "asset--structure",
      structure_type: "greenhouse",
      status: "active"
    },
    limit: Infinity,
  });

  greenhouses.data.sort((o1, o2) => o1.attributes.name.localeCompare(o2.attributes.name));

  return greenhouses.data;
}

/**
 * Get a map from the name of a greenhouse asset to the
 * farmOS structure asset object.
 *
 * NOTE: The returned `Map` is built on the value returned by {@link getGreenhouses}.
 *
 * @param {object} farm a `farmOS` object returned from `getFarmOSInstance`.
 * @returns an `Map` from the greenhouse `name` to the `asset--structure` object.
 */
export async function getGreenhouseNameToAssetMap(farm) {
  const greenhouses = await getGreenhouses(farm);

  const map = new Map(greenhouses.map((gh) => [gh.attributes.name, gh]));

  return map;
}

/**
 * Get a map from the id of a greenhouse asset to the
 * farmOS structure asset object.
 *
 * NOTE: The returned `Map` is built on the value returned by {@link getGreenhouses}.
 *
 * @param {object} farm a `farmOS` object returned from `getFarmOSInstance`.
 * @returns an `Map` from the greenhouse `id` to the `asset--structure` object.
 */
export async function getGreenhouseIdToAssetMap(farm) {
  const greenhouses = await getGreenhouses(farm);

  const map = new Map(greenhouses.map((gh) => [gh.id, gh]));

  return map;
}
