class Xorshift32 {
  constructor(seed = 1) {
    this.state = seed & 0xFFFFFFFF;
  }

  nextInt() {
    this.state ^= (this.state << 13) & 0xFFFFFFFF
    this.state ^= (this.state >> 17)
    this.state ^= (this.state << 5) & 0xFFFFFFFF
    return this.state
  }

  nextFloat() {
    return (this.nextInt() >>> 0) / 0xFFFFFFFF
  }
}

exports.Xorshift32 = Xorshift32;