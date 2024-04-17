import ApexCharts from 'apexcharts';
import Papa from 'papaparse';

var chart = null;
var avgChart = null;

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
    const minWageYears = Object.keys(minWageLocationData[0]).map(parseFloat);
    //remove nan
    minWageYears.pop()

    // Apply interpolation to the minimum wage values, replacing missing values with previous value or 0
    const minWageValues = interpolateMissingValues(Object.values(minWageLocationData[0]));
    // Remove nan
    minWageValues.pop()

    const fedMidWageLocationData = minWageParsed.filter(row => row['State or otherjurisdiction'] === 'Federal ');

    const fedMinWageValues = interpolateMissingValues(Object.values(fedMidWageLocationData[0]));
    // Remove nan
    fedMinWageValues.pop()

    const costOfLivingYears = costOfLivingLocationData.map(row => parseFloat(row['Date']));
    const costOfLivingValues = costOfLivingLocationData.map(row => parseFloat(row['Value']));

    const minWageYearsAsDates = minWageYears.map(year => new Date(year, 0)); // Months are zero-based, so 0 represents January
    const costOfLivingYearsAsDates = costOfLivingYears.map(year => new Date(year, 0)); // Months are zero-based, so 0 represents January

    const chartOptions = {
        chart: {
            type: 'line',
            height: '400',
            background: '#374151'
        },
        series: [
            {
                name: 'Federal Minimum Wage',
                data: fedMinWageValues.map((value, index) => [minWageYearsAsDates[index], value]),
                dataLabels: {
                    enabled: true,
                    formatter: function(value, timestamp) {
                        return new Date(timestamp).getFullYear(); // Display only the year
                    }
                }
            },
            {
                name: 'State Minimum Wage',
                data: minWageValues.map((value, index) => [minWageYearsAsDates[index], value]),
                dataLabels: {
                    enabled: true,
                    formatter: function(value, timestamp) {
                        return new Date(timestamp).getFullYear(); // Display only the year
                    }
                }
            },
            {
                name: 'Cost of Living Index',
                data: costOfLivingValues.map((value, index) => [costOfLivingYearsAsDates[index], value]),
                dataLabels: {
                    enabled: true,
                    formatter: function(value, timestamp) {
                        return new Date(timestamp).getFullYear(); // Display only the year
                    }
                }
            }
        ],

        grid: {
            show: false,
            xaxis: {
                lines: {
                    show: true
                }
            },   
            yaxis: {
                lines: {
                    show: true
                }
            },  
        },
        xaxis: {
            type: 'datetime',
            labels: {
                datetimeFormatter: {
                    year: 'yyyy', // Display only the year
                }
            },
            title: {
                text: 'Year',
            },
        },
        tooltip: {
            x: {
                format: 'yyyy', // Format the tooltip to show only the year
            },
        },
        yaxis: [
            {
                seriesName: 'Federal Minimum Wage',
                title: {
                    seriesName: 'Federal Minimum Wage',

                    text: 'Minimum Wage (Hourly $)',
                },
                labels: {
                    formatter: (value) => { return value.toFixed(2) },
                },
            },
            {
                seriesName: 'Federal Minimum Wage',
                show: false,
                labels: {
                    formatter: (value) => { return value.toFixed(2) },
                },
            },
            {
                seriesName: 'Cost of Living Index',
                opposite: true,
                title: {
                    seriesName: 'Cost of Living Index',
                    text: 'Cost of Living Index',
                },
                labels: {
                    formatter: (value) => { return value.toFixed(2) },
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

// Function to interpolate missing values
function interpolateMissingValues(data) {
    let prevValue = 0; // Default previous value
    for (let i = 0; i < data.length; i++) {
        if (!isNaN(parseFloat(data[i]))) { // Check if the value is not missing
            prevValue = parseFloat(data[i]); // Update previous value
            data[i] = prevValue
        } else {
            data[i] = prevValue; // Replace missing value with previous value
        }
    }
    return data;
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


async function plotFedMinWageAndAvgCostOfLiving(){
    if (avgChart !== null) {
        avgChart.destroy();
    }
    // Fetch minimum wage data
    const avgCostIndexResponse = await fetch('public/data/avg_cost_index_data.csv');
    const avgCostIndexData = await avgCostIndexResponse.text();

    // Fetch minimum wage data
    const minWageResponse = await fetch('public/data/clean_min_wage_data.csv');
    const minWageData = await minWageResponse.text();

    // Parse minimum wage CSV data
    const minWageParsed = Papa.parse(minWageData, { header: true }).data;

    const fedMidWageLocationData = minWageParsed.filter(row => row['State or otherjurisdiction'] === 'Federal ');

    const fedMinWageValues = interpolateMissingValues(Object.values(fedMidWageLocationData[0]));
    // Remove nan
    fedMinWageValues.pop()

    // Prepare data for ApexCharts
    const minWageYears = Object.keys(minWageParsed[0]).map(parseFloat);
    //remove nan
    minWageYears.pop()

    const costOfLivingParsed = Papa.parse(avgCostIndexData, { header: true }).data;

    const avgCostLivingYears = costOfLivingParsed.map(row => parseFloat(row['Year']));
    const avgCostLivingValues = costOfLivingParsed.map(row => parseFloat(row['Avg_Cost_Index']));

    avgCostLivingValues.pop();
    avgCostLivingYears.pop();

    const minWageYearsAsDates = minWageYears.map(year => new Date(year, 0)); // Months are zero-based, so 0 represents January
    const costOfLivingYearsAsDates = avgCostLivingYears.map(year => new Date(year, 0)); // Months are zero-based, so 0 represents January

    const chartOptions = {
        chart: {
            type: 'line',
            height: '300',
            background: '#374151'
        },
        series: [
            {
                name: 'Federal Minimum Wage',
                data: fedMinWageValues.map((value, index) => [minWageYearsAsDates[index], value]),
                dataLabels: {
                    enabled: true,
                    formatter: function(value, timestamp) {
                        return new Date(timestamp).getFullYear(); // Display only the year
                    }
                }
            },
            {
                name: 'Cost of Living Index',
                data: avgCostLivingValues.map((value, index) => [costOfLivingYearsAsDates[index], value]),
                dataLabels: {
                    enabled: true,
                    formatter: function(value, timestamp) {
                        return new Date(timestamp).getFullYear(); // Display only the year
                    }
                }
            }
        ],

        grid: {
            show: false,
            xaxis: {
                lines: {
                    show: true
                }
            },   
            yaxis: {
                lines: {
                    show: true
                }
            },  
        },
        xaxis: {
            type: 'datetime',
            labels: {
                datetimeFormatter: {
                    year: 'yyyy', // Display only the year
                }
            },
            title: {
                text: 'Year',
            },
        },
        tooltip: {
            x: {
                format: 'yyyy', // Format the tooltip to show only the year
            },
        },
        yaxis: [
            {
                seriesName: 'Federal Minimum Wage',
                title: {
                    seriesName: 'Federal Minimum Wage',

                    text: 'Minimum Wage (Hourly $)',
                },
                labels: {
                    formatter: (value) => { return value.toFixed(2) },
                },
            },

            {
                seriesName: 'Cost of Living Index',
                opposite: true,
                title: {
                    seriesName: 'Cost of Living Index',
                    text: 'Cost of Living Index',
                },
                labels: {
                    formatter: (value) => { return value.toFixed(2) },
                },
            },
        ],
        title: {
            text: `Minimum Wage and Cost of Living Index Over Time in the U.S.`,
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
    avgChart = new ApexCharts(document.querySelector('#avgChart'), chartOptions);
    avgChart.render();
}

plotFedMinWageAndAvgCostOfLiving();