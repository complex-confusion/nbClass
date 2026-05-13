import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const linearUnit = "feet";
const coverageUnit = "sq. ft. / gal.";
const volumeUnitMajor = "gallons";
const volumeUnitMinor = "quarts";
const volumeUnitMajorSing = "gallon";
let roomNumber = 0;
let surfaceNumber = 0;
let openingNumber = 0;
let rooms = [];
const paints = [];
const rl = readline.createInterface({ input, output });

/**
 * // TODO Iterative fixes & Improvements
 *
 * DONE Correct the types of numbers
 * Ask if a room has openings before getting details!
 *
 * DONE Ask about coverage of each paint used
 * DONE  Actually calculate volume of paint.
 * Ask about primer: use primer? Which primer, how many coats (default to 1)
 *  Make sure coverages are always given in the same units (per sq ft? per 100 sq ft?)
 *
 * Space out the questions with new lines
 * Allow different units
 * add typeguards to functions
 *  Add checks that openings are smaller than surface;
 * Add checks that openings add up to the surface area of the wall or smaller (OR - let him enter silly numbers, so long as it doesn't break).
 * Add function to better handle y/n questions.
 * Add option to select type of paint or primer from those entered earlier.
 * Allow optional painting of doors?
 * Add shapes instead of assuming rectangular. Begin with trapezoids.
 *
 * Ask about cost of each paint when asking about coverage;
 * Calculate cost of each paint.
 * Ask cost per can-size; calculate whether a larger size might be cheaper than buying almost as much in smaller cans.
 *
 * Remove side-effects from functions.
 *
 */

console.log("This program will ask one at a time for each room and wall or ceiling.");
console.log("Ceilings may be made of multiple sections or surfaces delineated by edges");
console.log('So each wall and section of ceiling will be called a "surface."');

console.log("In this version of the program, each surface is assumed to be rectangular");
console.log("and paint is purchased in gallon buckets.");

// Assuming gallons for now.

rooms = await getInfoAboutBuilding();

// TODO return calculated volumes by paint.
// for each room
// for each surface
//  calculate surface area of whole wall;
//  for each opening
//    calculate surface area of opening
//  calc surf area minus total area of openings
//  volume needed for this wall = divide square footage by coverage
// gather volume for each type of paint

for (const room of rooms) {
  for (const surface of room) {
    const { width, height, paint, openings } = surface;
    const surfaceArea = width * height;
    console.log(`\nSurface area of this wall is ${surfaceArea} sq. ft.`);

    let areaOfOpenings = 0;
    for (const opening of openings) {
      const { width, height } = opening;
      console.log(`  Opening area is ${width * height} sq. ft.`);
      areaOfOpenings += width * height;
    }

    const netSurfaceArea = surfaceArea - areaOfOpenings;

    // TODO when including primer, include it as a separate object or turn paint into an array.
    const { paintName, paintCoats, paintCoverage } = paint;
    const volumeOfPaint = (netSurfaceArea * paintCoats) / paintCoverage;
    // Quarts (Quarter gallons) of paint can be purchased!
    const decimalGallonsOfPaint = Math.ceil(volumeOfPaint * 4) / 4;
    const wholeGallons = Math.floor(decimalGallonsOfPaint);
    const quarts = (decimalGallonsOfPaint - wholeGallons) * 4;

    let volumeString = `${wholeGallons} ${volumeUnitMajor}`;
    volumeString += quarts > 0 ? ` and ${quarts} ${volumeUnitMinor}` : "";

    console.log(`For ${paintName}:`);
    console.log(`  This paint covers ${paintCoverage} ${coverageUnit}`);
    console.log(`  You will need ${volumeString} for this surface.`);
  }
}

rl.close();

/**
 * @returns {Array<
 *  Array<{
 *   width: number,
 *   height: number,
 *   paint: {paintName: string, paintCoats: number, coverage: number},
 *   openings: Array<{width: number, height: number}>
 *  }>
 * >}
 */
async function getInfoAboutBuilding() {
  const rooms = [];
  let isRoomInfoNeeded = true;
  while (isRoomInfoNeeded) {
    if (roomNumber === 0) {
      console.log(`Provide info for each room to be painted.`);
    }

    const roominfo = await getInfoAboutRoom();
    rooms.push(roominfo);

    const haveAnother = await rl.question(`Do you have another room to paint? `);
    isRoomInfoNeeded = ["yes", "y"].includes(haveAnother);
  }

  return rooms;
}

/**
 * getInfoAboutRoom
 *
 * Get info about each wall or ceiling-surface in a room
 *
 * @returns {Array<{
 *  width: number,
 *  height: number,
 *  paint: {paintName: string, paintCoats: number, coverage: number},
 *  openings: Array<{width: number, height: number}>
 * }>} surfaces: array of surface info objects
 */
async function getInfoAboutRoom() {
  const friendlyRoomNumber = roomNumber + 1;
  const surfaces = [];

  let isSurfaceInfoNeeded = true;
  while (isSurfaceInfoNeeded) {
    if (surfaceNumber === 0) {
      console.log(`Provide info for each surface in room #${friendlyRoomNumber}.`);
    }

    const surfaceInfo = await getInfoAboutSurface();
    surfaces.push(surfaceInfo);

    const haveAnother = await rl.question(`Do you have another surface in room #${friendlyRoomNumber}? `);
    isSurfaceInfoNeeded = ["yes", "y"].includes(haveAnother);
  }

  roomNumber++;
  surfaceNumber = 0;

  return surfaces;
}

/**
 * getInfoAboutSurface
 *
 * Get the dimensions and paint info for a surface (one wall or ceiling surface).
 * Also get the info for any openings in that surface.
 *
 * @returns {
 *  width: number,
 *  height: number,
 *  paint: {paintName: string, paintCoats: number, coverage: number},
 *  openings: Array<{width: number, height: number}>
 * }
 */
async function getInfoAboutSurface() {
  const friendlySurfaceNumber = surfaceNumber + 1;
  const openings = [];
  console.log(`For surface #${friendlySurfaceNumber}:`);

  // TODO convert strings to numbers
  const width = parseFloat(await rl.question(`What is the width (in ${linearUnit})? `));
  const height = parseFloat(await rl.question(`What is the height (in ${linearUnit})? `));
  const paint = await getPaintForSurface("surface");

  // TODO check if room *has* any openings

  let isOpeningInfoNeeded = true;
  while (isOpeningInfoNeeded) {
    if (openingNumber === 0) {
      console.log(`Provide info for each door, window, or other opening in surface #${friendlySurfaceNumber}.`);
    }

    const openingInfo = await getInfoAboutOpening(friendlySurfaceNumber);
    openings.push(openingInfo);

    // TODO fix this to be an undefeatable boolean question
    const haveAnother = await rl.question(`Do you have another opening in surface #${friendlySurfaceNumber}? `);
    isOpeningInfoNeeded = ["yes", "y"].includes(haveAnother);
  }

  surfaceNumber++;
  openingNumber = 0;

  return { width, height, paint, openings };
}

/**
 * @function getInfoAboutOpening
 *
 * Get the dimensions about an opening (a door, window, or other opening) within a surface
 *
 * @param {number} friendlySurfaceNumber
 * @returns {object} of width, height (and paint?) for an opening
 */
async function getInfoAboutOpening(friendlySurfaceNumber) {
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
  //   ({ paintName, paintCoats } = await getPaintForSurface('door'));
  // }
  // openings.push({ width, height, paintName, paintCoats });

  openingNumber++;

  return { width, height };
}

/**
 * getPaintForSurface
 *
 * Get the identity of the paint and the number of coats to be used
 *
 * @param {string} thingToBePainted "surface", "door"
 * @returns {
 *  paintName: string,
 *  paintCoats: number,
 *  coverage: number
 * }
 */
async function getPaintForSurface(thingToBePainted) {
  // TODO allow choice from list of previously used paints!
  const paintName = await rl.question(
    `Which paint will be used for this ${thingToBePainted}? Identify the paint by color and type (e.g. "Behr Ultra Sticking White Wall Paint") `,
  );
  const paintCoats = parseFloat(await rl.question("How many coats of that paint will be needed for this surface? "));
  // TODO Default to coverage entered earlier for this paint.
  const paintCoverage = parseFloat(
    await rl.question(`How much surface area does a ${volumeUnitMajorSing} of this paint cover (${coverageUnit})? `),
  );

  paints.push(paintName);
  return { paintName, paintCoats, paintCoverage };
}

// async function getInfoAboutPaints() {
//   const paintsInfoGathered = [];
//   let isPaintInfoNeeded = true;
//   while (isPaintInfoNeeded) {
//     const paintName = await rl.question(`What is the name of this paint? `);
//
//     const paintCoverage = await rl.question(`What is the coverage for this paint (${coverageUnit})? `);
//     paintsInfoGathered.push({ paintName, paintCoverage });

//     const haveAnother = await rl.question(`Do you have another paint to enter? `);
//     isPaintInfoNeeded = ["yes", "y"].includes(haveAnother);
//   }

//   return paintsInfoGathered;
// }
