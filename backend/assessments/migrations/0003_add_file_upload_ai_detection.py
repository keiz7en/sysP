# Generated migration for adding file upload and AI detection support to assessments

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('assessments', '0002_initial'),
    ]

    operations = [
        # Add file upload fields to Assessment model
        migrations.AddField(
            model_name='assessment',
            name='questions_file',
            field=models.FileField(blank=True, help_text='Questions file (PDF, DOC, DOCX, TXT)', null=True,
                                   upload_to='exam_questions/'),
        ),
        migrations.AddField(
            model_name='assessment',
            name='questions_filename',
            field=models.CharField(blank=True, max_length=255),
        ),

        # Add file upload fields to StudentAnswer model
        migrations.AddField(
            model_name='studentanswer',
            name='answer_file',
            field=models.FileField(blank=True, help_text='Answer file (PDF, DOC, DOCX, TXT)', null=True,
                                   upload_to='student_answers/'),
        ),
        migrations.AddField(
            model_name='studentanswer',
            name='answer_filename',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='studentanswer',
            name='answer_file_size',
            field=models.IntegerField(default=0, help_text='File size in bytes'),
        ),

        # Add AI detection fields to StudentAnswer model
        migrations.AddField(
            model_name='studentanswer',
            name='ai_detection_score',
            field=models.DecimalField(blank=True, decimal_places=2, help_text='AI detection confidence (0-100)',
                                      max_digits=5, null=True),
        ),
        migrations.AddField(
            model_name='studentanswer',
            name='ai_detection_result',
            field=models.JSONField(blank=True, default=dict, help_text='Detailed AI detection analysis'),
        ),
        migrations.AddField(
            model_name='studentanswer',
            name='ai_detection_performed',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='studentanswer',
            name='ai_detection_timestamp',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='studentanswer',
            name='is_flagged_ai',
            field=models.BooleanField(default=False, help_text='Flagged as potentially AI-generated'),
        ),
        migrations.AddField(
            model_name='studentanswer',
            name='flag_reason',
            field=models.TextField(blank=True),
        ),
    ]
