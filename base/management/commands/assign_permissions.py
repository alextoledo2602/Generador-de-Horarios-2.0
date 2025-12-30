from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group


class Command(BaseCommand):
    help = 'Asigna grupos de permisos a usuarios específicos'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--usernames',
            nargs='+',
            type=str,
            default=['superadmin', 'admin'],
            help='Lista de nombres de usuario a los que asignar permisos'
        )
        parser.add_argument(
            '--groups',
            nargs='+',
            type=str,
            default=['administrador', 'planificador'],
            help='Lista de grupos a asignar'
        )

    def handle(self, *args, **options):
        target_usernames = options['usernames']
        target_groups = options['groups']
        
        # Crear grupos si no existen
        group_objects = []
        for group_name in target_groups:
            group_obj, created = Group.objects.get_or_create(name=group_name)
            group_objects.append(group_obj)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Grupo "{group_name}" creado'))
        
        # Procesar cada usuario
        for username in target_usernames:
            try:
                user = User.objects.get(username=username)
                
                # Asignar todos los grupos especificados
                user.groups.add(*group_objects)
                user.save()
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Usuario "{username}" asignado a grupos: {", ".join(target_groups)}'
                    )
                )
                
            except User.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(
                        f' Usuario "{username}" no existe en la base de datos'
                    )
                )