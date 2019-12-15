const colors = require("colors/safe");

const utils = require('./lib/utils')

 const scenarioEthGasTable = {
	
  generateTableFromJson(info, colorsActive) {
    colors.enabled = colorsActive;

    // ---------------------------------------------------------------------------------------------
    // Assemble section: usageScenarios
    // ---------------------------------------------------------------------------------------------

    const rows = utils.createScenarioAndVariantsRow(info);

    // Format table
    const table = utils.createTableFormat();
    // Format and load methods metrics
    let title = utils.createFirstHeaderLine(info.metaData);
    let methodSubtitle = utils.createSecondHeaderLine(info);
    //create a third header row with no content (currently needed for format, dont know why)
    const header = utils.createThirdEmptyHeaderRow();

    // ---------------------------------------------------------------------------------------------
    // Final assembly
    // ---------------------------------------------------------------------------------------------
    table.push(title);
    table.push(methodSubtitle);
    table.push(header);

    //print for each gathered scenario data
    rows.forEach(scenario => {
      table.push(scenario.scenarioTitleRow);
      scenario.variants.forEach(variant => {
        table.push(variant.titleRow);
        variant.methodRows.forEach(row => table.push(row));
        variant.deploymentRows.forEach(row => table.push(row));
      });
    });

    let tableOutput = table.toString();

    // ---------------------------------------------------------------------------------------------
    // Print
    // ---------------------------------------------------------------------------------------------
    console.log(tableOutput);
  },

}
module.exports = scenarioEthGasTable;
