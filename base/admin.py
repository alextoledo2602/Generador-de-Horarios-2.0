from django.contrib import admin
from .models import Task, Schedule, ClassTime, Activity, DayNotAvailable
# Register your models here.
admin.site.register(Task)
admin.site.register(Schedule)
admin.site.register(ClassTime)
admin.site.register(Activity)
admin.site.register(DayNotAvailable)


