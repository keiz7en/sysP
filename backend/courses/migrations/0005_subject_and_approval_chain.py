from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('teachers', '0002_teacher_approval_status'),
        ('courses', '0004_alter_course_options_alter_courseenrollment_options_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Subject',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('code', models.CharField(max_length=20, unique=True)),
                ('description', models.TextField(blank=True)),
                ('category', models.CharField(
                    choices=[
                        ('mathematics', 'Mathematics'),
                        ('science', 'Science'),
                        ('physics', 'Physics'),
                        ('chemistry', 'Chemistry'),
                        ('biology', 'Biology'),
                        ('computer_science', 'Computer Science'),
                        ('ai_ml', 'AI & Machine Learning'),
                        ('languages', 'Languages'),
                        ('social_studies', 'Social Studies'),
                        ('arts', 'Arts'),
                        ('commerce', 'Commerce'),
                        ('other', 'Other'),
                    ],
                    max_length=50
                )),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'subjects',
                'ordering': ['category', 'name'],
            },
        ),
        migrations.AddField(
            model_name='course',
            name='subject',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='courses', to='courses.subject'),
        ),
        migrations.AddField(
            model_name='course',
            name='status',
            field=models.CharField(
                choices=[
                    ('draft', 'Draft'),
                    ('pending', 'Pending Approval'),
                    ('approved', 'Approved'),
                    ('rejected', 'Rejected'),
                    ('active', 'Active'),
                    ('archived', 'Archived'),
                ],
                default='draft',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='course',
            name='is_open_for_enrollment',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='course',
            name='ai_content_enabled',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='course',
            name='syllabus_ai_generated',
            field=models.BooleanField(default=False),
        ),
        migrations.CreateModel(
            name='TeacherSubjectRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(
                    choices=[
                        ('pending', 'Pending'),
                        ('approved', 'Approved'),
                        ('rejected', 'Rejected'),
                    ],
                    default='pending',
                    max_length=20
                )),
                ('request_date', models.DateTimeField(auto_now_add=True)),
                ('approved_at', models.DateTimeField(blank=True, null=True)),
                ('rejection_reason', models.TextField(blank=True)),
                ('approved_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='approved_subject_requests', to=settings.AUTH_USER_MODEL)),
                ('subject', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='teacher_requests', to='courses.subject')),
                ('teacher', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subject_requests', to='teachers.teacherprofile')),
            ],
            options={
                'db_table': 'teacher_subject_requests',
                'ordering': ['-request_date'],
                'unique_together': {('teacher', 'subject')},
            },
        ),
        migrations.CreateModel(
            name='TeacherApprovedSubject',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('approved_date', models.DateTimeField(auto_now_add=True)),
                ('approved_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='subject_approvals', to=settings.AUTH_USER_MODEL)),
                ('subject', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='teacher_approvals', to='courses.subject')),
                ('teacher', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='approved_subjects', to='teachers.teacherprofile')),
            ],
            options={
                'db_table': 'teacher_approved_subjects',
                'unique_together': {('teacher', 'subject')},
            },
        ),
        migrations.AddField(
            model_name='courseenrollment',
            name='approved_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='approved_enrollments', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='courseenrollment',
            name='ai_features_unlocked',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='courseenrollment',
            name='ai_unlock_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='courseenrollment',
            name='rejection_reason',
            field=models.TextField(blank=True),
        ),
        migrations.AlterField(
            model_name='courseenrollment',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pending Teacher Approval'),
                    ('approved', 'Approved'),
                    ('rejected', 'Rejected'),
                    ('active', 'Active'),
                    ('completed', 'Completed'),
                    ('dropped', 'Dropped'),
                    ('suspended', 'Suspended'),
                ],
                default='pending',
                max_length=20
            ),
        ),
        migrations.AddConstraint(
            model_name='courseenrollment',
            constraint=models.UniqueConstraint(fields=['student', 'course'], name='unique_student_course'),
        ),
        migrations.AddIndex(
            model_name='course',
            index=models.Index(fields=['instructor', 'status'], name='courses_inst_status_idx'),
        ),
        migrations.AddIndex(
            model_name='course',
            index=models.Index(fields=['subject', 'status'], name='courses_subj_status_idx'),
        ),
        migrations.AddIndex(
            model_name='courseenrollment',
            index=models.Index(fields=['student', 'status'], name='enrollments_student_status_idx'),
        ),
        migrations.AddIndex(
            model_name='courseenrollment',
            index=models.Index(fields=['course', 'status'], name='enrollments_course_status_idx'),
        ),
    ]
