from django.contrib import admin
from .models import Task, Schedule, ClassTime, Activity
# Register your models here.
admin.site.register(Task)
admin.site.register(Schedule)
admin.site.register(ClassTime)
admin.site.register(Activity)
