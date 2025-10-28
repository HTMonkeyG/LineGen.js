const MCS = require("mcstructure-js")
  , NBT = require("parsenbt-js")
  , PMR = require("project-mirror-registry");
const { Vec2, Vec3 } = require("./vec.js");

function blockVolumeToStructure(bv) {
  var size = bv.getSize()
    , begin = new Vec3(size.min.x, size.min.y, size.min.z)
    , result = new MCS(size.x, size.y, size.z);
  
  bv.forEach(
    function (pos, block) {
      var data = PMR.createUniversalTag("block");
      data.name = block;
      result.setBlock(Vec3.from(pos).sub(begin), data)
    }
  );

  return result
}

module.exports = blockVolumeToStructure;