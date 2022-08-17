class Result {
  constructor(data, totalCount = null) {
    this.data = data;

    if (totalCount != null) {
      this.totalCount = totalCount;
    }

    Object.freeze(this);
  }

  static ok(data, totalCount) {
    return new Result(data, totalCount);
  }

  
  // static fail(errors, warnings) {
  //   return new Result(false, null, 0, errors, warnings, null);
  // }
}

module.exports = Result;
