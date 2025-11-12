from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0005_subject_and_approval_chain'),
    ]

    operations = [
        migrations.AddField(
            model_name='courseenrollment',
            name='approved_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
