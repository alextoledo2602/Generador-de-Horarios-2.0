from django.db import models

from models.tasks import Task
from models.activity import Activity
from models.career import Career
from models.course import Course
from models.faculty import Faculty
from models.period import Period
from models.class_time import ClassTime
from models.day_not_available import DayNotAvailable
from models.teacher import Teacher
from models.subject import Subject
from models.schedule import Schedule
from models.year import Year
from models.week_not_available import WeekNotAvailable
from models.load_balance import LoadBalance
from models.class_room import ClassRoom

# Create your models here.
class Task(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    done = models.BooleanField(default=False)

    def __str__(self):
        return self.title 
