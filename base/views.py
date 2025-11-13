from django.shortcuts import render
from rest_framework import viewsets
from .serializer import GenericModelSerializer, RegisterSerializer
from .models import Task, Activity, Career, Course, Faculty, Period, ClassTime, DayNotAvailable, Teacher, Subject, Schedule, Year, WeekNotAvailable, LoadBalance, ClassRoom

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
    'class_rooms': ClassRoom, 
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
    print("===== DATOS RECIBIDOS EN BACKEND =====")
    print("Data completo:", data)

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
    group = data.get('group')
    class_room_id = data.get('classRoom')
    
    print(f"periodId: {period_id}")
    print(f"careerId: {career_id}")
    print(f"yearId: {year_id}")
    print(f"subjectIds: {subject_ids}")
    print(f"group: {group}")
    print(f"classRoom: {class_room_id}")
    print("=======================================")
    
    # Validar campos requeridos
    if not period_id:
        return Response({"error": "El campo 'periodId' es requerido"}, status=400)
    if not career_id:
        return Response({"error": "El campo 'careerId' es requerido"}, status=400)
    if not year_id:
        return Response({"error": "El campo 'yearId' es requerido"}, status=400)
    if not subject_ids or len(subject_ids) == 0:
        return Response({"error": "Debe seleccionar al menos una asignatura"}, status=400)
    if not group:
        return Response({"error": "El campo 'group' es requerido"}, status=400)
    if not class_room_id:
        return Response({"error": "El campo 'classRoom' es requerido"}, status=400)

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
    from .models import Schedule, Period, Career, Year, Subject, ClassRoom
    schedule = None
    schedule_id = None
    try:
        period = Period.objects.get(pk=period_id)
        career = Career.objects.get(pk=career_id)
        year = Year.objects.get(pk=year_id)
        class_room = None
        if class_room_id:
            class_room = ClassRoom.objects.get(pk=class_room_id)
        schedule = Schedule.objects.create(
            career=career,
            year=year,
            period=period,
            group=group,
            class_room=class_room
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
from django.templatetags.static import static
from django.contrib.staticfiles import finders
import base64
import mimetypes



def _collect_activities_for_schedule(schedule):
    """Devuelve una lista de dicts {'activity_name','symb'} con las actividades usadas en los ClassTime del schedule.
    Deduplica por (symb or name) y ordena por symb numérico cuando exista."""
    activities_map = {}
    try:
        class_times_qs = ClassTime.objects.filter(schedule=schedule).prefetch_related('activities')
    except Exception:
        class_times_qs = []
    for ct in class_times_qs:
        try:
            for a in ct.activities.all():
                sym = str(a.symbology) if getattr(a, 'symbology', None) is not None else ''
                key = sym or (a.name or '')
                activities_map.setdefault(key, {'activity_name': a.name, 'symb': sym})
        except Exception:
            continue

    def _sort_key(x):
        s = x[1].get('symb', '')
        try:
            return (0, int(s))
        except Exception:
            return (1, x[1].get('activity_name') or '')

    items = sorted(list(activities_map.items()), key=_sort_key)
    return [v for k, v in items]


def build_schedule_pdf_context(schedule_id, request=None):
    """Construye el contexto completo para las plantillas de PDF a partir de un schedule_id.
    Retorna un diccionario compatible con `plantilla_horario.html`.
    """
    from datetime import timedelta
    from django.utils import timezone
    from django.utils.dateparse import parse_date

    schedule = Schedule.objects.select_related('career', 'year', 'period').prefetch_related('subjects').get(pk=schedule_id)
    career = schedule.career
    year = schedule.year
    period = schedule.period
    course = period.course if hasattr(period, 'course') else None
    subjects = {s.id: s for s in schedule.subjects.all()}

    start_date = period.start
    end_date = period.end

    dias_no_disponibles = list(DayNotAvailable.objects.filter(period=period))
    semanas_no_disponibles = list(WeekNotAvailable.objects.filter(period=period))

    weeks = []
    current = start_date - timedelta(days=start_date.weekday())
    week_num = 1
    while current <= end_date:
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

    dias_semana = [
        {'nombre': 'Lunes', 'index': 0},
        {'nombre': 'Martes', 'index': 1},
        {'nombre': 'Miércoles', 'index': 2},
        {'nombre': 'Jueves', 'index': 3},
        {'nombre': 'Viernes', 'index': 4},
        {'nombre': 'Sábado', 'index': 5},
    ]

    # Traer turnos con subject, teacher y actividades
    class_times = list(
        ClassTime.objects.filter(schedule=schedule)
        .select_related('subject', 'teacher')
        .prefetch_related('activities')
    )
    max_turnos = max([ct.number for ct in class_times], default=1)
    max_turnos = min(max_turnos, 6)

    last_shift_in_the_morning = 3

    dias_libres = {d.day: d.reason for d in dias_no_disponibles}

    def _to_date_obj(x):
        if x is None:
            return None
        try:
            from datetime import date as _date, datetime as _datetime
        except Exception:
            _date = None
            _datetime = None
        if hasattr(x, 'date') and callable(x.date):
            try:
                return x.date()
            except Exception:
                pass
        if isinstance(x, str):
            try:
                return parse_date(x)
            except Exception:
                return None
        return x

    full_classtimes = []
    for week in weeks:
        week_row = []
        for dia in dias_semana:
            fecha_dt = week['start'] + timedelta(days=dia['index'])
            fecha = _to_date_obj(fecha_dt)
            if fecha in { _to_date_obj(k) for k in dias_libres.keys() }:
                week_row.append({'type': 'libre', 'fecha': fecha_dt})
                continue
            turnos_dia = [ct for ct in class_times if _to_date_obj(getattr(ct, 'day', None)) == fecha]
            turnos_cells = []
            for i in range(1, max_turnos+1):
                turno = next((t for t in turnos_dia if t.number == i), None)
                if turno:
                    subject = turno.subject
                    teacher = turno.teacher
                    try:
                        activities_qs = list(turno.activities.all())
                    except Exception:
                        activities_qs = []
                    activities_syms = []
                    for a in activities_qs:
                        if hasattr(a, 'symbology') and a.symbology is not None:
                            activities_syms.append(str(a.symbology))
                        else:
                            activities_syms.append((a.name or '')[:6])
                    turno_dict = {
                        'subject_symb': getattr(subject, 'symbology', subject.name[:3] if subject else ''),
                        'subject_name': subject.name if subject else '',
                        'teacher_name': teacher.name if teacher else '',
                        'activities': '/'.join(activities_syms) if activities_syms else '',
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

    while len(full_classtimes) < 24:
        full_classtimes.append([{'type': 'libre', 'fecha': None} for _ in range(6)])

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

    # activities_list via helper
    activities_list = _collect_activities_for_schedule(schedule)

    weeks_blocks = []
    def chunk_list(lst, n):
        return [lst[i:i + n] for i in range(0, len(lst), n)]

    weeks_blocks = chunk_list(weeks, 4)
    full_classtimes_blocks = chunk_list(full_classtimes, 4)

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
                        if turno and (turno.get('subject_symb') or turno.get('activities')):
                            fila.append({
                                'type': 'turno',
                                'subject_symb': turno.get('subject_symb'),
                                'subject_name': turno.get('subject_name'),
                                'activities': turno.get('activities', ''),
                            })
                        else:
                            fila.append({'type': 'vacio'})
                    else:
                        fila.append({'type': 'vacio'})
            block_grid.append(fila)
        turnos_grid_blocks.append(block_grid)

    dates_by_row_of_weeks_blocks = chunk_list([
        {
            'weekNum': w['weekNum'],
            'start': w['start'].strftime('%d/%m/%Y'),
            'end': w['end'].strftime('%d/%m/%Y'),
        } for w in weeks
    ], 4)

    weeks_cols_blocks = [len(block) * 6 for block in weeks_blocks]

    # Construir weeks_for_template (24 bloques)
    weeks_for_template = []
    max_weeks_to_show = 24
    for wi in range(max_weeks_to_show):
        if wi < len(full_classtimes):
            week_days = full_classtimes[wi]
            padded_week_days = []
            for d in range(6):
                if d < len(week_days):
                    padded_week_days.append(week_days[d])
                else:
                    padded_week_days.append({'type': 'libre', 'fecha': None})
            rows = []
            for r in range(6):
                row_cells = []
                for d in range(6):
                    day = padded_week_days[d]
                    if day.get('type') == 'turnos':
                        turnos = day.get('turnos', [])
                        if r < len(turnos):
                            turno = turnos[r]
                            subject_part = (
                                turno.get('subject_symb')
                                or (turno.get('subject_name')[:10] if turno.get('subject_name') else '')
                            )
                            activities_part = turno.get('activities', '')
                            if activities_part:
                                cell_text = subject_part + '/' + activities_part if subject_part else activities_part
                            else:
                                cell_text = subject_part
                            row_cells.append(cell_text)
                        else:
                            row_cells.append('')
                    else:
                        row_cells.append('')
                rows.append(row_cells)
            if wi < len(weeks):
                wk = weeks[wi]
                try:
                    title = f"{wk['start'].strftime('%d/%m/%Y')} al {wk['end'].strftime('%d/%m/%Y')}"
                except Exception:
                    title = ''
            else:
                title = ''
            weeks_for_template.append({'title': title, 'rows': rows})
        else:
            empty_rows = [['' for _ in range(6)] for _ in range(6)]
            weeks_for_template.append({'title': '', 'rows': empty_rows})

    # Padear legibles a 10 filas
    MAX_LEGEND_ROWS = 10
    subjects_activities_padded = subjects_activities[:MAX_LEGEND_ROWS]
    while len(subjects_activities_padded) < MAX_LEGEND_ROWS:
        subjects_activities_padded.append({'subject_symb': '', 'subject_name': '', 'teacher_name': ''})

    activities_list_padded = activities_list[:MAX_LEGEND_ROWS]
    while len(activities_list_padded) < MAX_LEGEND_ROWS:
        activities_list_padded.append({'activity_name': '', 'symb': ''})

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

    context = {
        'schedule': {
            'career': career.name,
            'year': getattr(year, 'number_choice', getattr(year, 'year_abreviation', str(year))),
            'period': period.name,
            'course': course.name if course else '',
            'updated': schedule.updated.strftime('%d/%m/%Y') if getattr(schedule, 'updated', None) else timezone.now().strftime('%d/%m/%Y'),
            'faculty': getattr(getattr(career, 'faculty', None), 'name', ''),
            'group': getattr(schedule, 'group', ''),
            'class_room': getattr(getattr(schedule, 'class_room', None), 'name', ''),
        },
        'blocks': blocks,
        'last_shift_in_the_morning': last_shift_in_the_morning,
        'subjects_activities': subjects_activities_padded,
        'activities_list': activities_list_padded,
        'max_turnos': max_turnos,
    }
    context['weeks'] = weeks_for_template
    return context


# ---
# Nueva función: exportar PDF usando Playwright y la misma plantilla HTML
def exportar_horario_pdf_playwright(request, schedule_id):
    print(f"===== EXPORTAR PDF: Schedule ID {schedule_id} =====")
    try:
        from playwright.sync_api import sync_playwright  # type: ignore
    except Exception as e:
        print(f"❌ Error importando Playwright: {str(e)}")
        return HttpResponse(
            "Playwright no está disponible en este entorno. Instálalo con 'pip install playwright' y luego ejecuta 'playwright install'.",
            status=503,
        )
    
    # Construir contexto completo y pasar a la plantilla
    try:
        context = build_schedule_pdf_context(schedule_id, request=request)
        print("✅ Contexto construido exitosamente")
    except Exception as e:
        print(f"❌ Error construyendo contexto: {str(e)}")
        import traceback
        traceback.print_exc()
        return HttpResponse(f"Error construyendo el contexto: {str(e)}", status=500)
    
    # Asegurar que 'weeks' existe y tiene 4 semanas con 6x6 celdas
    if not context.get('weeks') or len(context.get('weeks', [])) < 4:
        empty_weeks = []
        for _ in range(4):
            empty_weeks.append({'title': '', 'rows': [['' for _ in range(6)] for _ in range(6)]})
        context['weeks'] = empty_weeks
    
    template_path = 'plantilla_horario.html'
    try:
        html_string = render_to_string(template_path, context, request=request)
        print("✅ HTML renderizado exitosamente")
    except Exception as e:
        print(f"❌ Error renderizando template: {str(e)}")
        import traceback
        traceback.print_exc()
        return HttpResponse(f"Error renderizando template: {str(e)}", status=500)

    # Asegurar resolución correcta de rutas relativas insertando <base href="...">
    base_href = request.build_absolute_uri('/')
    if '<head>' in html_string:
        html_string = html_string.replace('<head>', f'<head><base href="{base_href}">', 1)
    else:
        html_string = f'<base href="{base_href}">{html_string}'

    try:
        print("🎭 Iniciando Playwright...")
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            try:
                page = browser.new_page()
                page.set_content(html_string, wait_until="networkidle")
                pdf_bytes = page.pdf(format="A4")
                print("✅ PDF generado exitosamente")
            finally:
                browser.close()
    except Exception as e:
        print(f"❌ Error con Playwright: {str(e)}")
        import traceback
        traceback.print_exc()
        return HttpResponse(f"Error generando PDF con Playwright: {str(e)}", status=500)

    response = HttpResponse(pdf_bytes, content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="horario_playwright.pdf"'
    print("===== PDF EXPORTADO EXITOSAMENTE =====")
    return response


# ---
# Nueva función: exportar imagen (PNG) usando Playwright y la misma plantilla HTML
def exportar_horario_imagen_playwright(request, schedule_id):
    print(f"===== EXPORTAR IMAGEN: Schedule ID {schedule_id} =====")
    try:
        from playwright.sync_api import sync_playwright  # type: ignore
    except Exception as e:
        print(f"❌ Error importando Playwright: {str(e)}")
        return HttpResponse(
            "Playwright no está disponible en este entorno. Instálalo con 'pip install playwright' y luego ejecuta 'playwright install'.",
            status=503,
        )

    # Construir contexto completo y pasar a la plantilla
    try:
        context = build_schedule_pdf_context(schedule_id, request=request)
        print("✅ Contexto construido exitosamente")
    except Exception as e:
        print(f"❌ Error construyendo contexto: {str(e)}")
        import traceback
        traceback.print_exc()
        return HttpResponse(f"Error construyendo el contexto: {str(e)}", status=500)
    
    # Asegurar que 'weeks' existe y tiene 4 semanas con 6x6 celdas
    if not context.get('weeks') or len(context.get('weeks', [])) < 4:
        empty_weeks = []
        for _ in range(4):
            empty_weeks.append({'title': '', 'rows': [['' for _ in range(6)] for _ in range(6)]})
        context['weeks'] = empty_weeks
    
    template_path = 'plantilla_horario.html'
    try:
        html_string = render_to_string(template_path, context, request=request)
        print("✅ HTML renderizado exitosamente")
    except Exception as e:
        print(f"❌ Error renderizando template: {str(e)}")
        import traceback
        traceback.print_exc()
        return HttpResponse(f"Error renderizando template: {str(e)}", status=500)

    # Asegurar resolución correcta de rutas relativas insertando <base href="...">
    base_href = request.build_absolute_uri('/')
    if '<head>' in html_string:
        html_string = html_string.replace('<head>', f'<head><base href="{base_href}">', 1)
    else:
        html_string = f'<base href="{base_href}">{html_string}'

    # Para evitar que el layout se mueva al tomar un screenshot, generamos primero un PDF
    # (Playwright aplica las reglas @page correctamente) y luego convertimos ese PDF a PNG
    # usando PyMuPDF (fitz) para obtener alta fidelidad y DPI controlado.
    try:
        import fitz  # PyMuPDF
        print("✅ PyMuPDF importado exitosamente")
    except Exception as e:
        print(f"❌ Error importando PyMuPDF: {str(e)}")
        return HttpResponse(
            "Se requiere 'pymupdf' para convertir PDF a imagen. Instálalo con 'pip install pymupdf'.",
            status=503,
        )

    try:
        print("🎭 Iniciando Playwright...")
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            try:
                page = browser.new_page()
                # Forzar estilos de impresión para que la plantilla con @page se aplique
                try:
                    page.emulate_media(media="print")
                except Exception:
                    pass
                page.set_content(html_string, wait_until="networkidle")
                # Generar PDF con Playwright (esto preserva exactamente la distribución A4)
                pdf_bytes = page.pdf(format="A4", print_background=True)
                print("✅ PDF generado exitosamente")
            finally:
                browser.close()
    except Exception as e:
        print(f"❌ Error con Playwright: {str(e)}")
        import traceback
        traceback.print_exc()
        return HttpResponse(f"Error generando PDF con Playwright: {str(e)}", status=500)

    # Convertir PDF -> PNG con PyMuPDF
    try:
        print("🖼️ Convirtiendo PDF a imagen...")
        # Abrir PDF desde bytes
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        page0 = doc.load_page(0)
        dpi = 300.0
        zoom = dpi / 72.0
        mat = fitz.Matrix(zoom, zoom)
        pix = page0.get_pixmap(matrix=mat, alpha=False)
        png_bytes = pix.tobytes("png")
        print("✅ Imagen PNG generada exitosamente")
    except Exception as e:
        print(f"❌ Error convirtiendo PDF a imagen: {str(e)}")
        import traceback
        traceback.print_exc()
        return HttpResponse(f"Error al convertir PDF a imagen: {str(e)}", status=500)

    response = HttpResponse(png_bytes, content_type='image/png')
    response['Content-Disposition'] = 'attachment; filename="horario_playwright.png"'
    print("===== IMAGEN EXPORTADA EXITOSAMENTE =====")
    return response