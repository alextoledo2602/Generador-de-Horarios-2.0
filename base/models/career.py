from django.db import models
from django.utils.translation import gettext_lazy as _


class Career(models.Model):
    
    class CourseType(models.TextChoices):
        CURSO_DIURNO = 'CD', _('Curso Diurno')
        CURSO_POR_ENCUENTRO = 'CE', _('Curso por Encuentro')

    name = models.CharField(verbose_name=_('nombre'),
                            max_length=100,
                            )

    course_type = models.CharField(verbose_name=_('tipo de curso'),
                                   choices=CourseType.choices,
                                   max_length=5,
                                   default=CourseType.CURSO_DIURNO,
                                   )

    faculty = models.ForeignKey("base.Faculty",
                                verbose_name=_('facultad'),
                                on_delete=models.CASCADE,
                                null=False,
                                blank=False,
                                )
    


    class Meta:
        verbose_name = _("Carrera")
        verbose_name_plural = _("Carreras")
        ordering = ('name',)
        constraints = [
            models.UniqueConstraint(
                name=_('unique_career'),
                fields=['name'],
            ),
        ]
    
    @property
    def course_type_choice(self):
        return self.CourseType(self.course_type).label
    
    def __str__(self):
        return f'{self.name}'
