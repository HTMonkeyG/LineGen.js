function aceil(x) {
  return x > 0 ? Math.ceil(x) : Math.floor(x);
}

function afloor(x) {
  return x > 0 ? Math.floor(x) : Math.ceil(x);
}

class Vec2 {
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

function VecN(...v) {
  var initial = [];
  if (v.length > 4)
    throw new Error("Too much dimension for vector.");
  else if (v.length < 2)
    throw new Error("Too few dimension for vector.");
  else
    for (var e of v)
      initial.push(Number(e));
  initial.dimension = v.length || 2;
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

  chain(vg) {
    if (vg instanceof VectorGraph)
      vg.build(this);
    return this;
  }

  getBlock(x, y, z) {
    return this.blocks[BlockVolume.packIndex(x, y, z)];
  }

  getSize() {

  }
}

/**
 * Parent abstruct interface for all graphic elements.
 */
class VectorGraph {
  constructor(material) {
    this.material = material;
  }

  fillByX(bv, a) {
    var min, max;
    for (var e of a) {
      min = Math.min(e.y[0], e.y[1]);
      max = Math.max(e.y[0], e.y[1]);
      for (var c = min; c <= max; c++)
        bv.setBlock(e.x, 0, c, this.material);
    }
    return bv
  }

  fillByRow(bv, a) {
    var min, max;
    for (var e of a) {
      min = Math.min(e.x[0], e.x[1]);
      max = Math.max(e.x[0], e.x[1]);
      for (var c = min; c <= max; c++)
        bv.setBlock(c, 0, e.y, this.material);
    }
    return bv
  }

  build(bv) {
    ;
  }
}

class Line extends VectorGraph {
  constructor(material, p0, p1) {
    super(material);
    this.p0 = Vec2.toInteger(p0);
    this.p1 = Vec2.toInteger(p1);
  }

  build(bv) {
    var x0 = this.p0.x
      , y0 = this.p0.y
      , dx = Math.abs(this.p1.x - x0)
      , dy = Math.abs(this.p1.y - y0)
      , sx = (x0 < this.p1.x) ? 1 : -1
      , sy = (y0 < this.p1.y) ? 1 : -1
      , err = dx - dy
      , e2;

    bv.setBlock(x0, 0, y0, this.material);
    while (x0 !== this.p1.x || y0 !== this.p1.y) {
      e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
      bv.setBlock(x0, 0, y0, this.material);
    }

    return bv
  }
}

class Face extends VectorGraph {
  constructor(material, p0, p1, p2) {
    super(material);
    this.p0 = Vec2.toInteger(p0);
    this.p1 = Vec2.toInteger(p1);
    this.p2 = Vec2.toInteger(p2);
  }

  build(bv) {
    function barycentric(p0, p1, p2, p) {
      var denominator = (p1.y - p2.y) * (p0.x - p2.x) + (p2.x - p1.x) * (p0.y - p2.y)
        , u, v, w;
      u = ((p1.y - p2.y) * (p.x - p2.x) + (p2.x - p1.x) * (p.y - p2.y)) / denominator;
      v = ((p2.y - p0.y) * (p.x - p2.x) + (p0.x - p2.x) * (p.y - p2.y)) / denominator;
      w = 1 - u - v;
      return {
        u, v, w
      }
    }

    var min, max;

    min = new Vec2(
      Math.min(this.p0.x, this.p1.x, this.p2.x),
      Math.min(this.p0.y, this.p1.y, this.p2.y)
    );
    max = new Vec2(
      Math.max(this.p0.x, this.p1.x, this.p2.x),
      Math.max(this.p0.y, this.p1.y, this.p2.y)
    );

    for (var xC = min.x; xC <= max.x; xC++) {
      for (var yC = min.y; yC <= max.y; yC++) {
        var bc = barycentric(
          this.p0, this.p1, this.p2,
          new Vec2(xC, yC)
        );
        if (bc.u < -1e-9 || bc.v < -1e-9 || bc.w < -1e-9)
          continue;
        bv.setBlock(xC, 0, yC, this.material);
      }
    }

    (new Line(this.material, this.p0, this.p1)).build(bv);
    (new Line(this.material, this.p1, this.p2)).build(bv);
    (new Line(this.material, this.p2, this.p0)).build(bv);
  }
}

class Parallelogram extends VectorGraph {
  constructor(material, p0, p1, p2) {
    super(material);
    this.p0 = Vec2.toInteger(p0);
    this.p1 = Vec2.toInteger(p1);
    this.p2 = Vec2.toInteger(p2);
  }

  build(bv) {
    (new Face(
      this.material,
      this.p0,
      this.p1,
      this.p2
    )).build(bv);
    (new Face(
      this.material,
      this.p0,
      this.p0.add(this.p2.sub(this.p1)),
      this.p2
    )).build(bv);
  }
}

class Circle extends VectorGraph {
  constructor(material, p, r) {
    super(material);
    this.p = Vec2.toInteger(p);
    this.r = afloor(r);
  }

  getBresenham() {
    function addCirclePoints(p, d) {
      dots.push(new Vec2(p.x + d.x, p.y + d.y));
      dots.push(new Vec2(p.x + d.x, p.y - d.y));
      dots.push(new Vec2(p.x - d.x, p.y + d.y));
      dots.push(new Vec2(p.x - d.x, p.y - d.y));

      if (d.x != d.y) {
        dots.push(new Vec2(p.x + d.y, p.y + d.x));
        dots.push(new Vec2(p.x + d.y, p.y - d.x));
        dots.push(new Vec2(p.x - d.y, p.y + d.x));
        dots.push(new Vec2(p.x - d.y, p.y - d.x));
      }
    }

    var dots = []
      , delta = new Vec2(0, this.r)
      , d = 1 - this.r;

    // Directly return when the radius is invalid.
    if (this.r <= 0)
      return [this.p];

    // Get points on the circle.
    addCirclePoints(this.p, delta);
    while (delta.x < delta.y) {
      delta.x++;
      if (d < 0)
        d += 2 * delta.x + 1;
      else {
        delta.y--;
        d += 2 * (delta.x - delta.y) + 1;
      }
      addCirclePoints(this.p, delta);
    }

    // Remove duplicated points.
    return dots.filter(
      function (v) {
        return this.has(v.toString())
          ? false
          : (this.add(v.toString()), true);
      },
      new Set()
    );
  }

  build(bv) {
    var r = this.getBresenham();
    for (var p of r)
      bv.setBlock(p.x, 0, p.y, this.material);
    for (var xC = -this.r; xC <= this.r; xC++)
      for (var zC = -this.r; zC <= this.r; zC++)
        if (Math.hypot(xC, zC) <= this.r + 1e-10)
          bv.setBlock(this.p.x + xC, 0, this.p.y + zC, this.material);
  }
}

class Sector extends Circle {
  constructor(material, p, r, from, to) {
    super(material, p, r);
    this.from = from;
    this.to = to;
  }

  build(bv) {
    var dots = this.getBresenham();

  }
}

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
        t += " ";
      else {
        c = s.get(b);
        if (!c)
          s.set(bv.getBlock(xC, y, zC), c = String.fromCharCode(u++));
        t += c;
      }
    }

  console.log(t);
}

var bv = new BlockVolume()
  , f = new Face("tnt", { x: 0, y: 0 }, { x: 10, y: 2 }, { x: 10, y: 7 })
  , g = new Parallelogram("air", { x: 10, y: 0 }, { x: 20, y: 2 }, { x: 20, y: 7 })
  , h = new Circle("tnt", { x: 6, y: 5 }, 5)
  , i = new Circle("air", { x: 6, y: 5 }, 4);

//f.build(bv);
bv.chain(h).chain(i);
renderBV(bv);
//console.log(h.getBresenham());

class LineGen {
  constructor() {
    this.blockVolume = new BlockVolume();
    this.structure = null;
    this.graphs = [];
  }

  addGraph() {

  }

  build() {

  }
}