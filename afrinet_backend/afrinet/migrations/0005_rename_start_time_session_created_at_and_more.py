# Generated by Django 5.2.1 on 2025-05-10 09:15

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('afrinet', '0004_voucher_session_disconnected_at_session_is_active_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='session',
            old_name='start_time',
            new_name='created_at',
        ),
        migrations.RenameField(
            model_name='session',
            old_name='end_time',
            new_name='expires_at',
        ),
    ]
