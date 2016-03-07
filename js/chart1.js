// Create variables and define the charts to use from the crossfilter library 
var yearChart = dc.barChart('#chart-year-count'),
	monthChart = dc.barChart('#chart-month-count'),
	durationChart = dc.barChart('#chart-duration-count'),
	statusChart = dc.pieChart('#chart-ring-status'),
	dataCount = dc.dataCount('#data-count'),
	dataTable;
//	dataTable = dc.dataTable('#data-table');


// Load the data and create the charts
d3.csv('data/Projects_CW1.csv', function (error, data) {

	if (error) {
		console.log(error);
	}


	var dateFormat = d3.time.format('%Y-%m-%dT%H:%I:%SZ');
	var yearFormat = d3.time.format('%Y');
	var monthFormat = d3.time.format('%m');


	data.forEach(function (d) {
		d.dd = dateFormat.parse(d["Start_Date"]);
		d.year = +yearFormat(d.dd);
		d.month = +monthFormat(d.dd);
		d.durationYear = +d["Duration_Year"];
		d.projectStatus = d["Project_Status"];
		d.uniqueProjectID = d["Unique_Project_ID"];


	});



	var ndx = crossfilter(data);



	var yearDim = ndx.dimension(function (d) {
			return d.year;
		}),
		monthDim = ndx.dimension(function (d) {
			return d.month;
		}),

		durationDim = ndx.dimension(function (d) {
			return d.durationYear;
		}),
		statusDim = ndx.dimension(function (d) {
			return d.projectStatus;
		}),
		uniqueDim = ndx.dimension(function (d) {
			return d.uniqueProjectID
		}),
		agencyNameDim = ndx.dimension(function (d) {
			return d["Agency_Name"]
		}),

		allDim = ndx.dimension(function (d) {
			return d;
		});


	var all = ndx.groupAll();

	var countPerYear = yearDim.group(),
		countPerMonth = monthDim.group(),
		countPerDuration = durationDim.group(),
		countPerStatus = statusDim.group();

	//yearChart
	yearChart
		.width(500)
		.height(320)
		.dimension(yearDim)
		.group(countPerYear)
		//		.group(remove_empty_bins(countPerYear))
		.x(d3.scale.linear().domain([1990, d3.max(data, function (d) {
			return d.year + 2;
		})]))
		.elasticY(true)
		.centerBar(true)
		.barPadding(15)
		.gap(30)
		.yAxisLabel('Count')
		.xUnits(function () {
			return 10;
		})
		.renderHorizontalGridLines(true)
		.renderVerticalGridLines(true)
		.render();

	yearChart.on('renderlet', function (chart) {
		chart.selectAll("g.y text")
			.attr('dx', '5')
			.attr('dy', '15')
			.attr('transform', "rotate(45)"); // Rotate the y-axis labels 45 degrees
	});

	//monthChart
	monthChart
		.width(500)
		.height(320)
		.dimension(monthDim)
		.group(countPerMonth)
		.x(d3.scale.linear().domain([0, 12.5]))
		.elasticY(true)
		.centerBar(true)
		.barPadding(30)
		.yAxisLabel('Count')
		.xUnits(d3.time.months)
		.renderHorizontalGridLines(true)
		.renderVerticalGridLines(true)
		.render();

	monthChart.on('renderlet', function (chart) {
		chart.selectAll("g.y text")
			.attr('dx', '5')
			.attr('dy', '15')
			.attr('transform', "rotate(45)"); // Rotate the y-axis labels 45 degrees
	});

	//durationChart
	durationChart
		.width(500)
		.height(320)
		.dimension(durationDim)
		.group(countPerDuration)
		.x(d3.scale.linear().domain([-1, d3.max(data, function (d) {
			return d.durationYear + 4;
		})]))
		.elasticY(true)
		.centerBar(true)
		.barPadding(5)
		.yAxisLabel('Count')
		.xUnits(function (d) {
			return 10;
		}).renderHorizontalGridLines(true)
		.renderVerticalGridLines(true)
		.render();

	durationChart.on('renderlet', function (chart) {
		chart.selectAll("g.y text")
			.attr('dx', '5')
			.attr('dy', '15')
			.attr('transform', "rotate(45)"); // Rotate the y-axis labels 45 degrees
	});


	//statusChart
	statusChart
		.width(300)
		.height(300)
		.dimension(statusDim)
		.group(countPerStatus)
		.cx(150).cy(150)
		.ordinalColors(["#1f77b4", "#d62728", "#2ca02c", ]).label(function (d) {

			return (d.key);
		})
		.innerRadius(50)
		.legend(dc.legend().x(125).y(130).itemHeight(13).gap(3));




	//dataTable
	dataTable = $('#data-table').dataTable({
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
								},
			{

				"data": "Start_Date",
				"defaultContent": ""
								},
			{

				"data": "Duration_Year",
				"defaultContent": ""

								},
			{

				"data": "Project_Status",
				"defaultContent": ""

						}
					]
	});


	//refresh dataTable
	function refreshDataTable() {
		dc.events.trigger(function () {
			dataTable.fnClearTable();
			dataTable.fnAddData(agencyNameDim.top(Infinity));
			dataTable.fnDraw();
		});
	};

	yearChart.on("filtered", refreshDataTable);
	monthChart.on("filtered", refreshDataTable);
	durationChart.on("filtered", refreshDataTable);
	statusChart.on("filtered", refreshDataTable);




	dataCount
		.dimension(ndx)
		.group(all);

	//reset
	d3.selectAll('a#all').on('click', function () {
		dc.filterAll();
		dc.renderAll();
	});

	d3.selectAll('a#year').on('click', function () {
		yearChart.filterAll();
		dc.redrawAll();
	});

	d3.selectAll('a#month').on('click', function () {
		monthChart.filterAll();
		dc.redrawAll();
	});

	d3.selectAll('a#status').on('click', function () {
		statusChart.filterAll();
		dc.redrawAll();
	});

	d3.selectAll('a#duration').on('click', function () {
		durationChart.filterAll();
		dc.redrawAll();
	});

	//Render the charts!
	dc.renderAll();

});