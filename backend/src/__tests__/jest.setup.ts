// Import Jest types
export {};
declare global {
  namespace NodeJS {
    interface Global {
      describe: typeof describe;
      it: typeof it;
      expect: typeof expect;
    }
  }
}

// Make these available globally
const jestGlobal = global as any;
jestGlobal.describe = describe;
jestGlobal.it = it;
jestGlobal.expect = expect;
