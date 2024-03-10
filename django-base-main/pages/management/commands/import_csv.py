import csv
from datetime import datetime
from pages.models import Event
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    """
    A Django management command to import data from an Events CSV file into the Event model.
    """

    help = 'Import data from CSV file'

    def add_arguments(self, parser):
        """
        Add command line arguments.
        """
        parser.add_argument('csv_file', type=str, help='Path to the CSV file.')

    def handle(self, *args, **kwargs):
        """
        Handle the command execution.
        """
        csv_file = kwargs['csv_file']
        with open(csv_file, 'r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                date = datetime.strptime(row['Event date'], '%B %d, %Y').date()
                try:
                    Event.objects.get(name=row['Event name'], date=date)
                except Event.DoesNotExist:
                    Event.objects.create(
                        date=date,
                        name=row['Event name'],
                        description=row['Event description'],
                        tags=row['Tags'],
                        link_to_info=row['Link to additional info']
                    )
        self.stdout.write(self.style.SUCCESS('All events added successfully'))
