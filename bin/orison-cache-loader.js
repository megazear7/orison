import fs from 'fs';
import path from 'path';
import fileWalker from './file-walker.js';
import camelCase from 'camelcase';

export default class OrisonCacheLoader {
  constructor({ loaderPath, initialLoaders } = { }) {
    this._caches = { };
    this._loaders = { };
    this._getters = { };

    if (loaderPath && fs.existsSync(loaderPath)) {
      fileWalker(loaderPath,
        file => {
          this.addLoader(camelCase(path.parse(file).name), require(file).default);
        },
        directory => {
        }
      );
    }

    initialLoaders.forEach(loader => this.addLoader(loader.name, loader.loader));
  }

  addLoader(name, loader) {
    this._caches[name] = [ ];

    this._loaders[name] = loader;

    this._getters[name] = args => {
      let value = undefined;

      this._caches[name].forEach(entry => {
        if (objectTester(entry.key, args)) {
          value = entry.value;
        }
      });

      return value;
    };

    this[name] = (...args) => {
      let cachedResponse = this._getters[name](args);
      if (cachedResponse) {
        return cachedResponse;
      } else {
        let response = this._loaders[name](...args);
        this._caches[name].push({ key: args, value: response});
        return response;
      }
    };
  }
}

/*
** @param a, b        - values (Object, RegExp, Date, etc.)
** @returns {boolean} - true if a and b are the object or same primitive value or
**                      have the same properties with the same values
*/
function objectTester(a, b) {

  // If a and b reference the same value, return true
  if (a === b) return true;

  // If a and b aren't the same type, return false
  if (typeof a != typeof b) return false;

  // Already know types are the same, so if type is number
  // and both NaN, return true
  if (typeof a == 'number' && isNaN(a) && isNaN(b)) return true;

  // Get internal [[Class]]
  var aClass = getClass(a);
  var bClass = getClass(b)

  // Return false if not same class
  if (aClass != bClass) return false;

  // If they're Boolean, String or Number objects, check values
  if (aClass == '[object Boolean]' || aClass == '[object String]' || aClass == '[object Number]') {
    if (a.valueOf() != b.valueOf()) return false;
  }

  // If they're RegExps, Dates or Error objects, check stringified values
  if (aClass == '[object RegExp]' || aClass == '[object Date]' || aClass == '[object Error]') {
    if (a.toString() != b.toString()) return false;
  }

  // For functions, check stringigied values are the same
  // Almost impossible to be equal if a and b aren't trivial
  // and are different functions
  if (aClass == '[object Function]' && a.toString() != b.toString()) return false;

  // For all objects, (including Objects, Functions, Arrays and host objects),
  // check the properties
  var aKeys = Object.keys(a);
  var bKeys = Object.keys(b);

  // If they don't have the same number of keys, return false
  if (aKeys.length != bKeys.length) return false;

  // Check they have the same keys
  if (!aKeys.every(function(key){return b.hasOwnProperty(key)})) return false;

  // Check key values - uses ES5 Object.keys
  return aKeys.every(function(key){
    return objectTester(a[key], b[key])
  });
  return false;
}

function getClass(obj) {
  return Object.prototype.toString.call(obj);
}
