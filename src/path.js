class LineGenLine {
  constructor(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }
}

class LineGenPath {
  constructor() {
    this.elements = [];
    this.cursor = {
      x: 0,
      y: 0
    };
    this.block = "minecraft:air";
  }

  moveTo(x, y) {
    this.cursor.x = Number(x);
    this.cursor.y = Number(y);
  }

  lineTo(x, y) {
    x = Number(x);
    y = Number(y);
    this.elements.push(
      new LineGenLine(this.cursor.x, this.cursor.y, x, y)
    );
    this.cursor.x = x;
    this.cursor.y = y;
  }

  arcTo(x1, y1, x2, y2, radius) {

  }

  fillRect() {

  }

  strokeRect() {

  }
}