from django.db import models
from django.utils.translation import gettext_lazy as _

class Teacher(models.Model):
    name = models.CharField(verbose_name=_('nombre completo'),
                            max_length=100,
                            )

    class Meta:
        verbose_name = _("Profesor")
        verbose_name_plural = _("Profesores")
        ordering = ('name',)

    def __str__(self):
        return self.name
