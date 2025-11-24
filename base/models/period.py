from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

from math import ceil
import datetime

class Period(models.Model):
    name = models.CharField(verbose_name=_('nombre'), max_length=20)

    course = models.ForeignKey('base.Course',
                               verbose_name=_('curso'),
                               on_delete=models.CASCADE,
                               null=False,
                               blank=False,
                               )

    start = models.DateField(verbose_name=_('inicio'),
                             default=datetime.date(
                                 datetime.datetime.now().year, 9, 1),
                             auto_now=False,
                             auto_now_add=False,
                             )

    end = models.DateField(verbose_name=_('fin'),
                           default=datetime.date(
                               datetime.datetime.now().year+1, 6, 30),
                           auto_now=False,
                           auto_now_add=False,
                           )

    class Meta:
        verbose_name = _("Período")
        verbose_name_plural = _("Períodos")
        ordering = ('name',)
        constraints = [
            models.UniqueConstraint(
                name=_('unique_course'),
                fields=['name', 'course'],
            ),
            models.CheckConstraint(
                name=_('check_start_period_not_sunday'),
                check=~models.Q(start__week_day=1),
                violation_error_message='La fecha de inicio no puede ser domingo'
            ),
            models.CheckConstraint(
                name=_('check_end_period_not_sunday'),
                check=~models.Q(end__week_day=1),
                violation_error_message='La fecha de fin no puede ser domingo'
            ),
        ]

    def get_start(self):
        start_weekday = self.start.weekday()
        if (start_weekday != 0):
            return self.start - datetime.timedelta(days=start_weekday)
        return self.start

    def get_end(self):
        end_weekday = self.end.weekday()
        if (end_weekday != 5):
            return self.end + datetime.timedelta(days=5 - end_weekday)
        return self.end
    
    @property
    def number_of_weeks(self):
        return ceil(((self.get_end() - self.get_start()).days+2)/7)
        
    def start_week(self, number):
        return self.get_start() + datetime.timedelta(weeks=number)

    def end_week(self, number):
        return self.start_week(number) + datetime.timedelta(days=5)

    def clean(self) -> None:
        if not self.course:
            raise ValidationError({'course': 'El período tiene que pertenecer a un curso'})

        course_years = self.course.name.split('-')
        start_year = int(course_years[0])
        end_year = int(course_years[1])

        start_year_valid = self.start.year == start_year or self.start.year == end_year
        end_year_valid = self.end.year == start_year or self.end.year == end_year

        if not start_year_valid:
            raise ValidationError({'start': 
                f"La fecha de inicio del período debe estar dentro de los años {start_year} o {end_year}"})
        
        if not end_year_valid:
            raise ValidationError({'end': 
                f"La fecha de fin del período debe estar dentro de los años {start_year} o {end_year}"})

        if self.start >= self.end:
            raise ValidationError({'start': 'La fecha de inicio debe ser anterior a la fecha de fin.'})

        if self.number_of_weeks > 24:
            raise ValidationError(f'La cantidad de semanas({self.number_of_weeks}) no pueden ser mayor que 24')
        
        if self.number_of_weeks < 3:
            raise ValidationError(f'La cantidad de semanas({self.number_of_weeks}) no pueden ser menor que 3')

        return super().clean()

    def number_of_weeks_excluding_unavailable(self):
        """
        Calcula la cantidad de semanas del período, considerando desde el lunes anterior a la fecha de inicio
        hasta el domingo posterior a la fecha de fin, y restando las semanas completas no disponibles.
        """
        start_monday = self.get_start()
        end_sunday = self.get_end()
        
        # Total de semanas en el rango (usando la misma lógica que number_of_weeks)
        total_weeks = ceil(((end_sunday - start_monday).days + 2) / 7)
        
        # Importar aquí para evitar import circular
        from .week_not_available import WeekNotAvailable
        
        unavailable_weeks = WeekNotAvailable.objects.filter(period=self)
        
        weeks_to_subtract = 0
        for unavailable_week in unavailable_weeks:
            days_unavailable = (unavailable_week.end_date - unavailable_week.start_date).days + 1
            
            weeks_to_subtract += days_unavailable // 7
        
        return total_weeks - weeks_to_subtract

    def days_not_available_by_week(self):
        """
        Devuelve una lista de diccionarios con:
        {
            'numero_semana': <número de semana en el período, excluyendo semanas no disponibles>,
            'dia_semana': <número de día de la semana (0=Lunes, ..., 6=Domingo)>
        }
        para cada DayNotAvailable asociado al período.
        """
        from .week_not_available import WeekNotAvailable
        from .day_not_available import DayNotAvailable

        start_date = self.get_start()
        
        unavailable_weeks = WeekNotAvailable.objects.filter(period=self).order_by('start_date')
        
        days_not_available = DayNotAvailable.objects.filter(period=self)
        
        result = []
        for day in days_not_available:
            day_date = day.day
            
            days_since_start = (day_date - start_date).days
            absolute_week = days_since_start // 7 + 1
            
            weeks_to_subtract = 0
            for unavailable_week in unavailable_weeks:
                if unavailable_week.end_date < day_date:
                    weeks_to_subtract += 1
            
            adjusted_week = absolute_week - weeks_to_subtract
            
            result.append({
                'numero_semana': adjusted_week,
                'dia_semana': day_date.weekday()
            })
        
        return result

    
    def __str__(self):
        return f"{self.name} del curso {self.course.name} ({self.start.strftime('%d/%m/%Y')} - {self.end.strftime('%d/%m/%Y')})"