RMS.LoadLibrary("rmgen");

//random terrain textures
var random_terrain = randomizeBiome();

const tMainTerrain = rBiomeT1();
const tForestFloor1 = rBiomeT2();
const tForestFloor2 = rBiomeT3();
const tCliff = rBiomeT4();
const tTier1Terrain = rBiomeT5();
const tTier2Terrain = rBiomeT6();
const tTier3Terrain = rBiomeT7();
const tHill = rBiomeT8();
const tDirt = rBiomeT9();
const tRoad = rBiomeT10();
const tRoadWild = rBiomeT11();
const tTier4Terrain = rBiomeT12();
const tShoreBlend = rBiomeT13();
const tShore = rBiomeT14();
const tWater = rBiomeT15();

// gaia entities
const oTree1 = rBiomeE1();
const oTree2 = rBiomeE2();
const oTree3 = rBiomeE3();
const oTree4 = rBiomeE4();
const oTree5 = rBiomeE5();
const oFruitBush = rBiomeE6();
const oChicken = rBiomeE7();
const oMainHuntableAnimal = rBiomeE8();
const oFish = rBiomeE9();
const oSecondaryHuntableAnimal = rBiomeE10();
const oStoneLarge = rBiomeE11();
const oStoneSmall = rBiomeE12();
const oMetalLarge = rBiomeE13();

// decorative props
const aGrass = rBiomeA1();
const aGrassShort = rBiomeA2();
const aReeds = rBiomeA3();
const aLillies = rBiomeA4();
const aRockLarge = rBiomeA5();
const aRockMedium = rBiomeA6();
const aBushMedium = rBiomeA7();
const aBushSmall = rBiomeA8();

const pForest1 = [tForestFloor2 + TERRAIN_SEPARATOR + oTree1, tForestFloor2 + TERRAIN_SEPARATOR + oTree2, tForestFloor2];
const pForest2 = [tForestFloor1 + TERRAIN_SEPARATOR + oTree4, tForestFloor1 + TERRAIN_SEPARATOR + oTree5, tForestFloor1];
const BUILDING_ANGlE = -PI/4;

// initialize map

log("Initializing map...");
InitMap();

const numPlayers = getNumPlayers();
const mapSize = getMapSize();
const mapArea = mapSize*mapSize;

// create tile classes
var clPlayer = createTileClass();
var clHill = createTileClass();
var clForest = createTileClass();
var clWater = createTileClass();
var clDirt = createTileClass();
var clRock = createTileClass();
var clMetal = createTileClass();
var clFood = createTileClass();
var clBaseResource = createTileClass();
var clLand = createTileClass();

for (let ix = 0; ix < mapSize; ++ix)
	for (let iz = 0; iz < mapSize; ++iz)
		placeTerrain(ix, iz, tWater);

// randomize player order
var playerIDs = [];
for (var i = 0; i < numPlayers; ++i)
	playerIDs.push(i+1);
playerIDs = sortPlayers(playerIDs);

// place players
var playerX = new Array(numPlayers);
var playerZ = new Array(numPlayers);
var playerAngle = new Array(numPlayers);

var startAngle = randFloat(0, TWO_PI);
for (var i = 0; i < numPlayers; ++i)
{
	playerAngle[i] = startAngle + i * TWO_PI/numPlayers;
	playerX[i] = 0.5 + 0.38 * cos(playerAngle[i]);
	playerZ[i] = 0.5 + 0.38 * sin(playerAngle[i]);
}

// some constants
var radius = scaleByMapSize(15, 25);
var elevation = 20;
var centerOfMap = mapSize / 2;

var fx = fractionToTiles(0.5);
var fz = fractionToTiles(0.5);
ix = round(fx);
iz = round(fz);

var shoreRadius = 6;
var elevation = 2;

// create the water
var placer = new ClumpPlacer(mapArea * 1, 1, 1, 1, ix, iz);
var terrainPainter = new LayeredPainter(
    [tWater, tWater, tShore],       // terrains
    [1, 4]       // widths
);
var elevationPainter = new SmoothElevationPainter(
   ELEVATION_SET,          	// type
   -2,             			// elevation
   2               			// blend radius
);
createArea(placer, [terrainPainter, elevationPainter, paintClass(clWater)], avoidClasses(clPlayer, 5));

for (var i = 0; i < numPlayers; ++i)
{
	var id = playerIDs[i];
	log("Creating base for player " + id + "...");

	// get the x and z in tiles
	var fx = fractionToTiles(playerX[i]);
	var fz = fractionToTiles(playerZ[i]);
	var ix = round(fx);
	var iz = round(fz);

	var hillSize = PI * radius * radius * 2;

	// create the hill
	var placer = new ClumpPlacer(hillSize, 0.80, 0.1, 10, ix, iz);
	var terrainPainter = new LayeredPainter(
		[tShore, tMainTerrain],		// terrains
		[shoreRadius]		// widths
	);
	var elevationPainter = new SmoothElevationPainter(
		ELEVATION_SET,			// type
		elevation,				// elevation
		shoreRadius				// blend radius
	);
	createArea(placer, [terrainPainter, elevationPainter, paintClass(clPlayer)], null);

	// mark a small area around the player's starting coördinates with the clPlayer class
	addToClass(ix, iz, clPlayer);
	addToClass(ix + 5, iz, clPlayer);
	addToClass(ix, iz + 5, clPlayer);
	addToClass(ix - 5, iz, clPlayer);
	addToClass(ix, iz - 5, clPlayer);

	// create starting units
	placeCivDefaultEntities(fx, fz, id, BUILDING_ANGlE);

	// create the city patch
	var cityRadius = radius/3;
	var placer = new ClumpPlacer(PI * cityRadius * cityRadius, 0.6, 0.3, 10, ix, iz);
	var painter = new LayeredPainter([tRoadWild, tRoad], [1]);
	createArea(placer, painter, null);

	// create animals
	for (var j = 0; j < 2; ++j)
	{
		var aAngle = randFloat(0, TWO_PI);
		var aDist = 7;
		var aX = round(fx + aDist * cos(aAngle));
		var aZ = round(fz + aDist * sin(aAngle));
		var group = new SimpleGroup(
			[new SimpleObject(oChicken, 5, 5, 0, 2)],
			true, clBaseResource, aX, aZ
		);
		createObjectGroup(group, 0);
	}

	// create berry bushes
	var bbAngle = randFloat(0, TWO_PI);
	var bbDist = 12;
	var bbX = round(fx + bbDist * cos(bbAngle));
	var bbZ = round(fz + bbDist * sin(bbAngle));
	group = new SimpleGroup(
		[new SimpleObject(oFruitBush, 5, 5, 0, 3)],
		true, clBaseResource, bbX, bbZ
	);
	createObjectGroup(group, 0);

	// create metal mine
	var mAngle = bbAngle;
	while(abs(mAngle - bbAngle) < PI/3)
	{
		mAngle = randFloat(0, TWO_PI);
	}
	var mDist = 12;
	var mX = round(fx + mDist * cos(mAngle));
	var mZ = round(fz + mDist * sin(mAngle));
	group = new SimpleGroup(
		[new SimpleObject(oMetalLarge, 1, 1, 0, 0)],
		true, clBaseResource, mX, mZ
	);
	createObjectGroup(group, 0);

	// create stone mines
	mAngle += randFloat(PI/8, PI/4);
	mX = round(fx + mDist * cos(mAngle));
	mZ = round(fz + mDist * sin(mAngle));
	group = new SimpleGroup(
		[new SimpleObject(oStoneLarge, 1, 1, 0, 2)],
		true, clBaseResource, mX, mZ
	);
	createObjectGroup(group, 0);

	// create starting trees, should avoid mines and bushes
	let tries = 50;
	let tDist = 16;
	let num = 50;
	for (let x = 0; x < tries; ++x)
	{
		let tAngle = randFloat(0, TWO_PI);
		let tX = round(fx + tDist * cos(tAngle));
		let tZ = round(fz + tDist * sin(tAngle));
		group = new SimpleGroup(
			[new SimpleObject(oTree2, num, num, 0, 7)],
			true, clBaseResource, tX, tZ
		);
		if( createObjectGroup(group, 0, avoidClasses(clBaseResource, 5)) )
			break;
	}

	// create grass tufts
	num = (PI * radius * radius) / 250;
	for (var j = 0; j < num; ++j)
	{
		var gAngle = randFloat(0, TWO_PI);
		var gDist = radius - (5 + randInt(7));
		var gX = round(fx + gDist * cos(gAngle));
		var gZ = round(fz + gDist * sin(gAngle));
		group = new SimpleGroup(
			[new SimpleObject(aGrassShort, 2, 5, 0, 1, -PI/8, PI/8)],
			false, clBaseResource, gX, gZ
		);
		createObjectGroup(group, 0);
	}
}

RMS.SetProgress(40);

// create big islands
/*
var randIslands = 15 + randInt(20);
for(var i=0;i<randIslands;i++) {
	var randX = randInt(mapSize);
	var randY = randInt(mapSize);
	var placer = new ChainPlacer(floor(scaleByMapSize(10, 10)), floor(scaleByMapSize(15, 15)), floor(scaleByMapSize(140,140)), 1, randX, randY, 0, [floor(mapSize * 0.01)]);
	var terrainPainter = new LayeredPainter(
		[tShore, tMainTerrain],		// terrains
		[shoreRadius]		// widths
	);
	var elevationPainter = new SmoothElevationPainter(
		ELEVATION_SET,          // type
		elevation,              // elevation
		shoreRadius               // blend radius
	);
	createArea(placer, [terrainPainter, elevationPainter, paintClass(clHill)], avoidClasses(clBaseResource, 2, clHill, 15, clPlayer, 25));
}
*/

// create central island
var placer = new ChainPlacer(floor(scaleByMapSize(6, 6)), floor(scaleByMapSize(10, 15)), floor(scaleByMapSize(200, 300)), 1, centerOfMap, centerOfMap, 0, [floor(mapSize * 0.01)]);
var terrainPainter = new LayeredPainter(
	[tShore, tMainTerrain],       // terrains
	[shoreRadius,100]     // widths
);
var elevationPainter = new SmoothElevationPainter(
	ELEVATION_SET,          // type
	elevation,              // elevation
	shoreRadius               // blend radius
);
createArea(placer, [terrainPainter, elevationPainter, paintClass(clHill)], avoidClasses(clPlayer, 25));

var randMountains = 20 + randInt(15);
for(var m=0;m<randMountains;m++) {
	var randX = randInt(mapSize);
	var randY = randInt(mapSize);
	var placer = new ChainPlacer(floor(scaleByMapSize(7, 7)), floor(scaleByMapSize(15, 15)), floor(scaleByMapSize(15, 20)), 1, randX, randY, 0, [floor(mapSize * 0.01)]);
	var elevRand = 6 + randInt(15);
	var terrainPainter = new LayeredPainter(
		[tCliff, tForestFloor1],       // terrains
		[floor(elevRand/3), 40]     // widths
	);
	var elevationPainter = new SmoothElevationPainter(
		ELEVATION_SET,          // type
		elevRand,              // elevation
		floor(elevRand/3)               // blend radius
	);
	createArea(placer, [terrainPainter, elevationPainter, paintClass(clHill)], [avoidClasses(clBaseResource, 2, clPlayer, 20), stayClasses(clHill, 6)]);
}

var randMountains = 8 + randInt(10);
for(var m=0;m<randMountains;m++) {
	var randX = randInt(mapSize);
	var randY = randInt(mapSize);
	var placer = new ChainPlacer(floor(scaleByMapSize(5, 5)), floor(scaleByMapSize(8, 8)), floor(scaleByMapSize(15, 20)), 1, randX, randY, 0, [floor(mapSize * 0.01)]);
	var elevRand = 15 + randInt(15);
	var terrainPainter = new LayeredPainter(
		[tCliff, tForestFloor2],       // terrains
		[floor(elevRand/3), 40]     // widths
	);
	var elevationPainter = new SmoothElevationPainter(
		ELEVATION_MODIFY,          // type
		elevRand,              // elevation
		floor(elevRand/3)               // blend radius
	);
	createArea(placer, [terrainPainter, elevationPainter, paintClass(clHill)], [avoidClasses(clBaseResource, 2, clPlayer, 20), stayClasses(clHill, 6)]);
}

// create small islands
/*
var randIslands = 15 + randInt(20);
for(var i=0;i<randIslands;i++) {
	var randX = randInt(mapSize);
	var randY = randInt(mapSize);
	var placer = new ChainPlacer(floor(scaleByMapSize(5, 5)), floor(scaleByMapSize(9, 9)), floor(scaleByMapSize(140,140)), 1, randX, randY, 0, [floor(mapSize * 0.01)]);
	var terrainPainter = new LayeredPainter(
		[tShore, tMainTerrain],		// terrains
		[shoreRadius]		// widths
	);
	var elevationPainter = new SmoothElevationPainter(
		ELEVATION_SET,          // type
		elevation,              // elevation
		shoreRadius               // blend radius
	);
	createArea(placer, [terrainPainter, elevationPainter, paintClass(clHill)], avoidClasses(clBaseResource, 2, clHill, 15, clPlayer, 25));
}*/

// create bumps
//createBumps();


var centerOfMap = mapSize / 2;

// create center bounty
group = new SimpleGroup(
	[new SimpleObject(oMetalLarge,3,6,55,floor(mapSize * 0.15))],
	true, clBaseResource, centerOfMap, centerOfMap
);
createObjectGroup(group, 0, [avoidClasses(clBaseResource, 20, clPlayer, 5),stayClasses(clHill,10)]);
group = new SimpleGroup(
	[new SimpleObject(oStoneLarge,3,6,55,floor(mapSize * 0.15))],
	true, clBaseResource, centerOfMap, centerOfMap
);
createObjectGroup(group, 0, [avoidClasses(clBaseResource, 20, clPlayer, 5),stayClasses(clHill,10)]);
group = new SimpleGroup(
	[new SimpleObject(oMainHuntableAnimal,floor(6*numPlayers),floor(6*numPlayers),2,floor(mapSize * 0.1))],
	true, clBaseResource, centerOfMap, centerOfMap
);
createObjectGroup(group, 0, [avoidClasses(clBaseResource, 2, clHill, 5, clPlayer, 10, clWater, 2),stayClasses(clHill,10)]);


// create fish
log("Creating fish...");
group = new SimpleGroup(
	[new SimpleObject(oFish, 2,3, 0,2)],
	true, clFood
);
createObjectGroups(group, 0,
	avoidClasses(clLand, 4, clForest, 0, clPlayer, 0, clHill, 0, clFood, 20),
	10 * numPlayers, 60
);

/*
log("Creating stone mines...");
// create stone quarries
createMines(
 	[
  		[new SimpleObject(oStoneLarge, 3, 6, 10, mapSize)]
 	],
 	[avoidClasses(clForest, 1, clPlayer, 25, clRock, 10), stayClasses(clHill, 6)],
 	clRock
)

log("Creating metal mines...");
// create large metal quarries
createMines(
 	[
  		[new SimpleObject(oMetalLarge, 3, 6, 10, mapSize)]
 	],
 	[avoidClasses(clForest, 1, clPlayer, 25, clMetal, 10, clRock, 5), stayClasses(clHill, 6)],
 	clMetal
)
*/

// create forests
createForests(
	[tMainTerrain, tForestFloor1, tForestFloor2, pForest1, pForest2],
	[avoidClasses(clPlayer, 25, clForest, 10, clBaseResource, 3, clMetal, 3, clRock, 3), stayClasses(clHill, 6)],
	clForest,
	0.7,
	random_terrain
);

// create straggeler trees
var types = [oTree1, oTree2, oTree4, oTree3];	// some variation
createStragglerTrees(types, [avoidClasses(clBaseResource, 2, clMetal, 1, clRock, 1), stayClasses(clHill, 6)]);
createStragglerTrees(types, [avoidClasses(clBaseResource, 2, clMetal, 1, clRock, 1), stayClasses(clPlayer, 6)]);

RMS.SetProgress(50);

// create dirt patches
log("Creating dirt patches...");
createLayeredPatches(
	[scaleByMapSize(3, 6), scaleByMapSize(5, 10), scaleByMapSize(8, 21)],
	[[tMainTerrain, tTier1Terrain], [tTier1Terrain, tTier2Terrain], [tTier2Terrain, tTier3Terrain]],
	[1, 1],
	avoidClasses(clWater, 3, clForest, 0, clHill, 0, clDirt, 5, clPlayer, 12)
);

RMS.SetProgress(55);

// create grass patches
log("Creating grass patches...");
createPatches(
	[scaleByMapSize(2, 4), scaleByMapSize(3, 7), scaleByMapSize(5, 15)],
	tTier4Terrain,
	avoidClasses(clWater, 3, clForest, 0, clHill, 0, clDirt, 5, clPlayer, 12)
);

RMS.SetProgress(65);

// create animals
createFood
(
 	[
  		[new SimpleObject(oMainHuntableAnimal, 5, 7, 0, 4)], [new SimpleObject(oSecondaryHuntableAnimal, 2, 3, 0, 2)]
 	],
 	[3 * numPlayers, 3 * numPlayers],
 	avoidClasses(clWater, 3, clForest, 3, clPlayer, 20, clHill, 1, clFood, 20, clRock, 4, clMetal, 4)
);

RMS.SetProgress(75);

// create fruits
createFood
(
 	[
  		[new SimpleObject(oFruitBush, 5,7, 0,4)]
 	],
 	[3 * numPlayers],
 	avoidClasses(clWater, 3, clForest, 0, clPlayer, 20, clHill, 1, clFood, 10)
);

RMS.SetProgress(85);

// create straggler trees
var types = [oTree1, oTree2, oTree4, oTree3];	// some variation
createStragglerTrees(types, avoidClasses(clWater, 5, clForest, 7, clHill, 1, clPlayer, 30, clMetal, 1, clRock, 1));

// create decoration
var planetm = 1;
if (random_terrain==7)
	planetm = 8;

createDecoration
(
 	[
 		[new SimpleObject(aRockMedium, 1, 3, 0, 1)],
  		[new SimpleObject(aRockLarge, 1, 2, 0, 1), new SimpleObject(aRockMedium, 1, 3, 0, 2)],
  		[new SimpleObject(aGrassShort, 2, 15, 0, 1, -PI/8, PI/8)],
  		[new SimpleObject(aGrass, 2, 10, 0, 1.8, -PI/8, PI/8), new SimpleObject(aGrassShort, 3, 10, 1.2, 2.5, -PI/8, PI/8)],
  		[new SimpleObject(aBushMedium, 1, 5, 0, 2), new SimpleObject(aBushSmall, 2, 4, 0, 2)]
 	],
 	[
  		scaleByMapSize(16, 262),
  		scaleByMapSize(8, 131),
  		planetm * scaleByMapSize(13, 200),
  		planetm * scaleByMapSize(13, 200),
  		planetm * scaleByMapSize(13, 200)
 	],
 	avoidClasses(clForest, 2, clPlayer, 20, clHill, 5, clWater, 1, clFood, 1, clBaseResource, 2)
);

// Export map data
ExportMap();
