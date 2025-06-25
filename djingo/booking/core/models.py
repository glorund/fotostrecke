from django.db import models

class Termin(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name