from django.urls import path
from .views import termin_detail

urlpatterns = [
    path('termin/<int:id>/', termin_detail),
]