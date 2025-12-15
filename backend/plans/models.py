from django.db import models

class Plan(models.Model):
    title = models.CharField(max_length=50)         # Free / Pro
    description = models.TextField()
    market_price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.title
