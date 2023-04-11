export function chain(target = global, strict = false);

class Chainable extends Function {
  constructor(target?: Object | Function, strict?: boolean, finalize?: boolean);

  then<X, Y>(
    onfulfilled?: ((value: void) => X | PromiseLike<X> | null | undefined), 
    onrejected?: ((reason: any) => Y | PromiseLike<Y> | null | undefined)
  ): Promise;

  catch<X>(
    onrejected?: ((reason: any) => X | PromiseLike<X> | null | undefined)
  ): Promise;
}