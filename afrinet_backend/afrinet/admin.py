from django.contrib import admin
from.models import User, Payment, Session, Package, Voucher

# Register your models here.
admin.site.register(Package)
admin.site.register(User)
admin.site.register(Session)

@admin.register(Voucher)
class VoucherAdmin(admin.ModelAdmin):
    list_display = ('code', 'is_used', 'created_at', 'end_time')
    search_fields = ('code',)

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('package', 'transaction_id', 'phone_number', 'created_at')
    search_fields = ('transaction_id',)