var module = module || {},
    window = window || {},
    jQuery = jQuery || {},
    tableau = tableau || {},
    wdcw = window.wdcw || {},
    wdcFields = window.wdcFields || {};

module.exports = function($, tableau, wdcw) {

  /**
   * Run during initialization of the web data connector.
   *
   * @param {string} phase
   *   The initialization phase. This can be one of:
   *   - tableau.phaseEnum.interactivePhase: Indicates when the connector is
   *     being initialized with a user interface suitable for an end-user to
   *     enter connection configuration details.
   *   - tableau.phaseEnum.gatherDataPhase: Indicates when the connector is
   *     being initialized in the background for the sole purpose of collecting
   *     data.
   *   - tableau.phaseEnum.authPhase: Indicates when the connector is being
   *     accessed in a stripped down context for the sole purpose of refreshing
   *     an OAuth authentication token.
   * @param {function} setUpComplete
   *   A callback function that you must call when all setup tasks have been
   *   performed.
   */
  wdcw.setup = function setup(phase, setUpComplete) {
    // You may need to perform set up or other initialization tasks at various
    // points in the data connector flow. You can do so here.
    switch (phase) {
      case tableau.phaseEnum.interactivePhase:
        // Perform set up tasks that relate to when the user will be prompted to
        // enter information interactively.
        break;

      case tableau.phaseEnum.gatherDataPhase:
        // Perform set up tasks that should happen when Tableau is attempting to
        // retrieve data from your connector (the user is not prompted for any
        // information in this phase.
        break;

      case tableau.phaseEnum.authPhase:
        // Perform set up tasks that should happen when Tableau is attempting to
        // refresh OAuth authentication tokens.
        break;
    }

    // Always register when initialization tasks are complete by calling this.
    // This can be especially useful when initialization tasks are asynchronous
    // in nature.
    setUpComplete();
  };

  /**
   * Run when the web data connector is being unloaded. Useful if you need
   * custom logic to clean up resources or perform other shutdown tasks.
   *
   * @param {function} tearDownComplete
   *   A callback function that you must call when all shutdown tasks have been
   *   performed.
   */
  wdcw.teardown = function teardown(tearDownComplete) {
    // Once shutdown tasks are complete, call this. Particularly useful if your
    // clean-up tasks are asynchronous in nature.
    tearDownComplete();
  };

  /**
   * Primary method called when Tableau is asking for the column headers that
   * this web data connector provides. Takes a single callable argument that you
   * should call with the headers you've retrieved.
   *
   * @param {function(Array<{name, type, incrementalRefresh}>)} registerHeaders
   *   A callback function that takes an array of objects as its sole argument.
   *   For example, you might call the callback in the following way:
   *   registerHeaders([
   *     {name: 'Boolean Column', type: 'bool'},
   *     {name: 'Date Column', type: 'date'},
   *     {name: 'DateTime Column', type: 'datetime'},
   *     {name: 'Float Column', type: 'float'},
   *     {name: 'Integer Column', type: 'int'},
   *     {name: 'String Column', type: 'string'}
   *   ]);
   *
   *   Note: to enable support for incremental extract refreshing, add a third
   *   key (incrementalRefresh) to the header object. Candidate columns for
   *   incremental refreshes must be of type datetime or integer. During an
   *   incremental refresh attempt, the most recent value for the given column
   *   will be passed as "lastRecord" to the tableData method. For example:
   *   registerHeaders([
   *     {name: 'DateTime Column', type: 'datetime', incrementalRefresh: true}
   *   ]);
   */
  wdcw.columnHeaders = function columnHeaders(registerHeaders) {
    var processedColumns = [],
        column;

    for (column in wdcFields.coreFields) {
      if (wdcFields.coreFields.hasOwnProperty(column)) {
        processedColumns.push({
          name: column,
          type: wdcFields.coreFields[column]
        })
      }
    }

    registerHeaders(processedColumns);
  };


  /**
   * Primary method called when Tableau is asking for your web data connector's
   * data. Takes a callable argument that you should call with all of the
   * data you've retrieved. You may optionally pass a token as a second argument
   * to support paged/chunked data retrieval.
   *
   * @param {function(Array<{object}>, {string})} registerData
   *   A callback function that takes an array of objects as its sole argument.
   *   Each object should be a simple key/value map of column name to column
   *   value. For example, you might call the callback in the following way:
   *   registerData([
   *     {'String Column': 'String Column Value', 'Integer Column': 123}
   *   ]});
   *
   *   It's possible that the API you're interacting with supports some mechanism
   *   for paging or filtering. To simplify the process of making several paged
   *   calls to your API, you may optionally pass a second argument in your call
   *   to the registerData callback. This argument should be a string token that
   *   represents the last record you retrieved.
   *
   *   If provided, your implementation of the tableData method will be called
   *   again, this time with the token you provide here. Once all data has been
   *   retrieved, pass null, false, 0, or an empty string.
   *
   * @param {string} lastRecord
   *   Optional. If you indicate in the call to registerData that more data is
   *   available (by passing a token representing the last record retrieved),
   *   then the lastRecord argument will be populated with the token that you
   *   provided. Use this to update/modify the API call you make to handle
   *   pagination or filtering.
   *
   *   If you indicated a column in wdcw.columnHeaders suitable for use during
   *   an incremental extract refresh, the last value of the given column will
   *   be passed as the value of lastRecord when an incremental refresh is
   *   triggered.
   */
  wdcw.tableData = function tableData(registerData, lastRecord) {
    $.ajax({
      url: buildApiFrom({
        portfolioID: this.getConnectionData().PortfolioID,
        limit: 500,
        last: lastRecord
      }),
      headers: {
        Authorization: 'Basic ' + btoa(this.getUsername() + ':' + this.getPassword())
      },
      success: function dataRetrieved(response) {
        var processedData = [];

        response.forEach
        registerData(response);
      },
      // Use this.ajaxErrorHandler for basic error handling.
      error: this.ajaxErrorHandler
    });
  };

  // You can write private methods for use above like this:

  /**
   * Helper function to build an API endpoint that uses our proxy.
   *
   * @param {object} opts
   *   Options to inform query parameters and paging.
   */
  function buildApiFrom(opts) {
    var path;
    opts = opts || {};
    path = '/proxy?portfolioID=' + opts.portfolioID;

    // If opts.last was passed, build the URL so the next page is returned.
    if (opts.last) {
      path += '&page=' + opts.last + 1;
    }

    // If opts.limit was passed, add a limit flag to the URL.
    if (opts.limit) {
      path += '&limit=' + opts.limit;
    }

    return path;
  }

  // Polyfill for btoa() in older browsers.
  // @see https://raw.githubusercontent.com/davidchambers/Base64.js/master/base64.js
  if (typeof btoa === 'undefined') {
    function btoa(input) {
      var object = typeof exports != 'undefined' ? exports : this, // #8: web workers
          chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
          str = String(input);

      function InvalidCharacterError(message) {
        this.message = message;
      }
      InvalidCharacterError.prototype = new Error;
      InvalidCharacterError.prototype.name = 'InvalidCharacterError';

      for (
        // initialize result and counter
        var block, charCode, idx = 0, map = chars, output = '';
        // if the next str index does not exist:
        //   change the mapping table to "="
        //   check if d has no fractional digits
        str.charAt(idx | 0) || (map = '=', idx % 1);
        // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
        output += map.charAt(63 & block >> 8 - idx % 1 * 8)
      ) {
        charCode = str.charCodeAt(idx += 3 / 4);
        if (charCode > 0xFF) {
          throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
        }
        block = block << 8 | charCode;
      }
      return output;
    }
  }

  return wdcw;
};

// Set the global wdcw variable as expected.
wdcw = module.exports(jQuery, tableau, wdcw);
