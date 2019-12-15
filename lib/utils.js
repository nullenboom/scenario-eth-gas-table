const colors = require("colors/safe");
const Table = require("cli-table3");

 const utils = {

  createScenarioAndVariantsRow(info) {
    const rows = [];

    info.scenarios.forEach(scenario => {
      if (!scenario) return;
      //used to determine how many rows the scenario is long, starts with 1 for scenario title row
      let rowSpanCount = 1;
      const scenarioRows = {
        scenarioTitleRow: [],
        variants: [],
        minGasUsed: scenario.minTotalGasUsed,
        maxGasUsed: scenario.maxTotalGasUsed
      };

      scenario.variants.forEach(variant => {
        rowSpanCount++;
        const variantRows = {
          titleRow: [],
          methodRows: [],
          deploymentRows: []
        };

        let variantTitleRow = this._createVariantTitleRow(
          variant,
          scenarioRows.minGasUsed,
          scenarioRows.maxGasUsed
        );

        const methodRows = this._createMethodRows(variant);
        const methodRowsLength = methodRows.length;
        const deployRows = this._createDeploymentRows(variant);
        const deployRowsLength = deployRows.length;
        rowSpanCount += methodRowsLength;
        rowSpanCount += deployRowsLength;
        variantRows.titleRow.push(variantTitleRow);
        methodRows.forEach(row => variantRows.methodRows.push(row));
        deployRows.forEach(row => variantRows.deploymentRows.push(row));
        scenarioRows.variants.push(variantRows);
        this.variantsAmount++;
      });
      //after each variant of a scenario is analyzed, we can create scenarioTitleRow
      let scenarioTitle = {
        hAlign: "left",
        colSpan: 2,
        rowSpan: rowSpanCount,
        content: colors.green.bold(scenario.scenarioName)
      };
      scenarioRows.scenarioTitleRow.push(scenarioTitle);
      rows.push(scenarioRows);
    });
    return rows;
  },

  createTableFormat() {
    // Configure indentation for RTD
    let leftPad = "";
    const table = new Table({
      style: { head: [], border: [], "padding-left": 2, "padding-right": 2 },
      chars: {
        mid: "·",
        "top-mid": "|",
        "left-mid": `${leftPad}·`,
        "mid-mid": "|",
        "right-mid": "·",
        left: `${leftPad}|`,
        "top-left": `${leftPad}·`,
        "top-right": "·",
        "bottom-left": `${leftPad}·`,
        "bottom-right": "·",
        middle: "·",
        top: "-",
        bottom: "-",
        "bottom-mid": "|"
      }
    });

    return table;
  },

  createFirstHeaderLine(metaData) {
    let title = [
      {
        hAlign: "center",
        colSpan: 2,
        content: colors.grey(`Solc version: ${metaData.solcInfo.version}`)
      },
      {
        hAlign: "center",
        colSpan: 2,
        content: colors.grey(
          `Optimizer enabled: ${metaData.solcInfo.optimizer}`
        )
      },
      {
        hAlign: "center",
        colSpan: 1,
        content: colors.grey(`Runs: ${metaData.solcInfo.runs}`)
      },
      {
        hAlign: "center",
        colSpan: 1,
        content: colors.grey(``)
      },
      {
        hAlign: "center",
        colSpan: 4,
        content: colors.grey(`Gas-Metrics`)
      },
      {
        hAlign: "center",
        colSpan: 2,
        content: colors.red(`Total-Gas-Metrics`)
      }
    ];
    return title;
  },

  createSecondHeaderLine(info) {
    let methodSubtitle;
    let variantsAmount = 0;
    info.scenarios.forEach(scenario => {
      if (variantsAmount < scenario.analyzedVariants) {
        variantsAmount = scenario.analyzedVariants;
      }
    });
    methodSubtitle = [
      {
        hAlign: "left",
        colSpan: 2,
        content: colors.green.bold(
          `Scenarios analyzed: ${info.analyzedScenarios}`
        )
      },
      {
        hAlign: "left",
        colSpan: 2,
        content: colors.green.bold(`Max Variants analyzed: ${variantsAmount}`)
      },
      {
        hAlign: "center",
        colSpan: 1,
        content: colors.bold(`Contract`)
      },
      {
        hAlign: "center",
        colSpan: 1,
        content: colors.bold(`Method`)
      },
      {
        hAlign: "center",
        colSpan: 1,
        content: colors.green(`Min`)
      },
      {
        hAlign: "center",
        colSpan: 1,
        content: colors.green(`Max`)
      },
      {
        hAlign: "center",
        colSpan: 1,
        content: colors.green(`Avg `)
      },
  	  {	
        hAlign: "center",	
        colSpan: 1,	
        content: colors.green(`# calls`)	
      },
      {
        hAlign: "center",
        colSpan: 1,
        content: colors.bold(`Total Gas`)
      },
      {
        hAlign: "center",
        colSpan: 1,
        content: colors.bold(`% of Gas`)
      }
    ];

    return methodSubtitle;
  },

  createThirdEmptyHeaderRow() {
    const header = [
      colors.bold(""),
      colors.bold(""),
      colors.bold(""),
      colors.bold(""),
      colors.green(""),
      colors.green(""),
      colors.green(""),
      colors.bold(""),
      colors.bold(""),
      colors.bold(""),
	  colors.bold(""),
      colors.bold("")
    ];
    return header;
  },

  _createVariantTitleRow(variant, minGasUsed, maxGasUsed) {
    let totalGasUsed = this._createTotalGasUsedColor(
      variant.totalGasUsed,
      minGasUsed,
      maxGasUsed
    );

    let variantTitleString =
      colors.inverse.bold(variant.variantName) +
      "\n" +
      "Total Gas Used: " +
      colors.red.bold(`${totalGasUsed}`);

    let variantTitle = {
      hAlign: "left",
      colSpan: 2,
      content: variantTitleString
    };
    return variantTitle;
  },

  _createTotalGasUsedColor(variantGasUsed, minGasUsed, maxGasUsed) {
    if (variantGasUsed == maxGasUsed) {
      return colors.red.bold(`${variantGasUsed}`);
    }
    if (variantGasUsed == minGasUsed) {
      return colors.green.bold(`${variantGasUsed}`);
    }
    return colors.yellow.bold(`${variantGasUsed}`);
  },

  _createDeploymentRows(variant) {
    const deployRows = [];

    // Alphabetize contract names
    variant.deployments.sort((a, b) => a.contractName.localeCompare(b.contractName));

    variant.deployments.forEach(contract => {
      let stats = {};
      if (!contract.gasUsed.length) return;

      const sortedData = contract.gasUsed.sort((a, b) => a - b);
      stats.min = sortedData[0];
      stats.max = sortedData[sortedData.length - 1];

      const uniform = stats.min === stats.max;
      stats.min = uniform ? "-" : colors.cyan(stats.min.toString());
      stats.max = uniform ? "-" : colors.red(stats.max.toString());

      const section = [];
      section.push({
        hAlign: "right",
        colSpan: 2,
        content: colors.cyan("Deployment")
      });
      section.push({
        hAlign: "left",
        colSpan: 2,
        content: contract.contractName
      });
      section.push({ hAlign: "right", content: stats.min });
      section.push({ hAlign: "right", content: stats.max });
      section.push({ hAlign: "right", content: contract.averageGasUsed });
      section.push({ hAlign: "right", content: contract.numberOfDeployments});
      section.push({
        hAlign: "right",
        content: contract.totalGasUsed
      });
      section.push({
        hAlign: "right",
        content: colors.green(this._editPercentageValue(contract.percentageOfScenario) + " %" )
      });
   

      deployRows.push(section);
    });
    return deployRows;
  },
  /**
   * Generates method rows for one variant
   * @param  {Object} variant variant Object with methods and deployment data
   */
  _createMethodRows(variant) {
    const methodRows = [];

    variant.methods.forEach(method => {
      let stats = {};

      const sortedData = method.gasUsed.sort((a, b) => a - b);
      stats.min = sortedData[0];
      stats.max = sortedData[sortedData.length - 1];

      const uniform = stats.min === stats.max;
      stats.min = uniform ? "-" : colors.cyan(stats.min.toString());
      stats.max = uniform ? "-" : colors.red(stats.max.toString());

      const section = [];
      section.push({
        hAlign: "right",
        colSpan: 2,
        content: colors.cyan("Method")
      });
      //section.push({ hAlign: "left",  colSpan: 1, content: colors.grey(data.contract)});
      section.push({ hAlign: "left", colSpan: 2, content: method.methodName });
      section.push({ hAlign: "right", content: stats.min });
      section.push({ hAlign: "right", content: stats.max });
      section.push({ hAlign: "right", content: method.averageGasUsed });
      section.push({ hAlign: "right", content: method.numberOfCalls});
      section.push({ hAlign: "right", content: method.totalGasUsed});
      section.push({
        hAlign: "right",
        content: colors.green(this._editPercentageValue(method.percentageOfScenario) + " %")
      });

      methodRows.push(section);
    });

    return methodRows;
  },


_editPercentageValue(decimalPercentageValue){
	return (decimalPercentageValue * 100).toFixed(2)
}

}
module.exports = utils;
