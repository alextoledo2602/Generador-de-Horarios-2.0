from django.shortcuts import render
from rest_framework import viewsets
from .serializer import GenericModelSerializer, RegisterSerializer
from .models import Task, Activity, Career, Course, Faculty, Period, ClassTime, DayNotAvailable, Teacher, Subject, Schedule, Year, WeekNotAvailable, LoadBalance

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .logic.logicaHorario import generar_horario

from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.serializers import ModelSerializer
from .permissions import IsAdminUserCustom, IsPlannerUser, ReadOnlyOrAdminOrPlanner
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes as api_permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# Create your views here.
# Diccionario para mapear nombres de modelos a clases de modelos
MODEL_MAP = {
    'tasks': Task,
    'activities': Activity,
    'careers': Career,
    'courses': Course,
    'faculties': Faculty,
    'periods': Period,
    'class_times': ClassTime,
    'days_not_available': DayNotAvailable,
    'teachers': Teacher,
    'subjects': Subject,
    'schedules': Schedule,
    'years': Year,
    'weeks_not_available': WeekNotAvailable,
    'load_balances': LoadBalance, 
}

class GenericModelViewSet(viewsets.ModelViewSet):
    serializer_class = GenericModelSerializer
    permission_classes = [ReadOnlyOrAdminOrPlanner]  # Solo lectura para usuarios comunes, acceso total para admin/planificador

    def get_serializer(self, *args, **kwargs):
        model = self.get_model()
        kwargs['model'] = model
        return self.get_serializer_class()(*args, **kwargs)

    def get_queryset(self):
        model = self.get_model()
        if model is None:
            return super().get_queryset()
        queryset = model.objects.all()
        # Filtrar por schedule si el modelo es ClassTime y el parámetro está presente
        if model.__name__ == "ClassTime":
            schedule_id = self.request.query_params.get("schedule")
            if schedule_id:
                queryset = queryset.filter(schedule_id=schedule_id)
        return queryset

    def get_model(self):
        model_name = self.kwargs.get('model_name')
        return MODEL_MAP.get(model_name)

@api_view(['POST'])
@api_permission_classes([IsAuthenticated, IsPlannerUser | IsAdminUserCustom])
def calculate_balance(request):
    data = request.data
    # Aquí va tu lógica con los datos recibidos
    print("Datos recibidos:", data)

    # Asignar valores a variables de Python
    subjects_symbology = data.get('subjectsSymbology')
    weeks_count = data.get('weeksCount')
    encounters_list = data.get('encountersList', [])
    time_base_list = data.get('timeBaseList', [])
    activities_list = data.get('activitiesList', [])
    above_list = data.get('aboveList', [])
    below_list = data.get('belowList', [])
    balance_below_list = data.get('balanceBelowList', [])
    period_id = data.get('periodId')  # Nuevo: obtener el id de periodo
    career_id = data.get('careerId')  # Nuevo: obtener el id de carrera
    year_id = data.get('yearId')      # Nuevo: obtener el id de año
    subject_ids = data.get('subjectIds', [])  # Nuevo: obtener ids de asignaturas

    print("Subjects symbology:", subjects_symbology)
    print("Weeks count:", weeks_count)
    print("Encounters list:", encounters_list)
    print("Time base list:", time_base_list)
    print("Activities list:", activities_list)
    print("Above list:", above_list)
    print("Below list:", below_list)
    print("Balance below list:", balance_below_list)
    print("Period id:", period_id)

    # --- NUEVO: Crear objeto Schedule ---
    from .models import Schedule, Period, Career, Year, Subject
    schedule = None
    schedule_id = None
    try:
        period = Period.objects.get(pk=period_id)
        career = Career.objects.get(pk=career_id)
        year = Year.objects.get(pk=year_id)
        schedule = Schedule.objects.create(
            career=career,
            year=year,
            period=period
        )
        # Asignar las asignaturas seleccionadas
        if subject_ids:
            subjects = Subject.objects.filter(pk__in=subject_ids)
            schedule.subjects.set(subjects)
        schedule_id = schedule.id
    except Exception as e:
        return Response({"error": f"Error creando el horario: {str(e)}"}, status=400)

    # Obtener la lista de días no disponibles por semana usando el id de periodo
    days_not_available_by_week = []
    if period_id:
        try:
            period = Period.objects.get(pk=period_id)
            days_not_available_by_week = period.days_not_available_by_week()
        except Period.DoesNotExist:
            days_not_available_by_week = []
    print("Days not available by week:", days_not_available_by_week)
    
    # Llamar a generar_horario con los nuevos argumentos
    generar_horario(
        subjects_symbology,
        time_base_list,
        weeks_count,
        balance_below_list,
        encounters_list,
        above_list,
        below_list,
        days_not_available_by_week,
        activities_list,
        schedule_id, 
        period_id,  
    )
    # Devuelve una respuesta (puede ser lo que tu lógica retorne)
    return Response({"message": "Balance calculado correctamente", "schedule_id": schedule_id})

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

# Vista para gestión de usuarios solo para admin
class UserAdminViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [IsAdminUserCustom]

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def whoami(request):
    user = request.user
    groups = list(user.groups.values_list('name', flat=True))
    return Response({
        "username": user.username,
        "groups": groups
    })

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Añadir los grupos del usuario al token
        token['groups'] = list(user.groups.values_list('name', flat=True))
        return token

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

from django.http import HttpResponse
import pdfkit
from django.template.loader import render_to_string
import os

def exportar_horario_pdf(request, schedule_id):
    from datetime import timedelta
    from django.utils import timezone
    from django.utils.dateparse import parse_date
    from django.db.models import Q
    import calendar

    # Obtener el horario y datos relacionados
    schedule = Schedule.objects.select_related('career', 'year', 'period').prefetch_related('subjects').get(pk=schedule_id)
    career = schedule.career
    year = schedule.year
    period = schedule.period
    course = period.course if hasattr(period, 'course') else None
    subjects = {s.id: s for s in schedule.subjects.all()}

    # Fechas de periodo
    start_date = period.start
    end_date = period.end

    # Días y semanas no disponibles
    dias_no_disponibles = list(DayNotAvailable.objects.filter(period=period))
    semanas_no_disponibles = list(WeekNotAvailable.objects.filter(period=period))

    # Construir rango de semanas válidas (lunes a viernes)
    weeks = []
    current = start_date - timedelta(days=start_date.weekday())  # lunes de la primera semana
    week_num = 1
    while current <= end_date:
        # Verificar si la semana está en semanas no disponibles
        unavailable = False
        for w in semanas_no_disponibles:
            if w.start_date <= current <= w.end_date:
                unavailable = True
                break
        if not unavailable:
            weeks.append({
                'weekNum': week_num,
                'start': current,
                'end': current + timedelta(days=4),
            })
            week_num += 1
        current += timedelta(weeks=1)

    # Días de la semana (lunes a viernes, sin sábado)
    dias_semana = [
        {'nombre': 'Lunes', 'index': 0},
        {'nombre': 'Martes', 'index': 1},
        {'nombre': 'Miércoles', 'index': 2},
        {'nombre': 'Jueves', 'index': 3},
        {'nombre': 'Viernes', 'index': 4},
    ]

    # Obtener todos los turnos de este horario
    class_times = list(ClassTime.objects.filter(schedule=schedule).select_related('subject', 'teacher'))
    # Calcular el máximo de turnos por día (para la estructura de la tabla)
    max_turnos = max([ct.number for ct in class_times], default=1)
    max_turnos = min(max_turnos, 6)

    # Último turno de la mañana (puedes ajustar si tienes lógica específica)
    last_shift_in_the_morning = 3

    # Mapear días no disponibles por fecha
    dias_libres = {d.day: d.reason for d in dias_no_disponibles}

    # Construir la estructura de la tabla: semanas x días x turnos
    full_classtimes = []
    for week in weeks:
        week_row = []
        for dia in dias_semana:
            fecha = week['start'] + timedelta(days=dia['index'])
            # Si el día es no disponible, dejar todos los turnos en blanco
            if fecha in dias_libres:
                week_row.append({'type': 'libre', 'fecha': fecha})
                continue
            # Obtener turnos para ese día
            turnos_dia = [ct for ct in class_times if ct.day == fecha]
            turnos_cells = []
            for i in range(1, max_turnos+1):
                turno = next((t for t in turnos_dia if t.number == i), None)
                if turno:
                    subject = turno.subject
                    teacher = turno.teacher
                    turno_dict = {
                        'subject_symb': getattr(subject, 'symbology', subject.name[:3] if subject else ''),
                        'subject_name': subject.name if subject else '',
                        'teacher_name': teacher.name if teacher else '',
                        'activities': '',
                        'group': '',
                        'room': '',
                    }
                else:
                    turno_dict = {
                        'subject_symb': '',
                        'subject_name': '',
                        'teacher_name': '',
                        'activities': '',
                        'group': '',
                        'room': '',
                    }
                turnos_cells.append(turno_dict)
            week_row.append({'type': 'turnos', 'turnos': turnos_cells, 'fecha': fecha})
        full_classtimes.append(week_row)

    # Leyenda de asignaturas y profesores (abreviatura y nombre)
    subjects_activities = []
    for subject in subjects.values():
        teacher_name = ''
        for ct in class_times:
            if ct.subject_id == subject.id and ct.teacher:
                teacher_name = ct.teacher.name
                break
        subjects_activities.append({
            'subject_symb': getattr(subject, 'symbology', subject.name[:3]),
            'subject_name': subject.name,
            'teacher_name': teacher_name,
        })

    # Calcular weeks_cols para la plantilla
    weeks_cols = len(weeks) * 6

    # --- AGRUPAR SEMANAS EN BLOQUES DE 4 PARA LA TABLA PDF ---
    def chunk_list(lst, n):
        return [lst[i:i + n] for i in range(0, len(lst), n)]

    weeks_blocks = chunk_list(weeks, 4)  # Cambiado de 5 a 4
    full_classtimes_blocks = chunk_list(full_classtimes, 4)  # Cambiado de 5 a 4

    # turnos_grid_blocks: lista de bloques, cada uno es lista de filas (turnos), cada fila es lista de celdas (4*5)
    turnos_grid_blocks = []
    for block_idx, week_block in enumerate(full_classtimes_blocks):
        block_grid = []
        for turno_idx in range(max_turnos):
            fila = []
            for week in week_block:
                for day in week:
                    if day['type'] == 'libre':
                        fila.append({'type': 'vacio'})
                    elif day['type'] == 'turnos':
                        turno = day['turnos'][turno_idx] if turno_idx < len(day['turnos']) else None
                        if turno and turno['subject_symb']:
                            fila.append({'type': 'turno', 'subject_symb': turno['subject_symb']})
                        else:
                            fila.append({'type': 'vacio'})
                    else:
                        fila.append({'type': 'vacio'})
            block_grid.append(fila)
        turnos_grid_blocks.append(block_grid)

    # Para la cabecera de fechas/días por bloque
    dates_by_row_of_weeks_blocks = chunk_list([
        {
            'weekNum': w['weekNum'],
            'start': w['start'].strftime('%d/%m/%Y'),
            'end': w['end'].strftime('%d/%m/%Y'),
        } for w in weeks
    ], 4)  # Cambiado de 5 a 4

    # weeks_cols_blocks: lista con el número de columnas de cada bloque (4*5, o menos si el último bloque tiene menos semanas)
    weeks_cols_blocks = [len(block) * 5 for block in weeks_blocks]

    # --- PREPARAR BLOQUES PARA EL TEMPLATE (sin filtros custom ni index en template) ---
    blocks = []
    num_blocks = len(weeks_cols_blocks)
    for i in range(num_blocks):
        blocks.append({
            'weeks_cols': weeks_cols_blocks[i],
            'dates_by_row': dates_by_row_of_weeks_blocks[i],
            'turnos_grid': turnos_grid_blocks[i],
            'is_first': i == 0,
            'is_last': i == num_blocks - 1,
        })

    # Construir contexto
    context = {
        'schedule': {
            'career': career.name,
            'year': getattr(year, 'number_choice', str(year)),
            'period': period.name,
            'course': course.name if course else '',
            'updated': timezone.now().strftime('%d/%m/%Y'),
        },
        'blocks': blocks,
        'last_shift_in_the_morning': last_shift_in_the_morning,
        'subjects_activities': subjects_activities,
        'max_turnos': max_turnos,
    }
    template_path = 'p4.html'
    html_string = render_to_string(template_path, context)
    wkhtmltopdf_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'wkhtmltopdf.exe')
    config = pdfkit.configuration(wkhtmltopdf=wkhtmltopdf_path)
    pdf = pdfkit.from_string(html_string, False, configuration=config)
    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="horario.pdf"'
    return response