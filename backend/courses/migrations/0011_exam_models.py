# Generated migration for Exam and ExamAttempt models

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('courses', '0010_add_file_upload_ai_detection'),
        ('students', '0001_initial'),
        ('teachers', '0003_teacherprofile_average_rating_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Exam',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('exam_type', models.CharField(choices=[('Quiz', 'Quiz'), ('Mid', 'Mid Term'), ('Final', 'Final Exam')],
                                               default='Quiz', max_length=20)),
                ('total_marks', models.IntegerField(default=10)),
                ('duration_minutes', models.IntegerField(default=30)),
                ('due_date', models.DateTimeField()),
                ('questions_count', models.IntegerField(default=10)),
                ('status',
                 models.CharField(choices=[('draft', 'Draft'), ('published', 'Published'), ('completed', 'Completed')],
                                  default='draft', max_length=20)),
                ('questions_file',
                 models.FileField(blank=True, help_text='Questions file (PDF, DOC, DOCX, TXT)', null=True,
                                  upload_to='exam_questions/')),
                ('questions_filename', models.CharField(blank=True, max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='exams',
                                             to='courses.course')),
            ],
            options={
                'db_table': 'exams',
                'ordering': ['due_date'],
            },
        ),
        migrations.CreateModel(
            name='ExamAttempt',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('started_at', models.DateTimeField(auto_now_add=True)),
                ('submitted_at', models.DateTimeField(blank=True, null=True)),
                ('time_taken', models.DurationField(blank=True, null=True)),
                ('score', models.DecimalField(decimal_places=2, default=0.0, max_digits=5)),
                ('percentage', models.DecimalField(decimal_places=2, default=0.0, max_digits=5)),
                ('answer_file', models.FileField(blank=True, help_text='Answer file (PDF, DOC, DOCX, TXT)', null=True,
                                                 upload_to='exam_answers/')),
                ('answer_filename', models.CharField(blank=True, max_length=255)),
                ('answer_text', models.TextField(blank=True)),
                ('ai_detection_score',
                 models.DecimalField(blank=True, decimal_places=2, help_text='AI detection confidence (0-100)',
                                     max_digits=5, null=True)),
                ('ai_detection_result',
                 models.JSONField(blank=True, default=dict, help_text='Detailed AI detection analysis')),
                ('ai_detection_performed', models.BooleanField(default=False)),
                ('ai_detection_timestamp', models.DateTimeField(blank=True, null=True)),
                ('is_flagged_ai', models.BooleanField(default=False, help_text='Flagged as potentially AI-generated')),
                ('flag_reason', models.TextField(blank=True)),
                ('feedback', models.TextField(blank=True)),
                ('graded_at', models.DateTimeField(blank=True, null=True)),
                ('exam', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attempts',
                                           to='courses.exam')),
                ('graded_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL,
                                                to='teachers.teacherprofile')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='exam_attempts',
                                              to='students.studentprofile')),
            ],
            options={
                'db_table': 'exam_attempts',
                'ordering': ['-started_at'],
            },
        ),
    ]
