from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    username = models.CharField(unique=True, max_length=150)

    def __str__(self):
        return self.username

class Cookie(models.Model):
    cookie_id = models.AutoField(primary_key=True)
    cookie_string = models.CharField(max_length=100000, null=False, blank=False)
    domain = models.CharField(max_length=100, null=False, blank=False)
    exp_time = models.PositiveIntegerField(null=False, blank=False)

class Factory(models.Model):
    production_id = models.AutoField(primary_key=True)
    cookie_id = models.ForeignKey(
        Cookie,
        related_name="produced_cookie",
        on_delete=models.CASCADE,
        null=False,
        blank=False,
    )
    producer_id = models.ForeignKey(
        User,
        related_name="producer",
        on_delete=models.CASCADE,
        null=False,
        blank=False,
    )

class Pass(models.Model):
    pass_id = models.AutoField(primary_key=True)
    cookie_id = models.ForeignKey(
        Cookie,
        related_name="requested_cookie",
        on_delete=models.CASCADE,
        null=False,
        blank=False,
    )
    consumer_id = models.ForeignKey(
        User,
        related_name="consumer",
        on_delete=models.CASCADE,
        null=False,
        blank=False,
    )
    ttl = models.PositiveIntegerField(null=False, blank=False)
