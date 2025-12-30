from django.db import models
from django.utils.translation import gettext_lazy as _

class ClassRoom(models.Model):

    name = models.CharField(verbose_name=_('nombre'),
                            max_length=100,
                            unique=True,
                            )

    class Meta:
        verbose_name = _("Local")
        verbose_name_plural = _("Locales")
        ordering = ('name',)

    def __str__(self):
        return f'{self.name}'
 