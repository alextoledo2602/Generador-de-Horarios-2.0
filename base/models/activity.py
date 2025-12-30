from django.db import models
from django.utils.translation import gettext_lazy as _


class Activity(models.Model):

    name = models.CharField(verbose_name=_('nombre'),
                            max_length=50,
                            unique=True,
                            )

    symbology = models.PositiveIntegerField(verbose_name=_('simbología'),
                                 null=False,
                                 blank=True,
                                 unique=True,
                                 )                                  

    class Meta:
        verbose_name = _("Actividad")
        verbose_name_plural = _("Actividades")


    
    def __str__(self):
        return f"{self.symbology}-{self.name}"
