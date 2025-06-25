from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Termin
from .serializers import TerminSerializer

@api_view(['GET', 'PUT'])
def termin_detail(request, id):
    try:
        termin = Termin.objects.get(id=id)
    except Termin.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = TerminSerializer(termin)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = TerminSerializer(termin, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
