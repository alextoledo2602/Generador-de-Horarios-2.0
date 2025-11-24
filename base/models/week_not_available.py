from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

from . import ClassTime

class WeekNotAvailable(models.Model):

    reason = models.CharField(verbose_name=_('motivo'),
                            max_length=80,
                            blank=False,
                            )
    
    start_date = models.DateField(
        verbose_name=_('fecha de inicio'),
        help_text=_('Fecha de inicio del rango no disponible'),
    )
    end_date = models.DateField(
        verbose_name=_('fecha de fin'),
        help_text=_('Fecha de fin del rango no disponible'),
    )
    
    period = models.ForeignKey("base.Period",
                               verbose_name=_("período"),
                               on_delete=models.CASCADE,
                               blank=False,
                               null=False,
                               )
    
    class Meta:
        verbose_name = _("Semana no Disponible")
        verbose_name_plural = _("Semanas no Disponibles")
        constraints = [
            models.UniqueConstraint(
                name=_('unique_week_not_available'),
                fields=['start_date', 'end_date', 'period'],
            ),
            ]
    
    def clean(self):
        super().clean()
        if not self.reason or not self.reason.strip():
            raise ValidationError({'reason': _('Debe escribir un motivo para la semana no disponible.')})
        if self.start_date and self.end_date and self.start_date > self.end_date:
            raise ValidationError({'end_date': _('La fecha de fin debe ser posterior o igual a la fecha de inicio.')})
        if self.period and self.start_date:
            if self.start_date < self.period.start:
                raise ValidationError({'start_date': _('La fecha de inicio debe estar dentro del rango de fechas del período.')})
        if self.period and self.end_date:
            if self.end_date > self.period.end:
                raise ValidationError({'end_date': _('La fecha de fin debe estar dentro del rango de fechas del período.')})

    def __str__(self):
        return f'{self.reason} ({self.start_date} al {self.end_date})'
