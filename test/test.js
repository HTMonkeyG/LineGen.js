const {
  VectorGraph,
  Point,
  Line,
  Circle,
  Parallelogram,
  Face,
  Sector,
  Ring
} = require("../src/graphs.js");
const { BlockVolume } = require("../src/blockVolume.js");
const { PNG } = require("pngjs");
const { Xorshift32 } = require("./rand.js");
const fs = require("fs");
const pl = require("path");
const blockVolumeToStructure = require("../src/structure.js");

function renderBV(bv, y) {
  var s = new Map()
    , t = ""
    , u = 0x61;

  y = y || 0;

  for (var zC = 0; zC < 12; zC++, t += "\n")
    for (var xC = 0; xC < 40; xC++) {
      var b = bv.getBlock(xC, y, zC)
        , c;
      if (!b)
        t += "  ";
      else {
        c = s.get(b);
        if (!c)
          s.set(bv.getBlock(xC, y, zC), c = String.fromCharCode(u++));
        t += c;
        t += c;
      }
    }

  console.log(t);
}

function renderBV2(bv, y) {
  function setPixel(x, y, color) {
    var base = (x + y * r.width) * 4;
    r.data[base] = color[0];
    r.data[base + 1] = color[1];
    r.data[base + 2] = color[2];
    r.data[base + 3] = color[3];
  }

  function fillPic(x, y, color) {
    for (var xC = 0; xC < 10; xC++)
      for (var zC = 0; zC < 10; zC++)
        setPixel(x * 10 + xC, y * 10 + zC, color);
  }

  var size = bv.getSize()
    , colors = new Map()
    , rand = new Xorshift32(5201314)
    , r = new PNG({ width: (size.x + 2) * 10, height: (size.z + 2) * 10 });

  for (var zC = size.min.z - 1, yP = size.z + 1; zC < size.max.z + 1; zC++, yP--)
    for (var xC = size.min.x - 1, xP = 0; xC < size.max.x + 1; xC++, xP++) {
      var block = bv.getBlock(xC, y, zC)
        , color;
      if (block) {
        color = colors.get(block);
        if (!color) {
          color = [
            rand.nextFloat() * 255,
            rand.nextFloat() * 255,
            rand.nextFloat() * 255,
            255
          ];
          colors.set(block, color);
        }
        fillPic(xP, yP, color)
      }
    }
  fs.writeFileSync(pl.join(__dirname, "./test.png"), PNG.sync.write(r));
}

function test1() {
  var bv = new BlockVolume()
    , p = new Point("minecraft:bedrock", { x: -5, y: -5 })
    , f = new Parallelogram("minecraft:packed_ice", { x: 0, y: 0 }, { x: 0, y: 7 }, { x: 10, y: 7 })
    , g = new Parallelogram("air", { x: 10, y: 0 }, { x: 20, y: 2 }, { x: 20, y: 7 })
    , h = new Circle("tnt", { x: 6, y: 5 }, 4)
    , i = new Sector("air", { x: 10, y: 0 }, 7, 0, Math.PI / 2)
    , j = new Ring("minecraft:packed_ice", { x: 10, y: -10 }, 17, 3, 0, Math.PI / 2)
    , mcs;

  //f.build(bv);
  bv.chain(p).chain(f).chain(j);
  renderBV2(bv);
  mcs = blockVolumeToStructure(bv);
  fs.writeFileSync(pl.join(__dirname, "./test.mcstructure"), Buffer.from(mcs.serialize()))
  //console.log(h.getBresenham());
}

function test2() {
  const WIDTH = 7;
  var bv = new BlockVolume()
    , mcs;
  bv.chain(new Parallelogram(
    "minecraft:packed_ice",
    { x: 0, y: 0 },
    { x: 0, y: WIDTH },
    { x: 30, y: WIDTH }
  )).chain(new Ring(
    "minecraft:packed_ice",
    { x: 30, y: 3 + WIDTH },
    3 + WIDTH, 3,
    Math.PI / 2 * 3, 0
  )).chain(new Parallelogram(
    "minecraft:packed_ice",
    { x: 33, y: 3 + WIDTH },
    { x: 33 + WIDTH, y: 3 + WIDTH },
    { x: 33 + WIDTH, y: 33 + WIDTH }
  )).chain(new Ring(
    "minecraft:packed_ice",
    { x: 30, y: 33 + WIDTH },
    3 + WIDTH, 3,
    0, Math.PI / 2
  ));
  renderBV2(bv);
  mcs = blockVolumeToStructure(bv);
  fs.writeFileSync(pl.join(__dirname, "./test.mcstructure"), Buffer.from(mcs.serialize()))
}
test2();