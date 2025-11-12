from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from courses.models import Subject

User = get_user_model()


class Command(BaseCommand):
    help = 'Initialize subjects for the course management system'

    def handle(self, *args, **options):
        subjects_data = [
            {
                'name': 'Mathematics',
                'code': 'MATH',
                'category': 'mathematics',
                'description': 'Mathematical concepts and problem solving'
            },
            {
                'name': 'Physics',
                'code': 'PHY',
                'category': 'physics',
                'description': 'Physics concepts and laws'
            },
            {
                'name': 'Chemistry',
                'code': 'CHEM',
                'category': 'chemistry',
                'description': 'Chemical concepts and reactions'
            },
            {
                'name': 'Biology',
                'code': 'BIO',
                'category': 'biology',
                'description': 'Biological concepts and life sciences'
            },
            {
                'name': 'Computer Science Fundamentals',
                'code': 'CS101',
                'category': 'computer_science',
                'description': 'Introduction to computer science'
            },
            {
                'name': 'AI & Machine Learning',
                'code': 'AI101',
                'category': 'ai_ml',
                'description': 'Introduction to artificial intelligence and machine learning'
            },
            {
                'name': 'Python Programming',
                'code': 'PY101',
                'category': 'computer_science',
                'description': 'Programming in Python'
            },
            {
                'name': 'Web Development',
                'code': 'WEB101',
                'category': 'computer_science',
                'description': 'Web development fundamentals'
            },
            {
                'name': 'Data Science',
                'code': 'DS101',
                'category': 'ai_ml',
                'description': 'Data science concepts and applications'
            },
            {
                'name': 'English Language',
                'code': 'ENG',
                'category': 'languages',
                'description': 'English language and literature'
            },
        ]
        
        created_count = 0
        for subject_data in subjects_data:
            subject, created = Subject.objects.get_or_create(
                code=subject_data['code'],
                defaults=subject_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f"Created subject: {subject.name}")
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f"Subject already exists: {subject.name}")
                )
        
        self.stdout.write(
            self.style.SUCCESS(f"\nSuccessfully created {created_count} new subjects")
        )
