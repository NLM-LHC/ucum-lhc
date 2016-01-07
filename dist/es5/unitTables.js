'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * This class manages Hashtables that provide references to
 * defined units.
 *
 * @author Lee Mericle, based on java version by Gunther Schadow
 *
 */

//import * as Ucum from "config.js" ;

var UnitTables = (function () {

  /**
   * Constructor.  This creates the empty unit tables (hashes) once. After the
   * tables are created, it redefines this constructor to throw an error
   * stating that the constructor is no longer available and that the
   * getInstance function must be used.   Here's a description of the first
   * and then all subsequent calls to this constructor.
   *
   * First call to constructor:
   * 1. creates  OBJECT1
   * 2. initializes attributes of OBJECT1
   * 3. stores reference to OBJECT1.prototype in holdthis local variable
   * 4. redefines OBJECT1 as a function that throws an error
   * 5. defines the getInstance function (which is also defined outside of
   *    the class definition - see below).
   *
   * All subsequent calls to constructor:
   * 1. throw error message referring to getInstance
   * 2. call getInstance, returns this - which is OBJECT1.
   */

  function UnitTables() {
    _classCallCheck(this, UnitTables);

    /**
     * Tracks units by name
     * @type hash - key is the name;
     *              value is the reference to the Unit object
     */
    this.unitNames_ = {};

    /**
     * Tracks units by code using case-sensitive or case-insensitive -
     * whichever we're currently using.  See Ucum.caseSensitive_ in
     * config.js
     *
     * @type hash - key is the code;
     *              value is the reference to the Unit object
     */
    this.unitCodes_ = {};

    /**
     * Tracks units by Dimension vector
     *
     * @type hash - key is the dimension vector;
     *              value is the reference to the Unit object
     * I don't think we want this.
     */
    //this.unitDims_ = {};

    // Make this a singleton - from mrme44 May 18 comment on
    // on GitHub Gist page of SanderLi/Singleton.js.  Modified
    // for this class.

    var holdThis = UnitTables.prototype;
    UnitTables = function () {
      throw "UnitTables is a Singleton.  " + 'Use UnitTables.getInstance() instead.';
    };
    UnitTables.prototype = holdThis;
    UnitTables.getInstance = function () {
      return this;
    };
  }

  /**
   * Clears all the atom tables.  Not sure if we really want this so
   * if there's no crying need for it, let's dump it.
   *
   * @param theUnit the unit to be added
   * @returns nothing
   * @throws an error if any of the tables already contain the unit
   *         based on the key value
   */

  _createClass(UnitTables, [{
    key: 'resetDoWeWantThis',
    value: function resetDoWeWantThis() {}
    /* for now, do nothing
    this.unitNames_ = {} ;
    this.unitCodes_ = {} ;
    this.unitDims_ = {} ;
    */

    /**
     * Adds a Unit object to the three tables (or however many for
     * which the unit has key values)
     *
     * @param theUnit the unit to be added
     * @returns nothing
     * @throws an error if any of the tables already contain the unit
     *         based on the key value
     */

  }, {
    key: 'addUnit',
    value: function addUnit(theUnit) {
      var uName = theUnit['name_'];
      if (uName) {
        this.addUnitName(theUnit);
      }

      var uCode = null;
      if (Ucum.caseSensitive_ == true) uCode = theUnit['csCode_'];else uCode = theUnit['ciCode_'];
      if (uCode) {
        this.addUnitCode(theUnit);
      }
    } // end addUnit

    /**
     * Adds a Unit object to the unitNames_ table.
     *
     * @param theUnit the unit to be added
     * @returns nothing
     * @throws an error if table already contains a unit with the name,
     *         or if the unit has no name
     */

  }, {
    key: 'addUnitName',
    value: function addUnitName(theUnit) {

      var uName = theUnit['name_'];

      if (uName) {
        if (this.unitNames_[uName]) throw 'UnitAtomsTable.addUnitName called, already contains entry for ' + ('unit with name = ' + uName);else this.unitNames_[uName] = theUnit;
      } else throw 'UnitAtomsTable.addUnitName called for a unit with no name.';
    } // end addUnitName

    /**
     * Adds a Unit object to the unitCodes_ table.
     *
     * @param theUnit the unit to be added
     * @returns nothing
     * @throws an error if the table already contains a unit with the code,
     *         or if the unit has no code of the type currently in use
     */

  }, {
    key: 'addUnitCode',
    value: function addUnitCode(theUnit) {

      var uCode = null;
      if (Ucum.caseSensitive_ == true) uCode = theUnit['csCode_'];else uCode = theUnit['ciCode_'];

      if (uCode) {
        if (this.unitCodes_[uCode]) throw 'UnitAtomsTable.addUnitCode called, already contains entry for ' + ('unit with code = ' + uCode);else this.unitCodes_[uCode] = theUnit;
      } else throw 'UnitAtomsTable.addUnitCode called for unit that has no code.';
    } // end addUnitCode

    /**
     *  Returns a unit object based on the unit's name
     *
     *  @param name the name of the unit to be returned
     *  @returns the unit object or null if it is not found
     */

  }, {
    key: 'getUnitByName',
    value: function getUnitByName(uName) {
      var retUnit = null;
      if (uName) {
        retUnit = this.unitNames_[uName];
      }
      return retUnit;
    }

    /**
     *  Returns a unit object based on the unit's code
     *
     *  @param name the name of the unit to be returned
     *  @returns the unit object or null if it is not found
     */

  }, {
    key: 'getUnitByCode',
    value: function getUnitByCode(uCode) {
      var retUnit = null;
      if (uCode) {
        retUnit = this.unitCodes_[uCode];
      }
      return retUnit;
    }

    /**
     *  Returns a unit object based on the unit's dimension
     *
     *  @param name the name of the unit to be returned
     *  @returns the unit object or null if it is not found
     */
    /*
    getUnitByDim(uDim) {
      let retUnit = null ;
      if (uDim) {
        retUnit = this.unitDims_[uDim] ;
      }
      return retUnit ;
    }
    */

    /**
     * Gets a list of all unit names in the Unit tables
     *
     * @returns an array of the unit names
     */

  }, {
    key: 'getAllUnitNames',
    value: function getAllUnitNames() {
      return Object.keys(this.unitNames_);
    } // end getAllUnitNames

  }]);

  return UnitTables;
})(); // end UnitTables

/**
 *  This function exists ONLY until the original UnitTables constructor
 *  is called for the first time.  It's defined here in case getInstance
 *  is called before the constructor.   This calls the constructor.
 *
 *  The constructor redefines the getInstance function to return the
 *  singleton UnitTables object.  See more detail in the constructor
 *  description.
 *
 *  @returns the singleton UnitTables object.
 */

UnitTables.getInstance = function () {
  return new UnitTables();
};
