import numpy as np
from pulp import *
import csv
import random
import copy
# Datos iniciales


def generar_horario(a,f,s,bs,enc,ub,lb,d,activ, schedule_id=None, period_id=None):

    class TabuSearch:
        def __init__(self, init_solution, n, m, h, Q, lbound=None, ubound=None):
            self.best_so_far = init_solution
            self.max_tabu = 20
            self.tabu_list = []
            self.n = n
            self.m = m
            self.h = h
            self.Q = Q
            self.lbound = lbound if lbound else [[0] * m for _ in range(n)]
            self.ubound = ubound if ubound else [[6] * m for _ in range(n)]


        def moves(self, solution):
            neighborhood = []
            recent = []
            neighborhood_size, counter = 0, 0
            N, M = 50, 100

            while neighborhood_size != N and counter != M:
                i = random.choice(range(self.n))
                s1, s2 = random.sample(range(self.m), 2)

                if (i, s1, s2) not in recent and (i, s1, s2) not in self.tabu_list:
                    candidate = copy.deepcopy(solution)
                    candidate[i][s1] += 1
                    candidate[i][s2] -= 1

                    # Verificación de restricciones
                    if candidate[i][s2] < 0:  # Evita turnos negativos
                        continue

                    # Verificar límites para la asignatura i en las semanas s1 y s2
                    total_s1 = solution[i][s1] + 1  # Turnos actuales más el que se agrega
                    total_s2 = solution[i][s2] - 1  # Turnos actuales menos el que se quita

                    if total_s1 > self.ubound[i][s1]:
                        continue

                    week_hour_constraint = True
                    for j in range(min(s1, s2), max(s1, s2) + 1):
                        if week_load(candidate, j, self.n, self.h) > self.Q[j]:
                            week_hour_constraint = False
                            break
                    
                    if week_hour_constraint:
                        neighborhood.append((candidate, (i, s1, s2)))
                        neighborhood_size += 1

                recent.append((i, s1, s2))
                counter += 1

            return neighborhood

        def objective(self, solution):
            loads = [week_load(solution, j, self.n, self.h) for j in range(self.m)]
            average_load = sum(loads) / float(len(loads))
            return sum((load - average_load) ** 2 for load in loads)

        def learn(self, num_iterations):
        
            for _ in range(num_iterations):
                neighborhood = self.moves(self.best_so_far)
                if not neighborhood:
                    continue

                candidates, tabu_moves = zip(*neighborhood)
                candidate_fitness = [self.objective(c) for c in candidates]
                best_candidate_idx = candidate_fitness.index(min(candidate_fitness))
                self.best_so_far = candidates[best_candidate_idx]
                
                self.tabu_list.insert(0, tabu_moves[best_candidate_idx])

                if len(self.tabu_list) > self.max_tabu:
                    self.tabu_list.pop()

        def get_balance(self):

            balance = [week_load(self.best_so_far, j, self.n, self.h) for j in range(self.m)]
            return balance

    def week_load(solution, j, n, h):
        load = 0
        for i in range(n):
            sup = sum(solution[i][:j+1])
            inf = sum(solution[i][:j])
            for k in range(inf, sup):
                load += h[i][k]
        return load

    # Función inicial para generar solución inicial
    def initial_solution(n, m, p, Q, h, lbound=None, ubound=None):
        if not lbound: lbound = [[0] * m] * n
        if not ubound: ubound = [[6] * m] * n

        #Se inicializa la matriz solucion
        x = [[0 for _ in range(m)] for _ in range(n)]
        meetings = p.copy()

        #Esta linea inicializa x con los valores minimos requeridos por lbound
        for i in range(n):
            for j in range(m):
                x[i][j] = lbound[i][j]
                meetings[i] -= lbound[i][j]
        
        total_meetings = sum(meetings)
        a=1
        while total_meetings > 0:
            print(f"x: {x}")
            flag = total_meetings
            for i in range(n):
                for j in range(m):
                    if meetings[i] > 0 and x[i][j] < ubound[i][j]:
                        print(f"{week_load(x, j, n, h)}, {Q[j]}")
                        if week_load(x, j, n, h) < Q[j]:
                            x[i][j] += 1
                            meetings[i] -= 1
                            total_meetings -= 1
                            print("total meetings", total_meetings)
                            
                        if meetings[i] == 0:
                            print(f"Se asignaron todos los turnos para la asignatura {i}")
                            break
            if a==1 and flag==total_meetings:
                print("entre")
                flag="ultima iteracion"
                a=0
            if flag==total_meetings:
                print(meetings, total_meetings, flag)
                print(f"No se pudieron asignar {total_meetings} turnos.")
                break
        return x



  #Recibimos el id del horario creado
    asignaturas=a
    fondo_horas = f
    num_semanas = int(s)
    print(f'esto es d: {d}')

    turnos_asignaturas = enc
    horas=[[2]*int(ele) for ele in turnos_asignaturas]
    print(turnos_asignaturas)
    lbound = lb
    ubound = ub
    print(f"lbound: {lbound}, ubound: {ubound}")
    opciones_turnos = [1, 2, 3, 4, 5, 6]
    turnos_por_dia = 3
    dias_por_semana = 5
    horas_por_turno = 2

    fondo_Total_asignaturas = sum(turnos_asignaturas)*2
    for t in opciones_turnos:
        capacidad= t*dias_por_semana*horas_por_turno*num_semanas - len(d)*2*t
        print(f" Capacidad: {capacidad} Turnos: {t} fondo_Total_asignaturas: {fondo_Total_asignaturas}")
        if capacidad >= fondo_Total_asignaturas:
            turnos_por_dia = t
            break

    turnos_por_semana = bs
    print(f"Turnos por semana: {turnos_por_semana}, turnos por dia: {turnos_por_dia}, horas por turno: {horas_por_turno}")
    # Generar solución inicial y ejecutar búsqueda tabú
    initial_sol = initial_solution(len(asignaturas), num_semanas, turnos_asignaturas, turnos_por_semana, horas, lbound, ubound)

    balance = TabuSearch(initial_sol, len(asignaturas), num_semanas, horas, turnos_por_semana, lbound, ubound)
    
    balance.learn(50)
    balance_carga = [list(fila) for fila in zip(*balance.best_so_far)]#Traspuesta para compaibilidad con el 3er codigo

    print(f'Balance: {balance_carga}')
    # Generar horario final
    dias_semana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
    num_dias = len(dias_semana)
    num_asignaturas = len(asignaturas)
    num_semanas = len(balance_carga)
    
    horario = [[[] for _ in range(num_dias)] for _ in range(num_semanas)]

    def asignatura_en_dia(horario_semana, dia, asignatura):
        return asignatura in horario_semana[dia]

    for semana in range(num_semanas):
        turnos_asignados = {asignatura: balance_carga[semana][i] for i, asignatura in enumerate(asignaturas)}
        dias_sin_clase = [semana_info['dia_semana'] for semana_info in d if semana_info['numero_semana'] == (semana+1)]
        print(dias_sin_clase, semana)
        turno_actual = 1  # Iniciamos con el primer turno
        while sum(turnos_asignados.values()) > 0:  # Mientras queden turnos por asignar
            for dia in range(num_dias):  # Iteramos por los días de la semana
                if dia in dias_sin_clase:  # Si el día no tiene clases, pasamos al siguiente día    
                    continue
                if turno_actual > turnos_por_dia:  # Si hemos completado todos los turnos posibles, pasamos a la siguiente iteración
                    break
            
                asignaturas_posibles = [asignatura for asignatura, turnos in turnos_asignados.items()
                                        if turnos > 0 and not asignatura_en_dia(horario[semana], dia, asignatura)]
                
                if not asignaturas_posibles:
                    asignaturas_posibles = [asignatura for asignatura, turnos in turnos_asignados.items() if turnos > 0]

                if asignaturas_posibles:
                    asignatura_seleccionada = random.choice(asignaturas_posibles)
                    horario[semana][dia].append(asignatura_seleccionada)
                    turnos_asignados[asignatura_seleccionada] -= 1
            
            turno_actual += 1  # Avanzamos al siguiente turno después de procesar todos los días
    
    print(f"Horario: {horario}")

    # --- GUARDAR EN BASE DE DATOS LOS TURNOS GENERADOS ---
    # Solo si se recibió schedule_id y period_id
    if schedule_id and period_id:
        from base.models import ClassTime, Schedule, Period, Subject, DayNotAvailable, WeekNotAvailable
        import datetime
        # Agregar importación de LoadBalance
        from base.models.load_balance import LoadBalance

        try:
            schedule = Schedule.objects.get(pk=schedule_id)
            period = Period.objects.get(pk=period_id)
        except Exception as e:
            print(f"Error obteniendo Schedule o Period: {e}")
            return

        # Obtener fechas de inicio y fin del periodo
        start_date = period.get_start()
        # Mapear simbología a id de asignatura
        subject_objs = schedule.subjects.all()
        symb_to_id = {subj.symbology: subj.id for subj in subject_objs}
        # NUEVO: Mapear id de asignatura a su objeto Subject
        id_to_subject = {subj.id: subj for subj in subject_objs}

        # Obtener días y semanas no disponibles
        days_not_available = set(
            DayNotAvailable.objects.filter(period=period).values_list('day', flat=True)
        )
        weeks_not_available = WeekNotAvailable.objects.filter(period=period)
        weeks_ranges = []
        for w in weeks_not_available:
            weeks_ranges.append((w.start_date, w.end_date))

        # Función para saber si una fecha está en una semana no disponible
        def is_in_unavailable_week(date):
            for start, end in weeks_ranges:
                if start <= date <= end:
                    return True
            return False

        # NUEVO: Crear diccionario de actividades por asignatura
        activities_tracker = {}
        for idx, (asignatura, actividades) in enumerate(zip(asignaturas, activ)):
            activities_tracker[asignatura] = {
                'activities': actividades,  # Lista de strings, cada string puede ser '', '1', '1,3', etc.
                'next_index': 0
            }

        # Recorrer el horario y crear los turnos
        current_date = start_date
        semana_idx = 0
        dias_semana = 5  # Lunes a Viernes
        dias_a_sumar = [0, 1, 2, 3, 4]  # Lunes a Viernes

        for semana in horario:
            # Calcular el lunes de la semana actual
            week_start = start_date + datetime.timedelta(weeks=semana_idx)
            # Saltar semanas no disponibles
            while is_in_unavailable_week(week_start):
                semana_idx += 1
                week_start = start_date + datetime.timedelta(weeks=semana_idx)
            for dia_idx, dia in enumerate(semana):
                # Calcular la fecha real de este día (lunes+0, martes+1, ...)
                fecha_dia = week_start + datetime.timedelta(days=dia_idx)
                # Saltar sábados y domingos
                if fecha_dia.weekday() > 4:
                    continue
                # Saltar días no disponibles
                if fecha_dia in days_not_available:
                    continue
                # Si el día está vacío, no crear turnos
                if not dia:
                    continue
                # Crear un turno por cada asignatura en el día
                for turno_idx, simbologia in enumerate(dia):
                    subject_id = symb_to_id.get(simbologia)
                    if not subject_id:
                        print(f"No se encontró asignatura con simbología {simbologia}")
                        continue

                    # NUEVO: Obtener la(s) actividad(es) para este turno
                    subject_activities = activities_tracker[simbologia]
                    activity_ids = []
                    if subject_activities['next_index'] < len(subject_activities['activities']):
                        activity_value = subject_activities['activities'][subject_activities['next_index']]
                        if activity_value != '':
                            from base.models import Activity
                            for symb in activity_value.split(','):
                                symb = symb.strip()
                                if symb:
                                    try:
                                        act = Activity.objects.get(symbology=symb)
                                        activity_ids.append(act.id)
                                    except Activity.DoesNotExist:
                                        print(f"No se encontró la actividad con simbología {symb}")
                        subject_activities['next_index'] += 1

                    # NUEVO: Obtener el id del profesor principal de la asignatura
                    teacher_id = None
                    subject_obj = id_to_subject.get(subject_id)
                    if subject_obj:
                        teachers_qs = subject_obj.teachers.all()
                        if teachers_qs.exists():
                            teacher_id = teachers_qs.first().id
                    # Crear el turno y asociar las actividades (ManyToMany)
                    classtime = ClassTime.objects.create(
                        day=fecha_dia,
                        number=turno_idx + 1,
                        schedule=schedule,
                        subject_id=subject_id,
                        teacher_id=teacher_id
                    )
                    if activity_ids:
                        classtime.activities.set(activity_ids)
            semana_idx += 1
        print("Turnos guardados en la base de datos correctamente.")

        # Guardar el balance de carga en LoadBalance
        try:
            LoadBalance.objects.create(
                balance=balance_carga,
                schedule=schedule
            )
            print("Balance de carga guardado correctamente.")
        except Exception as e:
            print(f"Error guardando el balance de carga: {e}")
