// Create variables and define the charts to use from the crossfilter library
var lifecycleCostChart = dc.barChart('#chart-bar-lifecycleCost'),
	plannedCostChart = dc.barChart('#chart-bar-plannedCost'),
	projectedCostChart = dc.barChart('#chart-bar-projectedCost'),
	allCostChart = dc.compositeChart('#chart-composite-allCost'),
	costBubbleChart = dc.bubbleChart('#chart-bubble-allCost'),
	agencyRowChart = dc.rowChart('#chart-agency-row'),
	dataCount2 = dc.dataCount('#data-count-2'),
	dataTable2;

// Load the data and create the charts
d3.csv('data/Projects_CW1.csv', function (error, data) {

	if (error) {
		console.log(error);
	}

	var dateFormat = d3.time.format('%Y-%m-%dT%H:%I:%SZ');
	var yearFormat = d3.time.format('%Y');
	var numberFormat = d3.format('.2f');

	data.forEach(function (d) {
		d.dd = dateFormat.parse(d["Start_Date"]);
		d.year = +yearFormat(d.dd);

		d.lifecycleCost = +d["Lifecycle_Cost"];
		d.plannedCost = +d["Planned_Cost"];
		d.projectedCost = +d["Projected_Actual_Cost"];
		d.agnecyName = d["Agency_Name"];
		d.costVariance = +d["Cost_Variance"];
		d.scheduleVariance = +d["Schedule_Variance"];
		d.costVariancePercentage = +d["Cost_Variance(%)"];
		d.scheduleVariancePercentage = +d["Schedule_Variance(%)"];

	});


	var ndx = crossfilter(data);


	var yearDim = ndx.dimension(function (d) {
			return d.year;
		}),

		yearCostDim = ndx.dimension(function (d) {
			return d.year;
		}),

		lifecycleCostDim = ndx.dimension(function (d) {
			return d["Lifecycle_Cost"];
		}),

		plannedCostDim = ndx.dimension(function (d) {
			return d["Planned_Cost"];
		}),
		projectedCostDim = ndx.dimension(function (d) {
			return d["Projected_Actual_Cost"];
		}),

		agencyNameDim = ndx.dimension(function (d) {
			return d["Agency_Name"]
		}),

		allDim = ndx.dimension(function (d) {
			return d;
		});


	var all = ndx.groupAll();

	var yearCostGroup = yearCostDim.group().reduce(
		function (p, v) {
			++p.count;
			p.costVariance += v.costVariance;
			p.avgCostVariance = p.count ? (p.costVariance / p.count) : 0;
			p.scheduleVariance += v.scheduleVariance;
			p.avgScheduleVariance = p.count ? (p.scheduleVariance / p.count) : 0;
			p.costFluctuation += v.costVariancePercentage;
			p.avgCostFluctuation = p.count ? (p.costFluctuation / p.count) : 0;
			p.scheduleFluctuation += v.scheduleVariancePercentage;
			p.avgScheduleFluctuation = p.count ? (p.scheduleFluctuation / p.count) : 0;
			//			p.countPercentage = p.count / all.count;
			return p;
		},
		function (p, v) {
			--p.count;
			p.costVariance -= v.costVariance;
			p.avgCostVariance = p.count ? (p.costVariance / p.count) : 0;
			p.scheduleVariance -= v.scheduleVariance;
			p.avgScheduleVariance = p.count ? (p.scheduleVariance / p.count) : 0;
			p.costFluctuation -= v.costVariancePercentage;
			p.avgCostFluctuation = p.count ? (p.costFluctuation / p.count) : 0;
			p.scheduleFluctuation -= v.scheduleVariancePercentage;
			p.avgScheduleFluctuation = p.count ? (p.scheduleFluctuation / p.count) : 0;
			//			p.countPercentage = p.count / all.count;
			return p;
		},
		function () {
			return {
				count: 0,
				costVariance: 0,
				avgCostVariance: 0,
				scheduleVariance: 0,
				avgScheduleVariance: 0,
				costFluctuation: 0,
				avgCostFluctuation: 0,
				scheduleFluctuation: 0,
				avgScheduleFluctuation: 0
					//				countPercentage: 0

			};
		});


	var plannedCostGroup = yearDim.group().reduceSum(

			function (d) {
				return d.plannedCost;
			}

		),

		projectedCostGroup = yearDim.group().reduceSum(

			function (d) {
				return d.projectedCost;
			}
		),

		lifecycleCostGroup = yearDim.group().reduceSum(

			function (d) {
				return d.lifecycleCost;
			}
		),

		agencyNameGroup = agencyNameDim.group().reduceCount();

	//	allGroup = allDim.group().reduceSum();


	//lifecycleCostChart
	lifecycleCostChart
		.width(500)
		.height(230)
		.dimension(yearDim)
		.group(lifecycleCostGroup)
		.x(d3.scale.linear().domain([1990, d3.max(data, function (d) {
			return d.year;
		})]))
		.elasticY(true)
		.centerBar(true)
		.barPadding(10)
		.brushOn(true)
		.gap(30)
		.yAxisLabel('Cost ($M)')
		.yAxisPadding('5%')
		.xUnits(function () {
			return 10;
		})
		.renderHorizontalGridLines(true)
		.render();


	lifecycleCostChart.on('renderlet', function (chart) {
		chart.selectAll("g.y text")
			.attr('dx', '5')
			.attr('dy', '15')
			.attr('transform', "rotate(45)"); // Rotate the y-axis labels 45 degrees
	});

	//plannedCostChart
	plannedCostChart
		.width(500)
		.height(230)
		.dimension(yearDim)
		.group(plannedCostGroup)
		.x(d3.scale.linear().domain([1990, d3.max(data, function (d) {
			return d.year;
		})]))
		.elasticY(true)
		.centerBar(true)
		.barPadding(10)
		.brushOn(true)
		.gap(30)
		.yAxisLabel('Cost ($M)')
		.yAxisPadding('5%')
		.xUnits(function () {
			return 10;
		})
		.renderHorizontalGridLines(true)
		.render();

	plannedCostChart.on('renderlet', function (chart) {
		chart.selectAll("g.y text")
			.attr('dx', '5')
			.attr('dy', '15')
			.attr('transform', "rotate(45)"); // Rotate the y-axis labels 45 degrees
	});

	//projectedCostChart
	projectedCostChart
		.width(500)
		.height(230)
		.dimension(yearDim)
		.group(projectedCostGroup)
		.x(d3.scale.linear().domain([1990, d3.max(data, function (d) {
			return d.year;
		})]))
		.elasticY(true)
		.centerBar(true)
		.barPadding(10)
		.brushOn(true)
		.gap(30)
		.yAxisLabel('Cost ($M)')
		.yAxisPadding('5%')
		.xUnits(function () {
			return 10;
		})
		.renderHorizontalGridLines(true)
		.render();

	projectedCostChart.on('renderlet', function (chart) {
		chart.selectAll("g.y text")
			.attr('dx', '5')
			.attr('dy', '15')
			.attr('transform', "rotate(45)"); // Rotate the y-axis labels 45 degrees
	});



	//costBubbleChart
	costBubbleChart
		.width(970)
		.height(400)
		.dimension(yearCostDim)
		.group(yearCostGroup)
		.elasticY(true)
		.elasticX(true)
		.yAxisPadding(50)
		.xAxisPadding(50)
		.colors(colorbrewer.RdYlGn[9])
		.colorDomain([-500, 500])
		.colorAccessor(function (d) {
			return d.value.count;
		})
		.keyAccessor(function (p) {
			return p.value.avgCostFluctuation;
		})
		.valueAccessor(function (p) {
			return p.value.avgScheduleFluctuation;
		})
		.radiusValueAccessor(function (p) {
			return p.value.count;
		})
		.maxBubbleRelativeSize(0.3)
		.x(d3.scale.linear().domain([-200, 200]))
		.y(d3.scale.linear().domain([-200, 200]))
		.r(d3.scale.linear().domain([0, 4000]))
		.label(function (p) {
			return p.key;
		})
		.renderLabel(true)
		.xAxisLabel('Average Cost Variance %')
		.yAxisLabel('Average Schedule Variance %')
		.renderTitle(true)
		.title(function (p) {
			return [
                'year: ' + p.key,
                'Average Cost Variance: ' + numberFormat(p.value.avgCostVariance) + ' ($M)',
				'Average Schedule Variance: ' + numberFormat(p.value.avgScheduleVariance) + ' (Days)',

				'Average Cost Variance: ' + numberFormat(p.value.avgCostFluctuation) + '%',
				'Avgrage Schedule Variance: ' + numberFormat(p.value.avgScheduleFluctuation) + '%',

				'count: ' + p.value.count

            ].join('\n');
		})
		.renderHorizontalGridLines(true)
		.renderVerticalGridLines(true)
		.yAxis().tickFormat(function (v) {
			return v;
		});

	costBubbleChart.on('renderlet', function (chart) {
		chart.selectAll("g.y text")
			.attr('dx', '5')
			.attr('dy', '15')
			.attr('transform', "rotate(45)"); // Rotate the y-axis labels 45 degrees
	});







	//allCostChart
	allCostChart
		.width(970)
		.height(400)
		.x(d3.scale.linear().domain([1990, d3.max(data, function (d) {
			return d.year;
		})]))
		.xUnits(function () {
			return 3;
		})
		.elasticY(true)
		.brushOn(false)
		.yAxisLabel('Cost ($M)')
		.compose([
		dc.barChart(allCostChart)
	.dimension(yearDim)
	.group(lifecycleCostGroup, 'Lifecycle Cost')
	.barPadding(20)
	.centerBar(true)
	.colors('#1f77b4'),
		dc.barChart(allCostChart)
	.dimension(yearDim)
	.group(plannedCostGroup, 'Planned Cost')
	.barPadding(20)
	.centerBar(true)
	.colors('#2ca02c'),
		dc.barChart(allCostChart)
	.dimension(yearDim)
	.group(projectedCostGroup, 'Projected/Actual Cost')
	.barPadding(20)
	.centerBar(true)
	.colors('#d62728')
	])
		.legend(dc.legend().x(130).y(20).itemHeight(13).gap(3))
		.renderHorizontalGridLines(true)
		.render();

	allCostChart.on('renderlet', (function (chart) {

		chart.selectAll("g._0").attr("transform", "translate(" + (-6) + ", 0)"); //blue lifecycleCost
		chart.selectAll("g._1").attr("transform", "translate(" + 7 + ", 0)"); //green plannedCost
		chart.selectAll("g._2").attr("transform", "translate(" + 20 + ", 0)"); //red projectedCost

		chart.selectAll("g.y text")
			.attr('dx', '5')
			.attr('dy', '15')
			.attr('transform', "rotate(45)"); // Rotate the y-axis labels 45 degrees

	}));


	//agencyRowChart
	agencyRowChart
		.width(400)
		.height(810)
		.dimension(agencyNameDim)
		.group(agencyNameGroup)
		.label(function (d) {

			return d.key + ": " + d.value;
		})
		.title(function (d) {

			return "project counts: " + d.value;
		})
		.elasticX(true)
		.ordering(function (d) {

			return -d.value;
		})
		.xAxis().ticks(6);


	//dataTable
	dataTable2 = $('#data-table2').dataTable({
		"bJQueryUI": true,
		"sPaginationType": "full_numbers",
		"bPaginate": true,
		"bLengthChange": true,
		"bFilter": true,
		"bSort": true,
		"bInfo": true,
		"sInfoPostFix": true,
		"aaData": agencyNameDim.top(Infinity),
		"bAutoWidth": true,
		"bProcessing": true,
		"aoColumns": [
			{
				"data": "Unique_Project_ID",
				"defaultContent": ""
								}, {
				"data": "Agency_Name",
				"defaultContent": ""
								}, {
				"data": "Start_Date",
				"defaultContent": ""
								},
			{

				"data": "Lifecycle_Cost",
				"defaultContent": ""
								},
			{

				"data": "Planned_Cost",
				"defaultContent": ""

								},
			{

				"data": "Projected_Actual_Cost",
				"defaultContent": ""

						}
					]
	});


	//refresh dataTable
	function refreshDataTable() {
		dc.events.trigger(function () {
			dataTable2.fnClearTable();
			dataTable2.fnAddData(agencyNameDim.top(Infinity));
			dataTable2.fnDraw();
		});
	};

	lifecycleCostChart.on("filtered", refreshDataTable);
	plannedCostChart.on("filtered", refreshDataTable);
	projectedCostChart.on("filtered", refreshDataTable);
	costBubbleChart.on("filtered", refreshDataTable);
	agencyRowChart.on("filtered", refreshDataTable);
	allCostChart.on("filtered", refreshDataTable);

	dataCount2
		.dimension(ndx)
		.group(all);

	//reset
	d3.selectAll('a#all').on('click', function () {
		dc.filterAll();
		dc.renderAll();
	});

	d3.selectAll('a#projectedCost').on('click', function () {
		projectedCostChart.filterAll();
		dc.redrawAll();
	});

	d3.selectAll('a#lifecycleCost').on('click', function () {
		lifecycleCostChart.filterAll();
		dc.redrawAll();
	});

	d3.selectAll('a#plannedCost').on('click', function () {
		plannedCostChart.filterAll();
		dc.redrawAll();
	});

	d3.selectAll('a#agencyRow').on('click', function () {
		agencyRowChart.filterAll();
		dc.redrawAll();
	});

	d3.selectAll('a#costBubble').on('click', function () {
		costBubbleChart.filterAll();
		dc.redrawAll();
	});


	//Render the charts!
	dc.renderAll();

});