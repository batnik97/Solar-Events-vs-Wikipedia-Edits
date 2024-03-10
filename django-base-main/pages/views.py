from django.shortcuts import render
from django.db.models import Min, Max
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from pages.models import Event
from datetime import timedelta, datetime
import requests
import collections
import json

def get_events():
    """
    Retrieves events from the database and formats them into dictionaries.
    
    Returns:
        list: A list of dictionaries representing events.
    """
    events = Event.objects.all()
    event_dicts = []
    for event in events:
        event_dict = {
            'date': event.date.strftime('%Y-%m-%d'),
            'name': event.name,
            'description': event.description,
            'tags': event.tags,
            'link_to_info': event.link_to_info
        }
        event_dicts.append(event_dict)
    return event_dicts

def make_wiki_request(params):
    """
    Makes a request to the Wikipedia API.
    
    Args:
        params (dict): Parameters for the API request.
        
    Returns:
        dict: JSON response from the API.
    """
    URL = "https://en.wikipedia.org/w/api.php"
    session = requests.Session()
    response = session.get(url=URL, params=params)
    return response.json()

def get_bar_chart_data(titles, event_date, days):
    """
    Retrieves data for a bar chart visualization.
    
    Args:
        titles (list): List of titles to query in Wikipedia.
        event_date (str): Date of the event.
        days (int): Number of days to consider for data retrieval.
        
    Returns:
        JsonResponse: JSON response containing revision data and visualization type.
    """
    date_object = datetime.strptime(event_date, '%Y-%m-%d')

    start_date = (date_object + timedelta(days=days)).strftime('%Y-%m-%d')
    end_date = (date_object).strftime('%Y-%m-%d')

    revisions = collections.defaultdict(int)

    for title in titles:
        params = {
            "action": "query",
            "prop": "revisions",
            "titles": title,
            "rvstart": f"{start_date}T00:00:00Z",
            "rvend": f"{end_date}T00:00:00Z",
            "rvlimit": "max",
            "rvprop": "timestamp",
            "formatversion": "2",
            "format": "json"
        }

        data = make_wiki_request(params)

        pages = data["query"]["pages"]

        revisions[title] = 0
        for page in pages:
            for rev in page.get("revisions", []):
                revisions[title] += 1
    return JsonResponse({'revisions': revisions, 'visualizationType': 'bar_chart'})

def get_time_series_data(titles):
    """
    Retrieves data for a time series visualization.
    
    Args:
        titles (list): List of titles to query in Wikipedia.
        
    Returns:
        JsonResponse: JSON response containing revision data, events, and visualization type.
    """
    event_dicts = get_events()

    end_date = Event.objects.all().aggregate(lowest_date=Min('date'))['lowest_date']
    end_date = (end_date - timedelta(days=30)).strftime('%Y-%m-%d')

    start_date = Event.objects.all().aggregate(highest_date=Max('date'))['highest_date']
    start_date = (start_date + timedelta(days=30)).strftime('%Y-%m-%d')

    revisions = collections.defaultdict(int)

    for title in titles:
        params = {
            "action": "query",
            "prop": "revisions",
            "titles": title,
            "rvstart": f"{start_date}T00:00:00Z",
            "rvend": f"{end_date}T00:00:00Z",
            "rvlimit": "max",
            "rvprop": "timestamp",
            "formatversion": "2",
            "format": "json"
        }

        data = make_wiki_request(params)

        pages = data["query"]["pages"]

        for page in pages:
            for rev in page.get("revisions", []):
                date = rev["timestamp"].split('T')[0]
                revisions[date] += 1

    sorted_revisions = {k: revisions[k] for k in sorted(revisions)}

    return JsonResponse({'revisions': sorted_revisions, 'events': event_dicts, 'visualizationType': 'time_series'})


def home(request):
    """
    Renders the home page.
    
    Args:
        request: HTTP request object.
        
    Returns:
        HttpResponse: Rendered home page.
    """
    return render(request, 'pages/home.html')

def random_number(request):
    """
    Renders the random number page.
    
    Args:
        request: HTTP request object.
        
    Returns:
        HttpResponse: Rendered random number page.
    """
    return render(request, 'pages/random_number.html')

def plot_events(request):
    """
    Renders the page for plotting events.
    
    Args:
        request: HTTP request object.
        
    Returns:
        HttpResponse: Rendered page for plotting events.
    """
    default_titles = ["Solar cell", "Perovskite solar cell", "Semiconductor", "Climate Change", "Solar energy", "Renewable energy"]
    return render(request, 'pages/plot_events.html', {'default_titles': default_titles})

@csrf_exempt
def fetch_events(request):
    """
    Fetches events.
    
    Args:
        request: HTTP request object.
        
    Returns:
        JsonResponse: JSON response containing events.
    """
    if request.method == 'GET':
        event_dicts = get_events()
        return JsonResponse({'events': event_dicts})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def fetch_data(request):
    """
    Fetches data based on visualization type.
    
    Args:
        request: HTTP request object.
        
    Returns:
        JsonResponse: JSON response containing data for visualization.
    """
    if request.method == 'POST':
        data = json.loads(request.body)
        titles = data.get('titles', [])
        visualization_type = data.get('visualizationType', 'time_series')

        if visualization_type == 'time_series':
            return get_time_series_data(titles)
        elif visualization_type == 'bar_chart':
            event_date = data.get('eventDate', '')
            days = int(data.get('days', 30))
            return get_bar_chart_data(titles, event_date, days)
        else:
            return JsonResponse({'error': 'Invalid visualization type'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)
