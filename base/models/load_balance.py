from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

class LoadBalance(models.Model):
    balance = models.JSONField(default=list, blank=True, verbose_name="Balance")
    schedule = models.ForeignKey(
        "base.Schedule",
        verbose_name=_("horario"),
        null=False,
        blank=False,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return f"Balance de {self.schedule}"

    class Meta:
        verbose_name = _("Balance de Carga")
        
