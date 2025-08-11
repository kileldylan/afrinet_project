from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, HostspotUser, Payment, Session, Package, Voucher

class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'name', 'is_staff')
    search_fields = ('email', 'name')
    ordering = ('email',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('name', 'phone')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )

# Register models in the correct order
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(HostspotUser)
admin.site.register(Session)

@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ['package_id', 'package_name', 'price', 'duration_value', 'duration_unit', 'speed', 'popular']
    fields = ['package_id', 'package_name', 'price', 'duration_value', 'duration_unit', 'speed', 'popular']

@admin.register(Voucher)
class VoucherAdmin(admin.ModelAdmin):
    list_display = ('code', 'is_used', 'created_at', 'end_time')
    search_fields = ('code',)

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('package', 'mpesa_receipt', 'transaction_id', 'phone', 'created_at')
    search_fields = ('transaction_id',)