# Solar-Events-vs-Wikipedia-Edits

## Overview

This tool facilitates the visualization of solar events data alongside corresponding Wikipedia page edit activity. By integrating data from solar events with Wikipedia's API, users can analyze potential correlations.

## Visualization Options

The tool offers two main visualization methods:

1. **Time Series:** This option plots the number of revisions made to Wikipedia pages over time, with solar events marked on the timeline.

2. **Bar Chart:** Here, the distribution of Wikipedia page revisions is displayed over a specified number of days following a solar event, allowing for a comparative analysis across different events.

## Setup

To set up and utilize the tool, follow these steps:

1. Navigate to the `django-base-main` directory using `cd django-base-main`.
2. Refer to the instructions provided in the `README.md` file for setup procedures.

## Importing Data

To populate the Django Model with relevant data:

1. Navigate to the `django-base-main` directory using `cd django-base-main`.
2. Use the command `poetry run python manage.py import_csv ../events_data.csv` to import data from the provided CSV file.

## Running the Server

To run the server and access the tool:

1. Navigate to the `django-base-main` directory using `cd django-base-main`.
2. Execute `poetry run python manage.py runserver`.
3. Access the tool via a web browser using the URL `http://127.0.0.1:8000/`.

## Future Improvements

To enhance the tool's functionality, consider the following potential changes:

1. **Event Tagging:** Implement a system for categorizing Wikipedia pages based on event tags, enabling more granular analysis and visualization options.

2. **Enhanced Matching:** Explore methods for calculating similarity between event descriptions and Wikipedia page revision differences. While potentially computationally expensive, this approach could provide deeper insights into the effects of solar events on online activity.