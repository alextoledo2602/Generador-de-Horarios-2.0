from django.db import models
from django.utils.translation import gettext_lazy as _

class Faculty(models.Model):
    name = models.CharField(verbose_name=_('nombre'),
                            max_length=50,
                            unique=True,
                            )

    class Meta:
        verbose_name = _('Facultad')
        verbose_name_plural = _('Facultades')
        ordering = ('name',)

    def __str__(self):
        return self.name
