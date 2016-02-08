// Generated on 2015-09-21 using generator-web-data-connector 1.0.0

var express = require('express'),
    request = require('request'),
    atob = require('atob'),
    keys = Object.keys || require('object-keys'),
    workfrontApi = require('workfront-api'),
    workfrontFields = require('./src/fields.js'),
    app = express(),
    port = process.env.PORT || 9001;

// Serve files as if this were a static file server.
app.use(express.static('./'));

// Proxy the index.html file.
app.get('/', function (req, res) {
  res.sendFile('./index.html');
});

// Create a proxy endpoint.
app.get('/proxy', function (req, res) {
  // Note that the "buildApiFrom(path)" helper in main.js sends the API endpoint
  // as a query parameter to our proxy. We read that in here and build the real
  // endpoint we want to hit.
  console.log(workfrontFields);
  var authParts = atob(req.header('authorization').substr(6)).split(':'),
      workFrontUrl = authParts[0] + ':' + authParts[1],
      workfrontApiKey = authParts[2],
      workfront = workfrontApi.ApiFactory.getInstance({
        url: workFrontUrl,
        version: '4.0'
      }),
      options = {
        portfolioID: req.query.portfolioID,
        fields: Object.keys(workfrontFields.coreFields).join(','),
        //fields: 'BCCompletionState,ID,URL,actualBenefit,actualCompletionDate,actualCost,actualDurationExpression,actualDurationMinutes,actualExpenseCost,actualHoursLastMonth,actualHoursLastThreeMonths,actualHoursThisMonth,actualHoursTwoMonthsAgo,actualLaborCost,actualRevenue,actualRiskCost,actualStartDate,actualValue,actualWorkRequired,actualWorkRequiredExpression,alignment,alignmentScoreCardID,allApprovedHours,allUnapprovedHours,approvalEstStartDate,approvalPlannedStartDate,approvalPlannedStartDay,approvalProcessID,approvalProjectedStartDate,approversString,auditTypes,autoBaselineRecurOn,autoBaselineRecurrenceType,billedRevenue,budget,budgetStatus,budgetedCompletionDate,budgetedCost,budgetedHours,budgetedLaborCost,budgetedStartDate,businessCaseStatusLabel,categoryID,companyID,completionType,condition,conditionType,convertedOpTaskEntryDate,convertedOpTaskName,convertedOpTaskOriginatorID,cpi,csi,currency,currentApprovalStepID,customerID,deliverableScoreCardID,deliverableSuccessScore,deliverableSuccessScoreRatio,description,displayOrder,durationExpression,durationMinutes,eac,enableAutoBaselines,enteredByID,entryDate,estCompletionDate,estStartDate,extRefID,filterHourTypes,financeLastUpdateDate,fixedCost,fixedEndDate,fixedRevenue,fixedStartDate,groupID,hasBudgetConflict,hasCalcError,hasCompletionConstraint,hasDocuments,hasExpenses,hasMessages,hasNotes,hasRateOverride,hasResolvables,hasStartConstraint,hasTimedNotifications,lastCalcDate,lastConditionNoteID,lastNoteID,lastUpdateDate,lastUpdatedByID,levelingMode,milestonePathID,name,nextAutoBaselineDate,numberOpenOpTasks,olv,optimizationScore,ownerID,ownerPrivileges,percentComplete,performanceIndexMethod,personal,plannedBenefit,plannedCompletionDate,plannedCost,plannedDateAlignment,plannedExpenseCost,plannedHoursAlignment,plannedLaborCost,plannedRevenue,plannedRiskCost,plannedStartDate,plannedValue,popAccountID,portfolioID,portfolioPriority,previousStatus,priority,programID,progressStatus,projectedCompletionDate,projectedStartDate,queueDefID,referenceNumber,rejectionIssueID,remainingCost,remainingRevenue,remainingRiskCost,resourcePoolID,risk,riskPerformanceIndex,roi,scheduleID,scheduleMode,selectedOnPortfolioOptimizer,spi,sponsorID,status,statusUpdate,submittedByID,summaryCompletionType,templateID,totalHours,totalOpTaskCount,totalTaskCount,updateType,version,workRequired,workRequiredExpression',
        '$$LIMIT': req.query.limit || 100
      };

  // Authenticate using an API token.
  workfront.httpOptions.alwaysUseGet = true;
  workfront.httpParams.apiKey = workfrontApiKey;

  // Make an HTTP request using the above specified options.
  console.log(req.query.portfolioID);
  workfront.search('proj', options).then(
    function(data) {
      console.log('Get success. Received ' + data.length + ' records.');
      res.set('content-type', 'application/json');
      res.send(data);
    },
    function(error) {
      res.sendStatus(500);
      console.log('Get failure. Received data:');
      console.log(error);
    }
  );
});

var server = app.listen(port, function () {
  var port = server.address().port;
  console.log('Express server listening on port ' + port);
});

module.exports = app;
