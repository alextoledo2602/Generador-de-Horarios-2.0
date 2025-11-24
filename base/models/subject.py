from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

class Subject(models.Model):
    class SubjectType(models.TextChoices):
        SIMPLE = 'simple', _('Simple')
        OPTATIVA = 'optativa', _('Optativa')
        ELECTIVA = 'electiva', _('Electiva')

    name = models.CharField(verbose_name=_('nombre'),
                            max_length=80,
                            null=False,
                            blank=False,
                            )

    symbology = models.CharField(verbose_name=_('simbología'),
                                 max_length=4,
                                 null=False,
                                 blank=False,
                                 )
    teachers = models.ManyToManyField("base.Teacher", verbose_name=_('profesor(es)'), blank=True,)

    career = models.ForeignKey("base.Career", verbose_name=_(
        'carrera'), on_delete=models.CASCADE, null=False, blank=False)

    year = models.ForeignKey("base.Year", verbose_name=_(
        'año'), on_delete=models.CASCADE, null=False, blank=False)

    hours_found = models.PositiveIntegerField(verbose_name=_('fondo de horas'),
                                              null=False,
                                              blank=False,
                                              )
    type = models.CharField(verbose_name=_('tipo'),
                            choices=SubjectType.choices,
                            default=SubjectType.SIMPLE,
                            max_length=10,
                            null=False,
                            blank=False,
                            )

    class Meta:
        verbose_name = _("Asignatura")
        verbose_name_plural = _("Asignaturas")
        ordering = ('name',)
        constraints = [
            models.UniqueConstraint(
                name=_('unique_subject'),
                fields=['name', 'career', 'year'],
            ),
        ]

    def clean(self):
        if self.year.career != self.career:
            raise ValidationError({
                'year': _('El año seleccionado no pertenece a la carrera especificada.')
            })

        return super().clean()

    @property
    def type_choice(self):
        return self.SubjectType(self.type).label                                         

    @property
    def teachers_str(self):
        teachers = self.teachers.all()
        teachers_str = ''
        
        if teachers:
            for i in range(len(teachers)):
                if i < len(teachers)-1:
                    teachers_str += f'{teachers[i].name}, '
                else:
                    teachers_str += f'{teachers[i].name}'
        else:
            teachers_str = 'Sin profesor'
        return teachers_str

    def __str__(self):
        return f'{self.name} [{self.symbology}] ({self.teachers_str})'
