from datetime import timezone
import routeros_api
from django.conf import settings

from .models import Session, HostspotUser

class MikroTik:
    def __init__(self):
        self.connection = None
        self.api = None
    
    def connect(self):
        if not self.connection:
            self.connection = routeros_api.RouterOsApiPool(
                host=settings.MIKROTIK_HOST,
                username=settings.MIKROTIK_USERNAME,
                password=settings.MIKROTIK_PASSWORD,
                port=settings.MIKROTIK_PORT,
                plaintext_login=True
            )
            self.api = self.connection.get_api()
        return self.api
    
    def sync_active_users(self):
        api = self.connect()
        hotspot_active = api.get_resource('/ip/hotspot/active')
        active_users = hotspot_active.get()
        
        # Update or create sessions
        for user in active_users:
            Session.objects.update_or_create(
                device_mac=user['mac-address'],
                defaults={
                    'ip_address': user['address'],
                    'user': HostspotUser.objects.filter(username=user['user']).first(),
                    'is_active': True,
                    'status': 'active'
                }
            )
        
        # Mark disconnected sessions
        active_macs = [u['mac-address'] for u in active_users]
        Session.objects.filter(is_active=True).exclude(device_mac__in=active_macs).update(
            is_active=False,
            status='disconnected',
            disconnected_at=timezone.now()
        )
        
        return len(active_users)
    
    def create_hotspot_user(self, username, password, profile='default'):
        api = self.connect()
        user = api.get_resource('/ip/hotspot/user')
        user.add(name=username, password=password, profile=profile)
        return True
    
    def generate_voucher(self, code, profile='voucher', uptime=None):
        api = self.connect()
        user = api.get_resource('/ip/hotspot/user')
        user.add(name=code, password=code, profile=profile, limit_uptime=uptime)
        return True