import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const linearUnit = "feet";
const areaUnit = "sq. ft.";
const coverageUnit = `${areaUnit} / gal.`;
const volumeUnitMajor = "gallons";
const volumeUnitMajorSing = "gallon";
const volumeUnitMinor = "quarts";
const surfacesString = "surfaces"; // "walls or ceiling-surfaces";
const openingsString = "openings"; // "doors, windows, or other openings";
let roomNumber = 0;
let surfaceNumber = 0;
let openingNumber = 0;
let rooms = [];
const paintsInventory = [];
const rl = readline.createInterface({ input, output });

/**
 * // TODO Iterative fixes & Improvements
 *
 * DONE Correct the types of numbers
 * DONEAsk if a room has openings before getting details!
 *
 * DONE Ask about coverage of each paint used
 * DONE  Actually calculate volume of paint.
 * Ask about primer: use primer? Which primer, how many coats (default to 1)
 * Make sure coverages are always given in the same units (per sq ft? per 100 sq ft?)
 *   They're not! Paint cans report coverage *per container volume*! (e.g. "this can covers n to m sq. ft")
 *
 * Space out the questions with new lines
 * Allow different units
 * add typeguards to functions
 *  Protect against empty input (just hitting enter)
 *  Add checks that openings are smaller than surface;
 * Add checks that openings add up to the surface area of the wall or smaller (OR - let him enter silly numbers, so long as it doesn't break).
 * Add function to better handle y/n questions.
 * DONE Add option to select type of paint or primer from those entered earlier.
 * Allow optional painting of doors?
 * Add shapes instead of assuming rectangular. Begin with trapezoids.
 *
 * Ask about cost of each paint when asking about coverage;
 * Calculate cost of each paint.
 * Ask cost per can-size; calculate whether a larger size might be cheaper than buying almost as much in smaller cans.
 *
 * Track doors, and allow user to re-use door dimensions from earlier
 *  (door from room 1 to room 2 will *probably* have same dimensions in both rooms, barring differences in door-moldings.)
 *
 * Remove side-effects from functions.
 *
 * Waffle on the use of "openings" and "surface(s)"
 *
 */

console.log("This program will ask one at a time for each room and wall or ceiling.");
console.log("Ceilings may be made of multiple sections or surfaces delineated by edges");
console.log('So each wall and section of ceiling will be called a "surface."');

console.log("In this version of the program, each surface is assumed to be rectangular");
console.log("and paint is purchased in gallons and quarts (quarter gallons).");

rooms = await getInfoAboutBuilding();

// Report on the volumes of paints needed:
for (let [roomIndex, room] of rooms.entries()) {
  for (let [surfaceIndex, surface] of room.entries()) {
    const { width, height, paint, openings } = surface;
    const surfaceArea = Math.round(width * height) / 100;
    // TODO get index
    console.log(
      `\nSurface area of room #${roomIndex + 1}, ${surfacesString} #${surfaceIndex + 1} is ${surfaceArea} ${areaUnit}`,
    );

    let areaOfOpenings = 0;
    for (const opening of openings) {
      const { width: openingWidth, height: openingHeight } = opening;
      const openingArea = Math.round(openingWidth * openingHeight) / 100;
      console.log(`  Opening area is ${openingArea} ${areaUnit}`);
      areaOfOpenings += openingArea;
    }

    const netSurfaceArea = surfaceArea - areaOfOpenings;

    // TODO when including primer, include it as a separate object or turn paint into an array.
    const { paintName, paintCoats, paintCoverage } = paint;
    const volumeOfPaint = (netSurfaceArea * paintCoats) / paintCoverage;

    // Track how much of this paint we need
    const paintInInventory = paintsInventory.find((paint) => paint.paintName === paintName);
    paintInInventory.volumeNeeded += volumeOfPaint;

    // Quarts (Quarter gallons) of paint can be purchased!
    const surfaceVolumeString = getVolumeAsString(volumeOfPaint);

    console.log(`For ${paintName}:`);
    console.log(`  This paint covers ${paintCoverage} ${coverageUnit}`);
    console.log(`  You will need ${surfaceVolumeString} for this surface.`);
  }

  //  Report the total amount of paint needed
  for (const { paintName, volumeNeeded } of paintsInventory) {
    const totalVolumeString = getVolumeAsString(volumeNeeded);

    console.log(`${paintName}:\n  Total needed: ${totalVolumeString}`);
  }
}

rl.close();

/**
 * getVolumeAsString
 * Turn a volume in gallons from a decimal to separate integers for gallons and quarts,
 * rounded up.
 *
 * @param {number} volumeOfPaint
 * @returns string
 */
function getVolumeAsString(volumeOfPaint) {
  const decimalGallonsOfPaint = Math.ceil(volumeOfPaint * 4) / 4;
  const wholeGallons = Math.floor(decimalGallonsOfPaint);
  const quarts = (decimalGallonsOfPaint - wholeGallons) * 4;

  let volumeString = `${wholeGallons} ${volumeUnitMajor}`;
  volumeString += quarts > 0 ? ` and ${quarts} ${volumeUnitMinor}` : "";

  return volumeString;
}

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

    const surfaceInfo = await getInfoAboutSurface(friendlyRoomNumber);
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
async function getInfoAboutSurface(friendlyRoomNumber) {
  const friendlySurfaceNumber = surfaceNumber + 1;
  const openings = [];
  console.log(`For room #${friendlyRoomNumber}, surface #${friendlySurfaceNumber}:`);

  // TODO convert strings to numbers
  const width = parseFloat(await rl.question(`What is the width (in ${linearUnit})? `));
  const height = parseFloat(await rl.question(`What is the height (in ${linearUnit})? `));
  const paint = await getPaintForSurface("surface");

  const haveOpenings = await rl.question(`Does surface #${friendlySurfaceNumber} have any ${openingsString}? `);

  let isOpeningInfoNeeded = ["yes", "y"].includes(haveOpenings);
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
  // Using global `paints`:
  if (paintsInventory.length > 0) {
    console.log("\nPaints used so far:");
    paintsInventory.forEach((p, i) => console.log(`  ${i + 1}. "${p.paintName}"`));

    const choiceFromList = await rl.question(
      `Enter one of those numbers to reuse a paint, or press Enter to identify a new paint: `,
    );
    const index = parseInt(choiceFromList) - 1;
    if (index >= 0 && index < paintsInventory.length) {
      const paintCoats = parseFloat(await rl.question(`How many coats for this ${thingToBePainted}? `));
      return { ...paintsInventory[index], paintCoats };
    }
  }

  const paintName = await rl.question(
    `Which paint will be used for this ${thingToBePainted}? Identify the paint by color and type (e.g. "Behr Ultra Sticking White Wall Paint") `,
  );
  // TODO Default to coverage entered earlier for this paint.
  const paintCoverage = parseFloat(
    await rl.question(`How much surface area does a ${volumeUnitMajorSing} of this paint cover (${coverageUnit})? `),
  );
  const paintCoats = parseFloat(await rl.question("How many coats of that paint will be needed for this surface? "));

  // TODO side effect!
  paintsInventory.push({ paintName, paintCoats, paintCoverage, volumeNeeded: 0 });

  return { paintName, paintCoats, paintCoverage };
}

async function askForFriendlyString(question) {
  return (await rl.question(question)).toLowerCase().trim();
}
