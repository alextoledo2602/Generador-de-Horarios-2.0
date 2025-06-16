from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Task, Activity, Career, Course, Faculty, Period, ClassTime, DayNotAvailable, Teacher, Subject, Schedule, Year, WeekNotAvailable, LoadBalance, class_room
from django.contrib.auth.models import User

class GenericModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = None  # Se asignará dinámicamente
        fields = '__all__'  # Serializar todos los campos

    def __init__(self, *args, **kwargs):
        """
        Permite definir dinámicamente el modelo en cada instancia del serializer.
        """
        model = kwargs.pop('model', None)  # Recibe el modelo como parámetro
        super().__init__(*args, **kwargs)
        if model:
            self.Meta.model = model 

            # Añadir campos específicos para el modelo Year
            if model == Year:
                self.fields['number_choice'] = serializers.CharField(read_only=True)
            
            # Añadir campo específico para el modelo Period
            if model == Period:
                self.fields['number_of_weeks_excluding_unavailable'] = serializers.SerializerMethodField(read_only=True)
                # Nuevo: Añadir days_not_available_by_week
                self.fields['days_not_available_by_week'] = serializers.SerializerMethodField(read_only=True)

            # Añadir campo específico para el modelo Schedule
            if model == Schedule:
                self.fields['to_string'] = serializers.SerializerMethodField(read_only=True)

            # Eliminar relaciones inversas automáticas (que DRF agrega por defecto)
            rel_fields = [
                name for name, field in self.fields.items()
                if getattr(field, 'source', None) and field.source.endswith('_set')
            ]
            for rel_field in rel_fields:
                self.fields.pop(rel_field)

    def get_number_of_weeks_excluding_unavailable(self, obj):
        # Solo para Period
        if isinstance(obj, Period):
            return obj.number_of_weeks_excluding_unavailable()
        return None

    def get_days_not_available_by_week(self, obj):
        # Solo para Period
        if isinstance(obj, Period):
            return obj.days_not_available_by_week()
        return None

    def get_to_string(self, obj):
        # Solo para Schedule
        if isinstance(obj, Schedule):
            return str(obj)
        return None

class RegisterSerializer(serializers.ModelSerializer):
    groups = serializers.SlugRelatedField(
        many=True,
        slug_field='name',
        queryset=User.groups.rel.related_model.objects.all(),
        required=False
    )
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'email', 'groups')
        extra_kwargs = {'password': {'write_only': True}}

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        # Asegura que siempre haya 'groups' como lista
        if 'groups' not in rep:
            rep['groups'] = list(instance.groups.values_list('name', flat=True))
        return rep

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', '')
        )
        return user

