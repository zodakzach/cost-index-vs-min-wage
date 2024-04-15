import ApexCharts from 'apexcharts';
import Papa from 'papaparse';

var chart = null;

// Function to fetch and plot minimum wage and cost of living data
async function plotMinWageAndCostOfLiving(location) {
    if (chart !== null) {
        chart.destroy();
    }
    // Fetch minimum wage data
    const minWageResponse = await fetch('public/data/clean_min_wage_data.csv');
    const minWageData = await minWageResponse.text();

    // Parse minimum wage CSV data
    const minWageParsed = Papa.parse(minWageData, { header: true }).data;

    // Filter data for the specified location
    const minWageLocationData = minWageParsed.filter(row => row['State or otherjurisdiction'] === location);

    if (minWageLocationData.length === 0) {
        console.log(`No minimum wage data found for ${location}.`);
        return;
    }

    // Fetch cost of living index data
    const costOfLivingResponse = await fetch('public/data/clean_cost_index_data.csv');
    const costOfLivingData = await costOfLivingResponse.text();

    // Parse cost of living index CSV data
    const costOfLivingParsed = Papa.parse(costOfLivingData, { header: true }).data;

    // Filter data for the specified location
    const costOfLivingLocationData = costOfLivingParsed.filter(row => row.Location === location);

    // Prepare data for ApexCharts
    const minWageYears = Object.keys(minWageLocationData[0]); // Assuming the first row contains the years
    const minWageValues = Object.values(minWageLocationData[0]).map(parseFloat); 
    // Remove NaN value from minWageValues array
    minWageValues.pop();
    // Remove non-date string from minWageYears array
    const filteredMinWageValues = minWageValues.filter(value => !isNaN(value));
    console.log(minWageValues, minWageYears)

    const costOfLivingYears = costOfLivingLocationData.map(row => parseInt(row['Date']));
    const costOfLivingValues = costOfLivingLocationData.map(row => parseFloat(row['Value']));

    console.log(costOfLivingYears)

    const commonYears = minWageYears.filter(year => costOfLivingYears.includes(year));

    const chartOptions = {
        chart: {
            type: 'line',
            height: 400,
            background: '#1e293b'
        },
        series: [
            {
                name: 'Minimum Wage',
                data: filteredMinWageValues.map((value, index) => [minWageYears[index], value]),
            },
            {
                name: 'Cost of Living Index',
                data: costOfLivingValues.map((value, index) => [costOfLivingYears[index], value]),
            }
        ],
        xaxis: {
            type: "int",
            categories: commonYears,
            title: {
                text: 'Year',
            },
        },
        yaxis: [
            {
                title: {
                    text: 'Minimum Wage (Hourly $)',
                },
            },
            {
                opposite: true,
                title: {
                    text: 'Cost of Living Index',
                },
            },
        ],
        title: {
            text: `Minimum Wage and Cost of Living Index Over Time in ${location}`,
            align: 'center',
        },
        legend: {
            position: 'top',
        },
        theme: {
            mode: 'dark', 
            palette: 'palette1', 
            monochrome: {
                enabled: false,
                color: '#255aee',
                shadeTo: 'dark',
                shadeIntensity: 0.65
            },
        }
    };

    // Render ApexCharts
    chart = new ApexCharts(document.querySelector('#chart'), chartOptions);
    chart.render();
}

// Call the function with the desired location
    // Function to handle button click
function handlePlotButtonClick() {
    // Get the selected state from the select element
    var stateSelect = document.getElementById("countries");
    var selectedState = stateSelect.value;

    console.log(selectedState);
    // Call plotMinWageAndCostOfLiving with the selected state
    plotMinWageAndCostOfLiving(selectedState);
}

// Add event listener to the button
var plotButton = document.getElementById("plotButton");
plotButton.addEventListener("click", handlePlotButtonClick);
