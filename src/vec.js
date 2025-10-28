const { afloor } = require("./utils.js");

class Vec2 {
  static from(vecLike) {
    return new Vec2(
      vecLike.x,
      vecLike.y
    )
  }

  static toInteger(v) {
    return new Vec2(
      afloor(v.x),
      afloor(v.y)
    );
  }

  constructor(x, y) {
    this.x = Number(x) || 0;
    this.y = Number(y) || 0;
  }

  add(a) {
    return new Vec2(
      this.x + a.x,
      this.y + a.y
    );
  }

  sub(a) {
    return new Vec2(
      this.x - a.x,
      this.y - a.y
    );
  }

  scale(x) {
    return new Vec2(
      this.x * x,
      this.y * x
    );
  }

  length() {
    return Math.hypot(this.x, this.y);
  }

  toString() {
    return "(" + this.x + ", " + this.y + ")"
  }
}

class Vec3 {
  static from(vecLike) {
    return new Vec3(
      vecLike.x,
      vecLike.y,
      vecLike.z
    )
  }

  constructor(x, y, z) {
    this.x = Number(x) || 0;
    this.y = Number(y) || 0;
    this.z = Number(z) || 0;
  }

  add(a) {
    return new Vec3(
      this.x + a.x,
      this.y + a.y,
      this.z + a.z
    );
  }

  sub(a) {
    return new Vec3(
      this.x - a.x,
      this.y - a.y,
      this.z - a.z
    );
  }

  scale(s) {
    return new Vec2(
      this.x * s,
      this.y * s,
      this.z * s
    );
  }

  length() {
    return Math.hypot(this.x, this.y, this.z);
  }

  toString() {
    return "(" + this.x + ", " + this.y + ", " + this.z + ")"
  }
}

function VecN(...v) {
  var initial = [];

  // Only supports vectors from 2 to 4 dimensions.
  if (v.length > 4)
    throw new Error("Too much dimension for vector.");
  else if (v.length < 2)
    throw new Error("Too few dimension for vector.");
  else
    for (var e of v)
      initial.push(Number(e));
  initial.dimension = v.length;
  return new Proxy(
    initial,
    {
      get: function (o, p) {
        var values = [];
        if (!/[xyzw]+/.test(p) || p.length > 4)
          return o[p];
        if (p.length == 1)
          return initial["xyzw".indexOf(c)];
        for (var c of p)
          values.push(initial["xyzw".indexOf(c)]);
      },
      set: function (o, p, v) {
        return true;
      }
    }
  );
}

exports.Vec2 = Vec2;
exports.Vec3 = Vec3;
exports.VecN = VecN;