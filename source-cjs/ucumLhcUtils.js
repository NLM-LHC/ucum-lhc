"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UcumLhcUtils = void 0;

var _ucumJsonDefs = require("./ucumJsonDefs.js");

var intUtils_ = _interopRequireWildcard(require("./ucumInternalUtils.js"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * This class provides a single point of access to the LHC UCUM utilities
 *
 * @author Lee Mericle
 *
 */
var Ucum = require('./config.js').Ucum;

var UnitTables = require('./unitTables.js').UnitTables;

var UnitString = require('./unitString.js').UnitString;

/**
 * UCUM external utilities class
 */
class UcumLhcUtils {
  /**
   * Constructor.  This loads the json prefix and unit definitions if
   * they haven't been loaded already and creates itself as a singleton object.
   *
   */
  constructor() {
    if (UnitTables.getInstance().unitsCount() === 0) {
      // Load the prefix and unit objects
      _ucumJsonDefs.ucumJsonDefs.loadJsonDefs();
    } // Get the UnitString parser that will be used with this instance
    // of the LHC Utilities


    this.uStrParser_ = UnitString.getInstance();
  } // end constructor

  /**
   * This method calls the useHTMLInMessages method on the UnitString
   * object.  It should be called by web applications that use
   * these utilities.
   *
   * @param use flag indicating whether or not to use the braces message;
   *  defaults to true
   */


  useHTMLInMessages(use) {
    if (use === undefined) use = true;
    this.uStrParser_.useHTMLInMessages(use);
  }
  /**
   * This method calls the useBraceMsgForEachString method on the UnitString
   * object.  It should be called by web applications where unit
   * strings are validated individually (as opposed to validating a whole
   * file of unit strings).
   *
   * @param use flag indicating whether or not to use the braces message;
   *  defaults to true
   */


  useBraceMsgForEachString(use) {
    if (use === undefined) use = true;
    this.uStrParser_.useBraceMsgForEachString(use);
  }
  /**
   * This method validates a unit string.  It first checks to see if the
   * string passed in is a unit code that is found in the unit codes table.
   * If it is not found it parses the string to see if it resolves to a
   * valid unit string.
   *
   * If a valid unit cannot be found, the string is tested for some common
   * errors, such as missing brackets or a missing multiplication operator.
   * If found, the error is reported in the messages array that is returned.
   *
   * If a valid unit cannot be found and an error cannot be discerned, this
   * may return, if requested, a list of suggested units in the messages
   * array that is returned.  Suggestions are based on matching the expression
   * with unit names and synonyms.
   *
   * @param uStr the string to be validated
   * @param suggest a boolean to indicate whether or not suggestions are
   *  requested for a string that cannot be resolved to a valid unit;
   *  true indicates suggestions are wanted; false indicates they are not,
   *  and is the default if the parameter is not specified;
   * @param valConv a string indicating if this validation request was initiated
   *  by a validation task ('validate') or a conversion task ('convert'),
   *  used only for the demo code, and the default is 'Validator' if the
   *  parameter is not specified;
   * @returns an object with five properties:
   *  'status' will be 'valid' (the uStr is a valid UCUM code), 'invalid'
   *     (the uStr is not a valid UCUM code, and substitutions or
   *     suggestions may or may not be returned, depending on what was
   *     requested and found); or 'error' (an input or programming error
   *     occurred);
   *  'ucumCode' the valid ucum code, which may differ from what was passed
   *    in (e.g., if 'Gauss' is passed in, this will contain 'G') OR null if
   *    the string was flagged as invalid or an error occurred;
   *  'msg' is an array of one or more messages, if the string is invalid or
   *        an error occurred, indicating the problem, or an explanation of a
   *        substitution such as the substitution of 'G' for 'Gauss', or
   *        an empty array if no messages were generated;
   *  'unit' which is null if no unit is found, or a hash for a unit found:
   *    'code' is the unit's ucum code (G in the above example;
   *    'name' is the unit's name (Gauss in the above example); and
   *    'guidance' is the unit's guidance/description data; and
   *  'suggestions' if suggestions were requested and found, this is an array
   *     of one or more hash objects.  Each hash contains three elements:
   *     'msg' which is a message indicating what part of the uStr input
   *        parameter the suggestions are for;
   *     'invalidUnit' which is the unit expression the suggestions are
   *        for; and
   *     'units' which is an array of data for each suggested unit found.
   *        Each array will contain the unit code, the unit name and the
   *        unit guidance (if any).
   *     If no suggestions were requested and found, this property is not
   *     returned.
   */


  validateUnitString(uStr, suggest, valConv) {
    if (suggest === undefined) suggest = false;
    if (valConv === undefined) valConv = 'validate';
    let resp = this.getSpecifiedUnit(uStr, valConv, suggest);
    let theUnit = resp['unit'];
    let retObj = !theUnit ? {
      'ucumCode': null
    } : {
      'ucumCode': resp['origString'],
      'unit': {
        'code': theUnit.csCode_,
        'name': theUnit.name_,
        'guidance': theUnit.guidance_
      }
    };
    retObj.status = resp.status;

    if (resp['suggestions']) {
      retObj['suggestions'] = resp['suggestions'];
    }

    retObj['msg'] = resp['retMsg'];
    return retObj;
  } // end validateUnitString

  /**
   * This method converts one unit to another
   *
   * @param fromUnitCode the unit code/expression/string of the unit to be converted
   * @param fromVal the number of "from" units to be converted to "to" units
   * @param toUnitCode the unit code/expression/string of the unit that the from
   *  field is to be converted to
   * @param suggest a boolean to indicate whether or not suggestions are
   *  requested for a string that cannot be resolved to a valid unit;
   *  true indicates suggestions are wanted; false indicates they are not,
   *  and is the default if the parameter is not specified;
   * @param molecularWeight the molecular weight of the substance in question
   *  when a conversion is being requested from mass to moles and vice versa.
   *  This is required when one of the units represents a value in moles.  It is
   *  ignored if neither unit includes a measurement in moles.
   * @returns a hash with six elements:
   *  'status' that will be: 'succeeded' if the conversion was successfully
   *     calculated; 'failed' if the conversion could not be made, e.g., if
   *     the units are not commensurable; or 'error' if an error occurred;
   *  'toVal' the numeric value indicating the conversion amount, or null
   *     if the conversion failed (e.g., if the units are not commensurable);
   *  'msg' is an array message, if the string is invalid or an error occurred,
   *        indicating the problem, or an explanation of a substitution such as
   *        the substitution of 'G' for 'Gauss', or an empty array if no
   *        messages were generated;
   *  'suggestions' if suggestions were requested and found, this is a hash
   *     that contains at most two elements:
   *     'from' which, if the fromUnitCode input parameter or one or more of
   *       its components could not be found, is an array one or more hash
   *       objects.  Each hash contains three elements:
   *         'msg' which is a message indicating what unit expression the
   *            suggestions are for;
   *         'invalidUnit' which is the unit expression the suggestions
   *            are for; and
   *         'units' which is an array of data for each suggested unit found.
   *            Each array will contain the unit code, the unit name and the
   *            unit guidance (if any).
   *       If no suggestions were found for the fromUnitCode this element
   *       will not be included.
   *     'to' which, if the "to" unit expression or one or more of its
   *       components could not be found, is an array one or more hash objects.  Each hash
   *       contains three elements:
   *         'msg' which is a message indicating what toUnitCode input
   *            parameter the suggestions are for;
   *         'invalidUnit' which is the unit expression the suggestions
   *            are for; and
   *         'units' which is an array of data for each suggested unit found.
   *            Each array will contain the unit code, the unit name and the
   *            unit guidance (if any).
   *       If no suggestions were found for the toUnitCode this element
   *       will not be included.
   *    No 'suggestions' element will be included in the returned hash
   *    object if none were found, whether or not they were requested.
   *  'fromUnit' the unit object for the fromUnitCode passed in; returned
   *     in case it's needed for additional data from the object; and
   *  'toUnit' the unit object for the toUnitCode passed in; returned
   *     in case it's needed for additional data from the object.
   */


  convertUnitTo(fromUnitCode, fromVal, toUnitCode, suggest, molecularWeight) {
    if (suggest === undefined) suggest = false;
    if (molecularWeight === undefined) molecularWeight = null;
    let returnObj = {
      'status': 'failed',
      'toVal': null,
      'msg': []
    };

    if (fromUnitCode) {
      fromUnitCode = fromUnitCode.trim();
    }

    if (!fromUnitCode || fromUnitCode == '') {
      returnObj['status'] = 'error';
      returnObj['msg'].push('No "from" unit expression specified.');
    }

    this._checkFromVal(fromVal, returnObj);

    if (toUnitCode) {
      toUnitCode = toUnitCode.trim();
    }

    if (!toUnitCode || toUnitCode == '') {
      returnObj['status'] = 'error';
      returnObj['msg'].push('No "to" unit expression specified.');
    }

    if (returnObj['status'] !== 'error') {
      try {
        let fromUnit = null;
        let parseResp = this.getSpecifiedUnit(fromUnitCode, 'convert', suggest);
        fromUnit = parseResp['unit'];
        if (parseResp['retMsg']) returnObj['msg'] = returnObj['msg'].concat(parseResp['retMsg']);

        if (parseResp['suggestions']) {
          returnObj['suggestions'] = {};
          returnObj['suggestions']['from'] = parseResp['suggestions'];
        }

        if (!fromUnit) {
          returnObj['msg'].push(`Unable to find a unit for ${fromUnitCode}, ` + `so no conversion could be performed.`);
        }

        let toUnit = null;
        parseResp = this.getSpecifiedUnit(toUnitCode, 'convert', suggest);
        toUnit = parseResp['unit'];
        if (parseResp['retMsg']) returnObj['msg'] = returnObj['msg'].concat(parseResp['retMsg']);

        if (parseResp['suggestions']) {
          if (!returnObj['suggestions']) returnObj['suggestions'] = {};
          returnObj['suggestions']['to'] = parseResp['suggestions'];
        }

        if (!toUnit) {
          returnObj['msg'].push(`Unable to find a unit for ${toUnitCode}, ` + `so no conversion could be performed.`);
        }

        if (fromUnit && toUnit) {
          try {
            // if no molecular weight was specified perform a normal conversion
            if (!molecularWeight) {
              returnObj['toVal'] = toUnit.convertFrom(fromVal, fromUnit);
            } else {
              if (fromUnit.moleExp_ !== 0 && toUnit.moleExp_ !== 0) {
                throw new Error('A molecular weight was specified ' + 'but a mass <-> mole conversion cannot be executed for two ' + 'mole-based units.  No conversion was attempted.');
              }

              if (fromUnit.moleExp_ === 0 && toUnit.moleExp_ === 0) {
                throw new Error('A molecular weight was specified ' + 'but a mass <-> mole conversion cannot be executed when ' + 'neither unit is mole-based.  No conversion was attempted.');
              }

              if (!fromUnit.isMoleMassCommensurable(toUnit)) {
                throw new Error(`Sorry.  ${fromUnitCode} cannot be ` + `converted to ${toUnitCode}.`);
              } // if the "from" unit is a mole-based unit, assume a mole to mass
              // request


              if (fromUnit.moleExp_ !== 0) {
                returnObj['toVal'] = fromUnit.convertMolToMass(fromVal, toUnit, molecularWeight);
              } // else the "to" unit must be the mole-based unit, so assume a
              // mass to mole request
              else {
                  returnObj['toVal'] = fromUnit.convertMassToMol(fromVal, toUnit, molecularWeight);
                }
            } // end if a molecular weight was specified
            // if an error hasn't been thrown - either from convertFrom or here,
            // set the return object to show success


            returnObj['status'] = 'succeeded';
            returnObj['fromUnit'] = fromUnit;
            returnObj['toUnit'] = toUnit;
          } catch (err) {
            returnObj['status'] = 'failed';
            returnObj['msg'].push(err.message);
          }
        } // end if we have the from and to units

      } catch (err) {
        if (err.message == Ucum.needMoleWeightMsg_) returnObj['status'] = 'failed';else returnObj['status'] = 'error';
        returnObj['msg'].push(err.message);
      }
    }

    return returnObj;
  } // end convertUnitTo

  /**
   *  Converts the given unit string into its base units, their exponents, and
   *  a magnitude, and returns that data.
   * @param fromUnit the unit string to be converted to base units information
   * @param fromVal the number of "from" units to be converted
   * @returns an object with the properties:
   *  'status' indicates whether the result succeeded.  The value will be one of:
   *    'succeeded':  the conversion was successfully calculated (which can be
   *      true even if it was already in base units);
   *    'invalid':  fromUnit is not a valid UCUM code;
   *    'failed':  the conversion could not be made (e.g., if it is an "arbitrary" unit);
   *    'error':  if an error occurred (an input or programming error)
   *  'msg': an array of messages (possibly empty) if the string is invalid or
   *        an error occurred, indicating the problem, or a suggestion of a
   *        substitution such as the substitution of 'G' for 'Gauss', or
   *        an empty array if no messages were generated.  There can also be a
   *        message that is just informational or warning.
   *  'magnitude': the new value when fromVal units of fromUnits is expressed in the base units.
   *  'fromUnitIsSpecial': whether the input unit fromUnit is a "special unit"
   *         as defined in UCUM.  This means there is some function applied to convert
   *         between fromUnit and the base units, so the returned magnitude is likely not
   *         useful as a scale factor for other conversions (i.e., it only has validity
   *         and usefulness for the input values that produced it).
   *  'unitToExp': a map of base units in fromUnit to their exponent
   */


  convertToBaseUnits(fromUnit, fromVal) {
    let retObj = {};

    this._checkFromVal(fromVal, retObj);

    if (!retObj.status) {
      // could be set to 'error' by _checkFromVal
      let inputUnitLookup = this.getSpecifiedUnit(fromUnit, 'validate');
      retObj = {
        status: inputUnitLookup.status == 'valid' ? 'succeeded' : inputUnitLookup.status
      };
      let unit = inputUnitLookup.unit;
      retObj.msg = inputUnitLookup.retMsg || [];

      if (!unit) {
        if (inputUnitLookup.retMsg?.length == 0) retObj.msg.push('Could not find unit information for ' + fromUnit);
      } else if (unit.isArbitrary_) {
        retObj.msg.push('Arbitrary units cannot be converted to base units or other units.');
        retObj.status = 'failed';
      } else if (retObj.status == 'succeeded') {
        let unitToExp = {};
        let dimVec = unit.dim_?.dimVec_;
        let baseUnitString = '1';

        if (dimVec) {
          let dimVecIndexToBaseUnit = UnitTables.getInstance().dimVecIndexToBaseUnit_;

          for (let i = 0, len = dimVec.length; i < len; ++i) {
            let exp = dimVec[i];

            if (exp) {
              unitToExp[dimVecIndexToBaseUnit[i]] = exp;
              baseUnitString += '.' + dimVecIndexToBaseUnit[i] + exp;
            }
          }
        } // The unit might have a conversion function, which has to be applied; we
        // cannot just assume unit_.magnitude_ is the magnitude in base units.


        let retUnitLookup = this.getSpecifiedUnit(baseUnitString, 'validate'); // There should not be any error in retUnitLookup, unless there is a bug.

        let retUnit = retUnitLookup.unit;

        if (retUnitLookup.status !== 'valid') {
          retObj.msg.push('Unable construct base unit string; tried ' + baseUnitString);
          retObj.status = 'error';
        } else {
          try {
            retObj.magnitude = retUnit.convertFrom(fromVal, unit);
          } catch (e) {
            retObj.msg.push(e.toString());
            retObj.status = 'error';
          }

          if (retObj.status == 'succeeded') {
            retObj.unitToExp = unitToExp;
            retObj.fromUnitIsSpecial = unit.isSpecial_;
          }
        }
      }
    }

    return retObj;
  }
  /**
   *  Checks the given value as to whether it is suitable as a "from" value in a
   *  unit conversion.  If it is not, the responseObj will have its status set
   *  to 'error' and a message added.
   * @param fromVal The value to check
   * @param responseObj the object that will be updated if the value is not
   *  usable.
   */


  _checkFromVal(fromVal, responseObj) {
    if (fromVal === null || isNaN(fromVal) || typeof fromVal !== 'number' && !intUtils_.isNumericString(fromVal)) {
      responseObj.status = 'error';
      if (!responseObj.msg) responseObj.msg = [];
      responseObj.msg.push('No "from" value, or an invalid "from" value, ' + 'was specified.');
    }
  }
  /**
   * This method accepts a term and looks for units that include it as
   * a synonym - or that include the term in its name.
   *
   * @param theSyn the term to search for
   * @returns a hash with up to three elements:
   *  'status' contains the status of the request, which can be 'error',
   *    'failed' or succeeded';
   *  'msg' which contains a message for an error or if no units were found; and
   *  'units' which is an array that contains one hash for each unit found:
   *    'code' is the unit's csCode_
   *    'name' is the unit's name_
   *    'guidance' is the unit's guidance_
   *
   */


  checkSynonyms(theSyn) {
    let retObj = {};

    if (theSyn === undefined || theSyn === null) {
      retObj['status'] = 'error';
      retObj['msg'] = 'No term specified for synonym search.';
    } else {
      retObj = intUtils_.getSynonyms(theSyn);
    } // end if a search synonym was supplied


    return retObj;
  } // end checkSynonyms

  /**
   * This method parses a unit string to get (or try to get) the unit
   * represented by the string.  It returns an error message if no string was specified
   * or if any errors were encountered trying to get the unit.
   *
   * @param uName the expression/string representing the unit
   * @param valConv indicates what type of request this is for - a request to
   *  validate (pass in 'validate') or a request to convert (pass in 'convert')
   * @param suggest a boolean to indicate whether or not suggestions are
   *  requested for a string that cannot be resolved to a valid unit;
   *  true indicates suggestions are wanted; false indicates they are not,
   *  and is the default if the parameter is not specified;
   * @returns a hash containing:
   *   'status' will be 'valid' (uName is a valid UCUM code), 'invalid'
   *     (the uStr is not a valid UCUM code, and substitutions or
   *     suggestions may or may not be returned, depending on what was
   *     requested and found); or 'error' (an input or programming error
   *     occurred);
   *   'unit' the unit object (or null if there were problems creating the
   *     unit);
   *   'origString' the possibly updated unit string passed in;
   *   'retMsg' an array of user messages (informational, error or warning) if
   *     any were generated (IF any were generated, otherwise will be an
   *     empty array); and
   *   'suggestions' is an array of 1 or more hash objects.  Each hash
   *     contains three elements:
   *       'msg' which is a message indicating what unit expression the
   *          suggestions are for;
   *       'invalidUnit' which is the unit expression the suggestions are
   *          for; and
   *       'units' which is an array of data for each suggested unit found.
   *          Each array will contain the unit code, the unit name and the
   *          unit guidance (if any).
   *   The return hash will not contain a suggestions array if a valid unit
   *   was found or if suggestions were not requested and found.
   */


  getSpecifiedUnit(uName, valConv, suggest) {
    if (suggest === undefined) suggest = false;
    let retObj = {};
    retObj['retMsg'] = [];

    if (!uName) {
      retObj['retMsg'].push('No unit string specified.');
    } else {
      let utab = UnitTables.getInstance();
      uName = uName.trim(); // go ahead and just try using the name as the code.  This may or may not
      // work, but if it does, it cuts out a lot of parsing.

      let theUnit = utab.getUnitByCode(uName); // If we found it, set the returned unit string to what was passed in;
      // otherwise try parsing as a unit string

      if (theUnit) {
        retObj['unit'] = theUnit;
        retObj['origString'] = uName;
      } else {
        try {
          let resp = this.uStrParser_.parseString(uName, valConv, suggest);
          retObj['unit'] = resp[0];
          retObj['origString'] = resp[1];
          if (resp[2]) retObj['retMsg'] = resp[2];
          retObj['suggestions'] = resp[3];
        } catch (err) {
          console.log(`Unit requested for unit string ${uName}.` + 'request unsuccessful; error thrown = ' + err.message);
          retObj['retMsg'].unshift(`${uName} is not a valid unit.  ` + `${err.message}`);
        }
      } // end if the unit was not found as a unit name

    } // end if a unit expression was specified
    // Set the status field


    if (!retObj.unit) {
      // No unit was found; check whether origString has a value
      retObj.status = !retObj.origString ? 'error' : 'invalid';
    } else {
      // Check whether substitutions were made to the unit string in order to
      // find the unit
      retObj.status = retObj.origString === uName ? 'valid' : 'invalid';
    }

    return retObj;
  } // end getSpecifiedUnit

  /**
   * This method retrieves a list of units commensurable, i.e., that can be
   * converted from and to, a specified unit.  Returns an error if the "from"
   * unit cannot be found.
   *
   * @param fromName the name/unit string of the "from" unit
   * @returns an array containing two elements;
   *   first element is the list of commensurable units if any were found
   *   second element is an error message if the "from" unit is not found
   */


  commensurablesList(fromName) {
    let retMsg = [];
    let commUnits = null;
    let parseResp = this.getSpecifiedUnit(fromName, 'validate', false);
    let fromUnit = parseResp['unit'];
    if (parseResp['retMsg'].length > 0) retMsg = parseResp['retMsg'];

    if (!fromUnit) {
      retMsg.push(`Could not find unit ${fromName}.`);
    } else {
      let dimVec = null;
      let fromDim = fromUnit.getProperty('dim_');

      if (!fromDim) {
        retMsg.push('No commensurable units were found for ' + fromName);
      } else {
        try {
          dimVec = fromDim.getProperty('dimVec_');
        } catch (err) {
          retMsg.push(err.message);
          if (err.message === "Dimension does not have requested property(dimVec_)") dimVec = null;
        }

        if (dimVec) {
          let utab = UnitTables.getInstance();
          commUnits = utab.getUnitsByDimension(dimVec);
        }
      } // end if the from unit has a dimension vector

    } // end if we found a "from" unit


    return [commUnits, retMsg];
  } // end commensurablesList


} // end UcumLhcUtils class

/**
 *  This function exists ONLY until the original UcumLhcUtils constructor
 *  is called for the first time.  It's defined here in case getInstance
 *  is called before the constructor.   This calls the constructor.
 *
 *  The constructor redefines the getInstance function to return the
 *  singleton UcumLhcUtils object.  This is based on the UnitTables singleton
 *  implementation; see more detail in the UnitTables constructor description.
 *
 *  NO LONGER TRUE - not implemented as a singleton.  This method retained to
 *  avoid problems with calls to it that exist throughout the code.
 *
 *  @return the (formerly singleton) UcumLhcUtils object.
 */


exports.UcumLhcUtils = UcumLhcUtils;

UcumLhcUtils.getInstance = function () {
  return new UcumLhcUtils();
};
//# sourceMappingURL=ucumLhcUtils.js.map
