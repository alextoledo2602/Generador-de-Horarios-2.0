from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from .career import Career
from math import ceil
import datetime

class Schedule(models.Model):
    career = models.ForeignKey('base.Career',
                               verbose_name=_('carrera'),
                               on_delete=models.CASCADE,
                               null=False,
                               blank=False,
                               )

    year = models.ForeignKey('base.Year',
                               verbose_name=_('año'),
                               on_delete=models.CASCADE,
                               null=False,
                               blank=False,
                               )

    period = models.ForeignKey("base.Period",
                               verbose_name=_("período"),
                               on_delete=models.CASCADE,
                               )

    subjects = models.ManyToManyField("base.Subject", verbose_name=_(
        'asignaturas'), blank=False)

    created = models.DateTimeField(verbose_name=_('creado'),auto_now_add=True)
    
    updated = models.DateTimeField(verbose_name=_('actualizado'), auto_now=True)

    class_room = models.ForeignKey('base.ClassRoom',
                                   verbose_name=_('aula'),
                                   on_delete=models.CASCADE,
                                   )

    group = models.CharField(verbose_name=_('grupo'),
                             max_length=50,
                             )



    class Meta:
        verbose_name = _("Horario")
        verbose_name_plural = _("Horarios")
        ordering = ('period',)

    def __str__(self):
        return f'Horario de {self.career} '