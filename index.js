export function chain(target = global, strict = false) {
  return new Chainable(target, strict);
}

export class Chainable extends Function {
  constructor(target, strict) {
    super();

    this.target = target || this;

    // Strict mode requires all properties to be defined in a chain. For
    // example, if a method in the chain returns a falsey value, the whole
    // chain will fail. When strict mode is off, the falsey value will short
    // circuit the chain and return false. Errors in the chain are still
    // catchable with Promise.catch.
    this.strict = strict || false;

    this.proxy = new Proxy(
      /* target */ this, 
      /* handler */ this
    );

    this.reset();

    return this.proxy;
  }

  // Trap for [[Get]] used by operations such as property accessors.
  get(target, property) { 
    // console.log("[[Get]] " + property);

    if (property === "then" ||
        property === "catch" ||
        property === "finally") {
      let chain = this.chain[property].bind(this.chain);

      // We have to reset the chain to allow multiple await calls to be called
      // on the same object. This is the only state that is modified during
      // a chain and .then, .catch, and .finally are always the final calls
      // in the chain.
      this.reset();
      
      return chain;
    }

    // Add the property or function to the chain. If it is a function, 
    // this.apply will be called immediately after and will use the [ context, 
    // callable ] tuple value this promise is returning.
    this.chain = this.chain.then((context) => {
      if (!context || (context && typeof context[property] === "undefined")) {
        if (this.strict) {
          throw new Error(`Property not defined: ${property} (the` +
            ` async-chain may have encountered an unexpected value)`);
        } else {
          return false;
        }
      }
      
      switch (typeof context[property]) {
        case "function":
          return [ context, context[property] ];
          
        default:
        case "boolean":
        case "number":
        case "object":
        case "string":
          return context[property];
      }
    });

    return this.proxy;
  }

  // Trap for [[Call]] used by operations such as function calls.
  apply(target, context, args) {
    // console.log("[[Call]]");

    this.chain = this.chain.then((state) => {
      if (!Array.isArray(state)) {
        // A literal value was returned from [[Get]].
        return state;
      }

      // The context and callee were returned because [[Get]] sent us a 
      // callable.
      let [ context, callee ] = state;
      return callee.apply(context, args);
    });

    return this.proxy;
  }

  reset() {
    // Seed the chain with the current object so the first [[Get]] trap starts
    // by calling methods on this object.
    this.chain = Promise.resolve(this.target);
  }
}