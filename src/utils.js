function aceil(x) {
  return x > 0 ? Math.ceil(x) : Math.floor(x);
}

function afloor(x) {
  return x > 0 ? Math.floor(x) : Math.ceil(x);
}

exports.aceil = aceil;
exports.afloor = afloor;
