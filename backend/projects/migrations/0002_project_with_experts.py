# Generated by Django 4.2.17 on 2025-02-04 07:57
from django.db import migrations, models
import django.db.models.deletion
class Migration(migrations.Migration):
    dependencies = [
        ('experts', '0001_initial'),
        ('projects', '0001_initial'),
    ]
    operations = [
        migrations.CreateModel(
            name='Project_with_experts',
            fields=[
                ('project_with_experts_id', models.AutoField(primary_key=True, serialize=False)),
                ('biograph', models.TextField()),
                ('expert_id', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='project_with_experts', to='experts.experts')),
                ('project_id', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='project_with_experts', to='projects.projects')),
            ],
            options={
                'db_table': 'project_with_experts',
            },
        ),
    ]