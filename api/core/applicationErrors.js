class ApplicationError extends Error {
  name = null; //T;
  message = null;
  stack = null;
  data = {};

  constructor(error) {
    super('');
    if (error instanceof Array) {
      this.name = error.map((x) => x.name).join(', ');
      this.message = error.map((x) => x.message).join('<br><br>');
      this.stack = error.map((x) => x.stack).join('<br><br>');
    } else {
      this.name = error.name || null; //T;
      this.message = error.message || null;
      this.stack = error.stack || null;
      // eslint-disable-next-line no-unused-vars
      const { name, message, stack, ...destructuredError } = error;
      this.data = { ...destructuredError };
    }
    Object.freeze(this);
  }
}
class ApplicationOptimisticLockError extends Error {
  constructor(message, data = {}) {
    super(message);

    // You can attach relevant information to the error instance
    // (e.g.. the username)

    for (const [key, value] of Object.entries(data)) {
      this[key] = value;
    }
  }

  get name() {
    return this.constructor.name;
  }
}

class ApplicationForeignKeyConstraintError extends Error {
  constructor(message, data = {}) {
    super(message);

    // You can attach relevant information to the error instance
    // (e.g.. the username)

    for (const [key, value] of Object.entries(data)) {
      this[key] = value;
    }
  }

  get name() {
    return this.constructor.name;
  }
}

module.exports = { ApplicationError, ApplicationOptimisticLockError, ApplicationForeignKeyConstraintError };
