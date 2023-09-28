
//import { LocalStorage } from 'node-localstorage';
//const localStorage = new LocalStorage('./scratch');

import * as farmosUtil from '../util/farmosUtil.js';

// const URL = 'fd2_farmos';
// const client = 'fd2dev';
// const user = "admin";
// const pass = "admin";
// const farm = await getFarmInstance(URL, client, user, pass)

//const users = await getUsernameMap(farm);

//console.log(users.get('admin'))
//console.log(users.get('manager1'))

//const owner = farm.user.create({ type: "user--user"});
//console.log(owner)

// import { LocalStorage } from 'node-localstorage';
// const localStorage = new LocalStorage('./scratch');

//const farm = 
const farm = await farmosUtil.getFarmOSInstance('http://farmos', 'farm', 'admin', 'admin');
console.log(farm)

//const info = await farm.remote.info()
//console.log(info)

//const quant = farm.log.create({ type: "quantity--standard" });
//console.log(quant)

//const users = await farmosUtil.getUsers(farm)
//console.log(users)

//const usernameMap = await farmosUtil.getUsernameMap(farm);
//const usernameMap2 = await farmosUtil.getUsernameMap(farm);

//console.log(usernameMap)

//await doStuff(farm);

// function getLocalStorage() {
//   let ls = null;
//   try { localStorage; }
//   catch (e) {
//     ls = new LocalStorage('./scratch');
//   }

//   if (ls == null) {
//     ls = localStorage;
//   }

//   return ls;
// }

// Async here so we can use await.
// async function getFarm(hostURL, client, user, pass) {

//   const config = {
//     host: hostURL,
//     clientId: client,
//     getToken: () => JSON.parse(getLocalStorage().getItem('token')),
//     setToken: token => getLocalStorage().setItem('token', JSON.stringify(token)),
//   };
//   const options = { remote: config };
  
//   const farm = farmOS.default(options);
//   // // TypeError: farmOS is not a function
//   // // const farm = farmOS(options);

//   if (farm.remote.getToken() === null) {
//     console.log("authenticating")
//     const username = user;
//     const password = pass;
//     await farm.remote.authorize(username, password);
//   }

//   //console.log(farm)

//   const schemata = await farm.schema.fetch()
//   farm.schema.set(schemata);
//   //console.log(schemata)

//   return farm
// }

async function doStuff(farm) {

  console.log(await farm.remote)

  // let names1 = await farmosUtil.getUsers(farm)
  // let names2 = await farmosUtil.getUsers(farm)
  // let names3 = await farmosUtil.refreshUsers(farm)

  
  //console.log(names1)
  // console.log('********')
  // console.log(names2)
}

//   const schemata = await farm.schema.fetch()
//   farm.schema.set(schemata);
//   //console.dir(schemata)
//   // fails with TypeError: Converting circular structure to JSON
//   //console.log(JSON.stringify(schemata))

//   const activity = farm.log.create({ type: 'asset--land' });
//   console.dir(activity)
  //console.log(activity)
  
  //farm.log.fetch({ filter: { type: 'log--activity', id } })

  // // was just activity.timestamp which doesn't exist
  //console.log(activity.attributes.timestamp) // => '2021-11-16T21:54:54.888Z'

  // const initProps = { type: 'log--activity', name: 'did some stuff' };
  // const activity = farm.log.create(initProps);
  // const { id } = activity; // `id` is a v4 UUID
  // await farm.log.send(activity)
//}

/*
 asset--water
 asset--animal
 asset--equipment
 asset--plant
 asset--land
 asset--structure

 file--file

 log--input
 log--observation
 log--maintenance
 log--activity
 log--harvest
 log--seeding

 quantity--material
 quantity--standard

 taxonomy_term--animal_type
 taxonomy_term--material_type
 taxonomy_term--season
 taxonomy_term--log_category
 taxonomy_term--crop_family
 taxonomy_term--unit
 taxonomy_term--plant_type

 user--user

 */