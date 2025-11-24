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

            if model == Year:
                self.fields['number_choice'] = serializers.CharField(read_only=True)
            
            if model == Period:
                self.fields['number_of_weeks_excluding_unavailable'] = serializers.SerializerMethodField(read_only=True)
                self.fields['days_not_available_by_week'] = serializers.SerializerMethodField(read_only=True)

            if model == Schedule:
                self.fields['to_string'] = serializers.SerializerMethodField(read_only=True)

            rel_fields = [
                name for name, field in self.fields.items()
                if getattr(field, 'source', None) and field.source.endswith('_set')
            ]
            for rel_field in rel_fields:
                self.fields.pop(rel_field)

    def get_number_of_weeks_excluding_unavailable(self, obj):
        if isinstance(obj, Period):
            return obj.number_of_weeks_excluding_unavailable()
        return None

    def get_days_not_available_by_week(self, obj):
        if isinstance(obj, Period):
            return obj.days_not_available_by_week()
        return None

    def get_to_string(self, obj):
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
    role = serializers.CharField(write_only=True, required=False)
    id = serializers.IntegerField(read_only=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'email', 'groups', 'role')
        extra_kwargs = {
            'password': {'write_only': True, 'required': False, 'allow_blank': True}
        }

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if 'groups' not in rep:
            rep['groups'] = list(instance.groups.values_list('name', flat=True))
        return rep

    def create(self, validated_data):
        role = validated_data.pop('role', None)
        groups_data = validated_data.pop('groups', [])
        
        password = validated_data.get('password')
        if not password:
            raise serializers.ValidationError({"password": "La contraseña es requerida al crear un usuario"})
        
        user = User.objects.create_user(
            username=validated_data['username'],
            password=password,
            email=validated_data.get('email', '')
        )
        
        from django.contrib.auth.models import Group
        if role:
            try:
                group = Group.objects.get(name=role)
                user.groups.add(group)
            except Group.DoesNotExist:
                pass
        elif groups_data:
            user.groups.set(groups_data)
        
        return user
    
    def update(self, instance, validated_data):
        role = validated_data.pop('role', None)
        groups_data = validated_data.pop('groups', [])
        password = validated_data.pop('password', None)
        
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        
        if password and password.strip():
            instance.set_password(password)
        
        instance.save()
        
        from django.contrib.auth.models import Group
        if role:
            instance.groups.clear()
            try:
                group = Group.objects.get(name=role)
                instance.groups.add(group)
            except Group.DoesNotExist:
                pass
        elif groups_data:
            instance.groups.set(groups_data)
        
        return instance

