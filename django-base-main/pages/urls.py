from django.urls import path

from . import views

urlpatterns = [
    path("", views.plot_events, name="home"),
    path("random_number", views.random_number, name="random_number"),
    path("plot_events", views.plot_events, name="plot_events"),
    path("fetch_data", views.fetch_data, name="fetch_data"),
    path("fetch_events", views.fetch_events, name="fetch_data"),
]
