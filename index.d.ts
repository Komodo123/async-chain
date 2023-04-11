export function chain(target = global, strict = false): Chainable;

class Chainable<T> extends Function {
  constructor(target?: Object | Function, strict?: boolean, finalize?: boolean): ProxyHandler;

  then<X, Y>(
    onfulfilled?: ((value: T) => X | PromiseLike<X> | null | undefined), 
    onrejected?: ((reason: any) => Y | PromiseLike<Y> | null | undefined)
  ): Promise<any>;

  catch<X>(
    onrejected?: ((reason: any) => X | PromiseLike<X> | null | undefined)
  ): Promise<any>;
}