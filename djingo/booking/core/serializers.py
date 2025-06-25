from rest_framework import serializers
from .models import Termin

class TerminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Termin
        fields = '__all__'