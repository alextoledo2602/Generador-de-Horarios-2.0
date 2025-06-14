from django.db import models
from django.utils.translation import gettext_lazy as _

class Year(models.Model):

    class YearNumber(models.IntegerChoices):
        PRIMERO = 1, _('Primer año')
        SEGUNDO = 2, _('Segundo año')
        TERCERO = 3, _('Tercer año')
        CUARTO = 4, _('Cuarto año')
        QUINTO = 5, _('Quinto año')


    number = models.PositiveSmallIntegerField(verbose_name=_('número'),
                                              choices=YearNumber.choices,
                                              default=YearNumber.PRIMERO,
                                              null=False,
                                              blank=False,
                                              )

    career = models.ForeignKey("base.Career",
                               verbose_name=_("carrera"),
                               on_delete=models.CASCADE,
                               null=False,
                               blank=False,
                               )    
                               
    class Meta:
        verbose_name = _('Año')
        verbose_name_plural = _('Años')
        ordering = ('number',)
        constraints = [
            models.UniqueConstraint(
                name=_('unique_year'),
                fields=['number', 'career'],
            ),
        ]

    @property
    def number_choice(self):
        return self.YearNumber(self.number).label
    
    @property
    def year_abreviation(self):
        years = {1: '1er', 2:'2do',3:'3er',4:'4to',5:'5to',6:'6to'}
        return f'{years[self.number]} año'

    def __str__(self):
        return f'{self.number_choice} de {self.career}'