import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const linearUnit = "feet";
let roomNumber = 0;
let surfaceNumber = 0;
let openingNumber = 0;
const rooms = [];
const paints = [];
const rl = readline.createInterface({ input, output });

// TODO add typeguards to functions

console.log("This program will ask one at a time for each room and wall or ceiling.");
console.log("Ceilings may be made of multiple sections or surfaces delineated by edges");
console.log('So each wall and section of ceiling will be called a "surface."');

console.log("In this version of the program, each surface is assumed to be rectangular.");

// Assuming gallons for now.

let isRoomInfoNeeded = true;
while (isRoomInfoNeeded) {
  if (roomNumber === 0) {
    console.log(`Provide info for each room to be painted.`);
  }

  const roominfo = await getInfoRoom();
  rooms.push(roominfo);

  // TODO fix this to be an undefeatable boolean question
  const haveAnother = await rl.question(`Do you have another room to paint? `);
  isRoomInfoNeeded = ["yes", "y"].includes(haveAnother);
}

// TODO return calculated volumes by paint.

rl.close();

/**
 * getInfoRoom
 *
 * Get info about a room's wall or ceiling-surfaces
 *
 * @returns {array}
 *  surfaces: array of surface info objects
 */
async function getInfoRoom() {
  const friendlyRoomNumber = roomNumber + 1;
  const surfaces = [];

  let isSurfaceInfoNeeded = true;
  while (isSurfaceInfoNeeded) {
    if (surfaceNumber === 0) {
      console.log(`Provide info for each surface in room #${friendlyRoomNumber}.`);
    }

    const surfaceInfo = await getInfoSurface();
    surfaces.push(surfaceInfo);

    // TODO fix this to be an undefeatable boolean question
    const haveAnother = await rl.question(`Do you have another surface in room #${friendlyRoomNumber}? `);
    isSurfaceInfoNeeded = ["yes", "y"].includes(haveAnother);
  }

  // TODO side effect. How to improve?
  roomNumber++;
  surfaceNumber = 0;

  return surfaces;
}

/**
 * getInfoSurface
 *
 * Get the dimensions and paint info for a surface (one wall or ceiling surface).
 * Also get the info for any openings in that surface.
 *
 * @returns {
 *  width: number,
 *  height: number,
 *  paintName: string,
 *  paintCoats: string,
 *  openings: array
 * }
 */
async function getInfoSurface() {
  const friendlySurfaceNumber = surfaceNumber + 1;
  const openings = [];
  console.log(`For surface #${friendlySurfaceNumber}:`);

  // TODO convert strings to numbers
  const width = await rl.question(`What is the width (in ${linearUnit})? `);
  const height = await rl.question(`What is the height (in ${linearUnit})? `);
  const { paintName, paintCoats } = await getPaintInfo("surface");

  // TODO check if room *has* any openings

  let isOpeningInfoNeeded = true;
  while (isOpeningInfoNeeded) {
    if (openingNumber === 0) {
      console.log(`Provide info for each door, window, or other opening in surface #${friendlySurfaceNumber}.`);
    }

    const openingInfo = await getInfoOpening(friendlySurfaceNumber);
    openings.push(openingInfo);

    // TODO fix this to be an undefeatable boolean question
    const haveAnother = await rl.question(`Do you have another opening in surface #${friendlySurfaceNumber}? `);
    isOpeningInfoNeeded = ["yes", "y"].includes(haveAnother);
  }

  surfaceNumber++;
  openingNumber = 0;

  return { width, height, paintName, paintCoats, openings };
}

/**
 * @function getInfoOpening
 *
 * Get the dimensions about an opening (a door, window, or other opening) within a surface
 *
 * @param {number} friendlySurfaceNumber
 * @returns {object} of width, height (and paint?) for an opening
 */
async function getInfoOpening(friendlySurfaceNumber) {
  const friendlyOpeningNumber = openingNumber + 1;

  console.log(`For opening #${friendlyOpeningNumber} in surface #${friendlySurfaceNumber}`);
  const width = await rl.question(`What is the width (in ${linearUnit})? `);
  const height = await rl.question(`What is the height (in ${linearUnit})? `);

  // const openings = [];
  // TODO Allow doors to be painted?
  // let paintName = null;
  // let paintCoats = null;
  // const toBePainted = await rl.question('Is this getting painted? (yes/no) ');
  // if (['yes', 'y'].includes(toBePainted)) {
  //   ({ paintName, paintCoats } = await getPaintInfo('door'));
  // }
  // openings.push({ width, height, paintName, paintCoats });

  openingNumber++;

  return { width, height };
}

/**
 * getPaintInfo
 *
 * Get the identity of the paint and the number of coats to be used
 *
 * @param {string} thingToBePainted "surface", "door"
 * @returns {
 *  paintName: string,
 *  paintCoats: string
}
 */
async function getPaintInfo(thingToBePainted) {
  // TODO allow choice from list of previously used paints!
  const paintName = await rl.question(
    `Which paint will be used for this ${thingToBePainted}? Identify the paint by color and type (e.g. "Behr Ultra Sticking White Wall Paint") `,
  );
  const paintCoats = await rl.question("How many coats of that paint will be needed for this surface? ");
  paints.push(paintName);
  return { paintName, paintCoats };
}
