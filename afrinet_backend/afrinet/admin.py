from django.contrib import admin
from.models import User, Payment, Session, Package, Voucher

# Register your models here.
admin.site.register(Package)
admin.site.register(User)
admin.site.register(Payment)
admin.site.register(Session)

@admin.register(Voucher)
class VoucherAdmin(admin.ModelAdmin):
    list_display = ('code', 'is_used', 'created_at', 'expires_at')
    search_fields = ('code',)