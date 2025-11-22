# Generated migration for adding file upload and AI detection support

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('courses', '0009_alter_course_ai_content_enabled'),
    ]

    operations = [
        # Add file upload fields to Assignment model
        migrations.AddField(
            model_name='assignment',
            name='attachment_file',
            field=models.FileField(blank=True, help_text='Assignment file (PDF, DOC, DOCX, TXT)', null=True,
                                   upload_to='assignment_attachments/'),
        ),
        migrations.AddField(
            model_name='assignment',
            name='attachment_filename',
            field=models.CharField(blank=True, max_length=255),
        ),

        # Add file upload fields to AssignmentSubmission model
        migrations.AddField(
            model_name='assignmentsubmission',
            name='file_name',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='assignmentsubmission',
            name='file_size',
            field=models.IntegerField(default=0, help_text='File size in bytes'),
        ),

        # Add AI detection fields to AssignmentSubmission model
        migrations.AddField(
            model_name='assignmentsubmission',
            name='ai_detection_score',
            field=models.DecimalField(blank=True, decimal_places=2, help_text='AI detection confidence (0-100)',
                                      max_digits=5, null=True),
        ),
        migrations.AddField(
            model_name='assignmentsubmission',
            name='ai_detection_result',
            field=models.JSONField(blank=True, default=dict, help_text='Detailed AI detection analysis'),
        ),
        migrations.AddField(
            model_name='assignmentsubmission',
            name='ai_detection_performed',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='assignmentsubmission',
            name='ai_detection_timestamp',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='assignmentsubmission',
            name='is_flagged_ai',
            field=models.BooleanField(default=False, help_text='Flagged as potentially AI-generated'),
        ),
        migrations.AddField(
            model_name='assignmentsubmission',
            name='flag_reason',
            field=models.TextField(blank=True),
        ),

        # Update file_upload field help text
        migrations.AlterField(
            model_name='assignmentsubmission',
            name='file_upload',
            field=models.FileField(blank=True, help_text='Submission file (PDF, DOC, DOCX, TXT)', null=True,
                                   upload_to='assignments/'),
        ),
    ]
