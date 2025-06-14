from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
import datetime



class ClassTime(models.Model):

    def day_default():
        current_date = datetime.datetime.now()
        current_year = current_date.year
        current_month = current_date.month
        current_day = current_date.day
        return datetime.date(year=current_year, month=current_month, day=current_day)

    day = models.DateField(verbose_name=_('día'),
                           auto_now=False,
                           auto_now_add=False,
                           default=day_default,
                           )

    number = models.PositiveSmallIntegerField(verbose_name=_('número'),
                                              default=1,
                                              validators=[
        MinValueValidator(limit_value=1,
                          message='El número mínimo del turno es 1'),
        MaxValueValidator(limit_value=6,
                          message='El número máximo del turno es 6'),
    ]
    )

    schedule = models.ForeignKey("base.Schedule",
                                 verbose_name=_("horario"),
                                 null=False,
                                 blank=False,
                                 on_delete=models.CASCADE,
                                 )

    activities = models.ManyToManyField(
        "base.Activity",
        verbose_name=_('actividades'),
        blank=True,
        help_text=_('Varias actividades pueden asociarse a un turno, ej: Seminario y Evaluación')
    )

    subject = models.ForeignKey("base.Subject",
                                verbose_name=_("asignatura"),
                                on_delete=models.CASCADE,
                                null=False,
                                )

    teacher = models.ForeignKey(
        "base.Teacher",
        verbose_name=_("profesor"),
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = _('Turno de Clase')
        verbose_name_plural = _('Turnos de Clases')
        constraints = [
            models.UniqueConstraint(
                name=_('unique_classtime'),
                fields=['day', 'number', 'schedule'],
            ),
            models.CheckConstraint(name=_('check_day_not_sunday'),
                                   check=~models.Q(
                day__week_day=1,
            ),
                violation_error_message='El día no puede ser domingo'
            ),
        ]


    
    def __str__(self):
        return f"Turno {self.number} del dia {self.day} {f'de la asignatura {self.subject}' if self.subject else ''}{f' con {self.teacher}' if self.teacher else ''}"
