# Generated by Django 5.2.1 on 2025-05-13 08:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('afrinet', '0010_remove_package_duration_package_duration_unit_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='voucher',
            name='phone_number',
            field=models.CharField(default='', max_length=50),
        ),
    ]
