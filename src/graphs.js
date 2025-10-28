/**
 * Basic graph elements of LineGen.js.
 */

const { Vec2 } = require("./vec.js");
const { afloor } = require("./utils.js");

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
  
  setBlock(bv, p, block) {
    var material = block || this.material;
    
    bv.setBlock(p.x, 0, p.y, material);
  }

  build(bv) {
    ;
  }
}

class Point extends VectorGraph {
  constructor(material, p) {
    super(material);
    this.p = p;
  }
  
  build(bv) {
    bv.setBlock(this.p.x, 0, this.p.y, this.material);
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
    //    p0 --------- p1
    //   /            /
    //  /            /
    // ++ --------- p2
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

  getBresenham(radius) {
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
      , r = radius || this.r
      , delta = new Vec2(0, r)
      , d = 1 - r;

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
    // Generate the circle with Bresenham method. The circle will look strange
    // if removed this line.
    for (var p of r)
      bv.setBlock(p.x, 0, p.y, this.material);
    // Fill the circle.
    for (var xC = -this.r; xC <= this.r; xC++)
      for (var zC = -this.r; zC <= this.r; zC++)
        // Minus 1e-10 to avoid FP errors.
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
  
  isInAngle(p) {
    var dx = p.x// - this.p.x
      , dy = p.y// - this.p.y
      , d2 = dx * dx + dy * dy
      , angle, start, end;

    if (Math.abs(this.to - this.from) >= 2 * Math.PI - 1e-10)
      return true;
    if (d2 < 1e-10)
      return true;

    angle = Math.atan2(dy, dx);
    if (angle < 0)
      angle += 2 * Math.PI;

    start = this.from % (2 * Math.PI);
    if (start < 0)
      start += 2 * Math.PI;
    end = this.to % (2 * Math.PI);
    if (end < 0)
      end += 2 * Math.PI;

    if (start <= end)
      return angle >= start && angle <= end;
    else
      return angle >= start || angle <= end;
  }

  build(bv) {
    var dots = this.getBresenham();
    for (var p of dots)
      if (this.isInAngle(p.sub(this.p)))
        bv.setBlock(p.x, 0, p.y, this.material);
    for (var xC = -this.r; xC <= this.r; xC++)
      for (var zC = -this.r; zC <= this.r; zC++)
        if (
          Math.hypot(xC, zC) <= this.r + 1e-10
          && this.isInAngle(new Vec2(xC, zC))
        )
          bv.setBlock(this.p.x + xC, 0, this.p.y + zC, this.material);
  }
}

class Ring extends Sector {
  constructor(material, p, r0, r1, from, to) {
    super(material, p, Math.max(r0, r1));
    this.rIn = Math.min(r0, r1);
    this.from = from;
    this.to = to;
  }
  
  build(bv) {
    var dots = this.getBresenham()
      , dotsInner = this.getBresenham(this.rIn);
    for (var p of dots)
      if (this.isInAngle(p.sub(this.p)))
        bv.setBlock(p.x, 0, p.y, this.material);
    for (var p of dotsInner)
      if (this.isInAngle(p.sub(this.p)))
        bv.setBlock(p.x, 0, p.y, this.material);
    for (var xC = -this.r; xC <= this.r; xC++)
      for (var zC = -this.r; zC <= this.r; zC++)
        if (
          Math.hypot(xC, zC) <= this.r + 1e-10
          && Math.hypot(xC, zC) >= this.rIn - 1e-10
          && this.isInAngle(new Vec2(xC, zC))
        )
          bv.setBlock(this.p.x + xC, 0, this.p.y + zC, this.material);
  }
}

exports.VectorGraph = VectorGraph;
exports.Point = Point;
exports.Line = Line;
exports.Face = Face;
exports.Parallelogram = Parallelogram;
exports.Circle = Circle;
exports.Sector = Sector;
exports.Ring = Ring;
