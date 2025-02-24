'use strict'

/**
 * The custom `sort` method for
 * for the [`css-mqpacker`](https://www.npmjs.com/package/css-mqpacker) or
 * [`pleeease`](https://www.npmjs.com/package/pleeease) which using `css-mqpacker`
 * or, perhaps, something else ))
 *
 * @module sort-css-media-queries
 * @author Oleg Dutchenko <dutchenko.o.wezom@gmail.com>
 * @version 1.5.0
 */

// ----------------------------------------
// Private
// ----------------------------------------

const minMaxWidth = /(!?\(\s*min(-device-)?-width)(.|\n)+\(\s*max(-device)?-width/i
const minWidth = /\(\s*min(-device)?-width/i
const maxMinWidth = /(!?\(\s*max(-device)?-width)(.|\n)+\(\s*min(-device)?-width/i
const maxWidth = /\(\s*max(-device)?-width/i

const isMinWidth = _testQuery(minMaxWidth, maxMinWidth, minWidth)
const isMaxWidth = _testQuery(maxMinWidth, minMaxWidth, maxWidth)

const minMaxHeight = /(!?\(\s*min(-device)?-height)(.|\n)+\(\s*max(-device)?-height/i
const minHeight = /\(\s*min(-device)?-height/i
const maxMinHeight = /(!?\(\s*max(-device)?-height)(.|\n)+\(\s*min(-device)?-height/i
const maxHeight = /\(\s*max(-device)?-height/i

const isMinHeight = _testQuery(minMaxHeight, maxMinHeight, minHeight)
const isMaxHeight = _testQuery(maxMinHeight, minMaxHeight, maxHeight)

const isPrint = /print/i
const isPrintOnly = /^print$/i

const maxValue = Number.MAX_VALUE

/**
 * Obtain the length of the media request in pixels.
 * Copy from original source `function inspectLength (length)`
 * {@link https://github.com/hail2u/node-css-mqpacker/blob/master/index.js#L58}
 * @private
 * @param {string} length
 * @return {number}
 */
function _getQueryLength (length) {
  length = /(-?\d*\.?\d+)(ch|em|ex|px|rem)/.exec(length)

  if (length === null) {
    return maxValue
  }

  let number = length[1]
  const unit = length[2]

  switch (unit) {
    case 'ch':
      number = parseFloat(number) * 8.8984375
      break

    case 'em':
    case 'rem':
      number = parseFloat(number) * 16
      break

    case 'ex':
      number = parseFloat(number) * 8.296875
      break

    case 'px':
      number = parseFloat(number)
      break
  }

  return +number
}

/**
 * Wrapper for creating test functions
 * @private
 * @param {RegExp} doubleTestTrue
 * @param {RegExp} doubleTestFalse
 * @param {RegExp} singleTest
 * @return {Function}
 */
function _testQuery (doubleTestTrue, doubleTestFalse, singleTest) {
  /**
   * @param {string} query
   * @return {boolean}
   */
  return function (query) {
    if (doubleTestTrue.test(query)) {
      return true
    } else if (doubleTestFalse.test(query)) {
      return false
    }
    return singleTest.test(query)
  }
}

/**
 * @private
 * @param {string} a
 * @param {string} b
 * @return {number|null}
 */
function _testIsPrint (a, b) {
  const isPrintA = isPrint.test(a)
  const isPrintOnlyA = isPrintOnly.test(a)

  const isPrintB = isPrint.test(b)
  const isPrintOnlyB = isPrintOnly.test(b)

  if (isPrintA && isPrintB) {
    if (!isPrintOnlyA && isPrintOnlyB) {
      return 1
    }
    if (isPrintOnlyA && !isPrintOnlyB) {
      return -1
    }
    return a.localeCompare(b)
  }
  if (isPrintA) {
    return 1
  }
  if (isPrintB) {
    return -1
  }

  return null
}

// ----------------------------------------
// Public
// ----------------------------------------

/**
 * Sorting an array with media queries
 * according to the mobile-first methodology.
 * @param {string} a
 * @param {string} b
 * @return {number} 1 / 0 / -1
 */
function sortCSSmq (a, b) {
  const testIsPrint = _testIsPrint(a, b)
  if (testIsPrint !== null) {
    return testIsPrint
  }

  const minA = isMinWidth(a) || isMinHeight(a)
  const maxA = isMaxWidth(a) || isMaxHeight(a)

  const minB = isMinWidth(b) || isMinHeight(b)
  const maxB = isMaxWidth(b) || isMaxHeight(b)

  if (minA && maxB) {
    return -1
  }
  if (maxA && minB) {
    return 1
  }

  let lengthA = _getQueryLength(a)
  let lengthB = _getQueryLength(b)

  if (lengthA === maxValue && lengthB === maxValue) {
    return a.localeCompare(b)
  } else if (lengthA === maxValue) {
    return -1
  } else if (lengthB === maxValue) {
    return 1
  }

  if (lengthA > lengthB) {
    if (maxA) {
      return -1
    }
    return 1
  }

  if (lengthA < lengthB) {
    if (maxA) {
      return 1
    }
    return -1
  }

  return a.localeCompare(b)
}

/**
 * Sorting an array with media queries
 * according to the desktop-first methodology.
 * @param {string} a
 * @param {string} b
 * @return {number} 1 / 0 / -1
 */
sortCSSmq.desktopFirst = function (a, b) {
  const testIsPrint = _testIsPrint(a, b)
  if (testIsPrint !== null) {
    return testIsPrint
  }

  const minA = isMinWidth(a) || isMinHeight(a)
  const maxA = isMaxWidth(a) || isMaxHeight(a)

  const minB = isMinWidth(b) || isMinHeight(b)
  const maxB = isMaxWidth(b) || isMaxHeight(b)

  if (minA && maxB) {
    return 1
  }
  if (maxA && minB) {
    return -1
  }

  const lengthA = _getQueryLength(a)
  const lengthB = _getQueryLength(b)

  if (lengthA === maxValue && lengthB === maxValue) {
    return a.localeCompare(b)
  } else if (lengthA === maxValue) {
    return 1
  } else if (lengthB === maxValue) {
    return -1
  }

  if (lengthA > lengthB) {
    if (maxA) {
      return -1
    }
    return 1
  }

  if (lengthA < lengthB) {
    if (maxA) {
      return 1
    }
    return -1
  }

  return -(a.localeCompare(b))
}

// ----------------------------------------
// Exports
// ----------------------------------------

module.exports = sortCSSmq
