# management/commands/check_expired_sessions.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from afrinet.models import Session

class Command(BaseCommand):
    help = 'Checks and expires old sessions'

    def handle(self, *args, **options):
        expired = Session.objects.filter(
            end_time__lte=timezone.now(),
            status='active'
        ).update(
            status='expired',
            is_active=False,
            disconnected_at=timezone.now()
        )
        self.stdout.write(f'Expired {expired} sessions')