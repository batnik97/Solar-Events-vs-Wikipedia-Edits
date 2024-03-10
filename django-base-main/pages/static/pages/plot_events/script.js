// Function to plot a time series graph based on provided data
function plotTimeSeries(data) {
    var revisions = data.revisions; // Extract revisions data
    var events = data.events; // Extract events data

    // Extract dates and revision counts for Wikipedia revisions
    var x_dates_revisions = Object.keys(revisions);
    var y_revisions = Object.values(revisions);

    // Extract dates and event names/descriptions for solar events
    var x_dates_events = events.map(event => event.date);
    var eventNames = events.map(event => event.name);
    var eventDescriptions = events.map(event => event.description);

    // Create the Plotly trace for revisions
    var trace_revisions = {
        x: x_dates_revisions,
        y: y_revisions,
        mode: 'lines',
        type: 'scatter',
        name: 'Wikipedia Revisions'
    };

    // Create scatter trace for solar events
    var trace_events = {
        x: x_dates_events,
        y: Array(x_dates_events.length).fill(0),
        mode: 'markers',
        type: 'scatter',
        name: 'Solar Events',
        text: eventNames.map((name, i) => `Name: ${name}<br>Description: ${eventDescriptions[i]}`),
        hoverinfo: 'text',
        marker: {
            symbol: 'diamond-open',
            size: 10
        }
    };

    // Layout customization
    var layout = {
        title: "Wikipedia Revisions vs. Solar Events",
        xaxis: {
            title: "Date",
            type: "date",
            rangeslider: { visible: true }, // Add range slider
            rangeselector: {
                buttons: [
                    { count: 7, label: '1w', step: 'day', stepmode: 'backward' },
                    { count: 1, label: '1m', step: 'month', stepmode: 'backward' },
                    { count: 3, label: '3m', step: 'month', stepmode: 'backward' },
                    { count: 6, label: '6m', step: 'month', stepmode: 'backward' },
                    { step: 'all' }
                ]
            }
        },
        yaxis: { title: "Number of Revisions" }
    };

    // Configuration for Plotly graph
    var config = {
        responsive: true,
        scrollZoom: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['toImage'] // Remove 'toImage' button
    };

    // Plot the graph with both traces
    Plotly.newPlot('plot', [trace_revisions, trace_events], layout, config);
}

// Function to plot a bar chart based on provided data
function plotBarChart(data) {
    // Extract titles and revisions data
    var revisions = data.revisions;

    var x_titles = Object.keys(revisions);
    var y_revisions = Object.values(revisions);

    // Define data trace
    var trace_revisions = [{
        x: x_titles,
        y: y_revisions,
        type: 'bar'
    }];

    // Define layout
    var layout = {
        title: 'Wikipedia Revisions',
        xaxis: {
            title: 'Wikipedia Title'
        },
        yaxis: {
            title: 'Number of Revisions'
        }
    };

    // Plot the chart
    Plotly.newPlot('plot', trace_revisions, layout);
}

// Function to fetch data from the server
function fetchData() {
    var titles = document.getElementById('titles').value.split(','); // Get input titles
    titles = titles.map(title => title.trim()); // Trim titles
    var visualizationType = document.getElementById('visualization-type').value; // Get visualization type
    var eventNameSelect = document.getElementById('event-names'); // Get event dropdown
    if (visualizationType === "bar_chart") {
        var selectedOption = eventNameSelect.options[eventNameSelect.selectedIndex]; // Get selected event
        var eventDate = selectedOption.dataset.date; // Get event date from selected option
        var days = document.getElementById('days').value; // Get days after event
        if (days === "") {
            alert("Days after Event field cannot be empty");
            return false; // Prevent form submission if days after event is empty
        }
        fillEventInfo(selectedOption); // Fill event information
    }

    // Fetch data from server
    fetch('/pages/fetch_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ titles: titles, visualizationType: visualizationType, eventDate: eventDate, days: days })
    })
        .then(response => response.json())
        .then(data => {
            // Plot data based on visualization type
            if (data.visualizationType === "time_series") {
                plotTimeSeries(data);
            } else if (data.visualizationType === "bar_chart") {
                plotBarChart(data);
            } else {
                console.error('Invalid visualization type:', data.visualizationType);
                alert('Invalid visualization type');
            }
        });
}

// Function to toggle display of event info
function toggleEventInfo() {
    var eventInfoDiv = document.getElementById('event-info');
    if (eventInfoDiv.style.display === 'none') {
        eventInfoDiv.style.display = 'block';
    } else {
        eventInfoDiv.style.display = 'none';
        eventInfoDiv.innerHTML = ''; // Clear the inner HTML content
    }
}

// Function to fill event information in the event info div
function fillEventInfo(selectedOption) {
    var eventInfoDiv = document.getElementById('event-info');
    var eventDate = selectedOption.dataset.date;
    var eventTags = selectedOption.dataset.tags;
    var eventDescription = selectedOption.dataset.description;
    var eventLink = selectedOption.dataset.link;
    var eventInfo = `
        <h3>${selectedOption.value}</h3>
        <p><strong>Date:</strong> ${eventDate}</p>
        <p><strong>Tags:</strong> ${eventTags}</p>
        <p><strong>Description:</strong> ${eventDescription}</p>
        <p><a href="${eventLink}" target="_blank">More Info</a></p>
    `;
    eventInfoDiv.innerHTML = eventInfo;
}

// Show event dropdown if bar_chart is selected
document.getElementById('visualization-type').addEventListener('change', function () {
    var selectedOption = this.value;
    var eventDropdown = document.getElementById('event-names');
    var eventFields = document.getElementById('event-fields');

    if (selectedOption === 'bar_chart') {
        eventFields.style.display = 'inline'; // Show event fields
        toggleEventInfo(); // Toggle event info visibility

        // Fetch event names and populate the dropdown
        fetch('/pages/fetch_events', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(data => {
                var events = data.events;
                var eventDropdownOptions = '';

                // Populate dropdown options
                events.forEach(event => {
                    eventDropdownOptions += `<option value="${event.name}" data-date="${event.date}" data-tags="${event.tags}" data-description="${event.description}" data-link="${event.link_to_info}">${event.name}</option>`;
                });

                eventDropdown.innerHTML = eventDropdownOptions; // Set dropdown options
            })
            .catch(error => console.error('Error fetching event names:', error));
    } else {
        eventDropdown.style.display = 'none'; // Hide event dropdown
    }
});

// Fetch data on page load
window.onload = fetchData; // Fetch data when the page loads
