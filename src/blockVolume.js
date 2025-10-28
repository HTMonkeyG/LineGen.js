const { VectorGraph } = require("./graphs.js");

class BlockVolume {
  static packIndex(x, y, z) {
    // Convert to signed 32bit integer.
    x = Number(x) | 0;
    y = Number(y) | 0;
    z = Number(z) | 0;

    return x + "/" + y + "/" + z;
  }

  static unpackIndex(s) {
    s = s.split("/");
    return {
      x: Number(s[0]) | 0,
      y: Number(s[1]) | 0,
      z: Number(s[2]) | 0
    }
  }

  constructor() {
    this.blocks = {};
  }

  setBlock(x, y, z, block) {
    this.blocks[BlockVolume.packIndex(x, y, z)] = block;
  }

  fill(x1, y1, z1, x2, y2, z2, block) {
    var pos = [
      Math.min(x1, x2),
      Math.min(y1, y2),
      Math.min(z1, z2),
      Math.max(x1, x2),
      Math.max(y1, y2),
      Math.max(z1, z2)
    ];

    for (var xC = pos[0]; xC <= pos[1]; xC++)
      for (var yC = pos[0]; yC <= pos[1]; yC++)
        for (var zC = pos[0]; zC <= pos[1]; zC++)
          this.setBlock(xC, yC, zC, block);
  }

  getBlock(x, y, z) {
    return this.blocks[BlockVolume.packIndex(x, y, z)];
  }

  getMax() {
    var r = {
      x: -2147483648,
      y: -2147483648,
      z: -2147483648
    };

    for (var k in this.blocks) {
      var pos = BlockVolume.unpackIndex(k);
      r.x = Math.max(r.x, pos.x);
      r.y = Math.max(r.y, pos.y);
      r.z = Math.max(r.z, pos.z);
    }

    return r
  }

  getMin() {
    var r = {
      x: 2147483647,
      y: 2147483647,
      z: 2147483647
    };

    for (var k in this.blocks) {
      var pos = BlockVolume.unpackIndex(k);
      r.x = Math.min(r.x, pos.x);
      r.y = Math.min(r.y, pos.y);
      r.z = Math.min(r.z, pos.z);
    }

    return r
  }

  getSize() {
    var min = this.getMin()
      , max = this.getMax();
    return {
      x: max.x - min.x + 1,
      y: max.y - min.y + 1,
      z: max.z - min.z + 1,
      min: min,
      max: max
    }
  }

  chain(vg) {
    if (vg instanceof VectorGraph)
      vg.build(this);
    return this;
  }

  forEach(fn) {
    for (var b in this.blocks)
      fn(BlockVolume.unpackIndex(b), this.blocks[b]);
  }
}

exports.BlockVolume = BlockVolume;
