from django.contrib import admin
from.models import User, Payment, Session, Package
# Register your models here.
admin.site.register(Package)
admin.site.register(User)
admin.site.register(Payment)
admin.site.register(Session)