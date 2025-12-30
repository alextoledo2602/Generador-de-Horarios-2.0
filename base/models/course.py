from django.db import models
from django.core.exceptions import ValidationError
import re

class Course(models.Model):
    name = models.CharField(
        verbose_name='Nombre del curso',
        max_length=9,
        unique=True,
        help_text='Formato: YYYY-YYYY'
    )

    class Meta:
        verbose_name = "Curso"
        verbose_name_plural = "Cursos"
        ordering = ('name',)

    def clean(self):
        """Validar que el nombre del curso siga el formato esperado."""
        if not re.match(r'^\d{4}-\d{4}$', self.name):
            raise ValidationError('El nombre del curso debe estar en formato YYYY-YYYY.')
        
        start_year, end_year = map(int, self.name.split('-'))
        if end_year != start_year + 1:
            raise ValidationError('El segundo año debe ser el siguiente al primero (Ej: 2024-2025).')

    def __str__(self):
        return self.name
