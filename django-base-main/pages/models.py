from django.db import models

class Event(models.Model):
    """
    Model representing an event.
    """

    date = models.DateField()
    name = models.CharField(max_length=200)
    description = models.TextField()
    tags = models.CharField(max_length=200)
    link_to_info = models.URLField()
