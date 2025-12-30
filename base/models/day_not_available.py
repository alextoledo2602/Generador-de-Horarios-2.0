from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
import datetime

class DayNotAvailable(models.Model):
    def day_default():
        current_date = datetime.datetime.now()
        current_year = current_date.year
        current_month = current_date.month
        current_day = current_date.day
        return datetime.date(year=current_year, month=current_month, day=current_day)

    reason = models.CharField(
        verbose_name=_('motivo'),
        max_length=80,
        blank=False,
    )

    day = models.DateField(verbose_name=_('día'),
                           auto_now=False,
                           auto_now_add=False,
                           default=day_default,
                           )

    period = models.ForeignKey("base.Period",
                               verbose_name=_("período"),
                               on_delete=models.CASCADE,
                               blank=False,
                               null=False,
                               )

    class Meta:
        verbose_name = _("Día no disponible")
        verbose_name_plural = _("Días no disponibles")
        constraints = [
            models.UniqueConstraint(
                name=_('unique_day_not_available'),
                fields=['day', 'period'],
            ),
            models.CheckConstraint(name=_('check_day_not_available_not_sunday'),
                                   check=~models.Q(
                day__week_day=1,
            ),
                violation_error_message='El día no puede ser domingo'
            ),
        ]

    def clean(self) -> None:
        from .period import Period
        from .class_time import ClassTime

        if self.period and self.day:
            if self.day < self.period.start or self.day > self.period.end:
                raise ValidationError({'day': 'El día debe estar dentro del rango de fechas del período.'})

        return super().clean()

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.reason} {self.day}"


