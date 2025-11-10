"""
Document AI Service - OCR and document processing using Google Cloud Document AI
"""
import os
from typing import Dict, Any, List
from google.cloud import documentai_v1 as documentai
from google.api_core.client_options import ClientOptions


class DocumentAIService:
    """
    Service for Document AI operations including OCR and structured data extraction
    """

    def __init__(self):
        self.project_id = os.getenv('GOOGLE_CLOUD_PROJECT', 'your-project-id')
        self.location = os.getenv('GOOGLE_CLOUD_LOCATION', 'us')
        self.processor_id = os.getenv('DOCUMENT_AI_PROCESSOR_ID', 'your-processor-id')

        # Initialize Document AI client
        try:
            opts = ClientOptions(api_endpoint=f"{self.location}-documentai.googleapis.com")
            self.client = documentai.DocumentProcessorServiceClient(client_options=opts)
        except Exception as e:
            print(f"Error initializing Document AI client: {e}")
            self.client = None

    def process_mark_sheet(self, file_content: bytes, mime_type: str = 'application/pdf') -> Dict[str, Any]:
        """
        Process scanned mark sheets using OCR and extract structured data
        
        Args:
            file_content: Binary content of the document
            mime_type: MIME type of the document
            
        Returns:
            Extracted marks and student information
        """
        if not self.client:
            return self._mock_mark_sheet_extraction()

        try:
            # Configure the process request
            name = self.client.processor_path(self.project_id, self.location, self.processor_id)

            # Create document
            raw_document = documentai.RawDocument(content=file_content, mime_type=mime_type)

            # Make request
            request = documentai.ProcessRequest(name=name, raw_document=raw_document)
            result = self.client.process_document(request=request)

            document = result.document

            # Extract text and entities
            extracted_data = {
                'full_text': document.text,
                'students': [],
                'subjects': [],
                'marks': []
            }

            # Process entities (if available)
            for entity in document.entities:
                entity_type = entity.type_
                entity_text = entity.mention_text

                if entity_type == 'student_name':
                    extracted_data['students'].append(entity_text)
                elif entity_type == 'subject':
                    extracted_data['subjects'].append(entity_text)
                elif entity_type == 'mark':
                    extracted_data['marks'].append(entity_text)

            # Parse structured marks
            structured_marks = self._parse_marks_from_text(document.text)
            extracted_data['structured_marks'] = structured_marks

            return extracted_data

        except Exception as e:
            print(f"Error processing mark sheet: {e}")
            return self._mock_mark_sheet_extraction()

    def process_application_form(self, file_content: bytes, mime_type: str = 'application/pdf') -> Dict[str, Any]:
        """
        Process application forms and extract structured information
        """
        if not self.client:
            return self._mock_application_extraction()

        try:
            name = self.client.processor_path(self.project_id, self.location, self.processor_id)
            raw_document = documentai.RawDocument(content=file_content, mime_type=mime_type)
            request = documentai.ProcessRequest(name=name, raw_document=raw_document)
            result = self.client.process_document(request=request)

            document = result.document

            # Extract form fields
            extracted_data = {
                'personal_info': {},
                'education': [],
                'contact': {},
                'full_text': document.text
            }

            # Process form fields
            for page in document.pages:
                if hasattr(page, 'form_fields'):
                    for field in page.form_fields:
                        field_name = self._get_text(field.field_name, document.text)
                        field_value = self._get_text(field.field_value, document.text)

                        # Categorize fields
                        if any(keyword in field_name.lower() for keyword in ['name', 'first', 'last']):
                            extracted_data['personal_info']['name'] = field_value
                        elif 'email' in field_name.lower():
                            extracted_data['contact']['email'] = field_value
                        elif 'phone' in field_name.lower():
                            extracted_data['contact']['phone'] = field_value
                        elif any(keyword in field_name.lower() for keyword in ['education', 'degree', 'school']):
                            extracted_data['education'].append({
                                'field': field_name,
                                'value': field_value
                            })

            return extracted_data

        except Exception as e:
            print(f"Error processing application form: {e}")
            return self._mock_application_extraction()

    def process_essay(self, file_content: bytes, mime_type: str = 'application/pdf') -> str:
        """
        Extract text from essay documents for automated grading
        """
        if not self.client:
            return self._mock_essay_text()

        try:
            name = self.client.processor_path(self.project_id, self.location, self.processor_id)
            raw_document = documentai.RawDocument(content=file_content, mime_type=mime_type)
            request = documentai.ProcessRequest(name=name, raw_document=raw_document)
            result = self.client.process_document(request=request)

            return result.document.text

        except Exception as e:
            print(f"Error processing essay: {e}")
            return self._mock_essay_text()

    def batch_process_documents(
            self,
            gcs_input_uri: str,
            gcs_output_uri: str,
            mime_type: str = 'application/pdf'
    ) -> str:
        """
        Process multiple documents in batch from Google Cloud Storage
        """
        if not self.client:
            return "batch_job_mock_id"

        try:
            name = self.client.processor_path(self.project_id, self.location, self.processor_id)

            # Configure batch process request
            gcs_document = documentai.GcsDocument(gcs_uri=gcs_input_uri, mime_type=mime_type)
            gcs_documents = documentai.GcsDocuments(documents=[gcs_document])
            input_config = documentai.BatchDocumentsInputConfig(gcs_documents=gcs_documents)

            output_config = documentai.DocumentOutputConfig(
                gcs_output_config=documentai.DocumentOutputConfig.GcsOutputConfig(
                    gcs_uri=gcs_output_uri
                )
            )

            request = documentai.BatchProcessRequest(
                name=name,
                input_documents=input_config,
                document_output_config=output_config
            )

            # Start batch process
            operation = self.client.batch_process_documents(request)

            # Return operation name for tracking
            return operation.operation.name

        except Exception as e:
            print(f"Error in batch processing: {e}")
            return "batch_job_error"

    def _get_text(self, element, full_text: str) -> str:
        """Extract text from document element"""
        if not element or not element.text_anchor:
            return ''

        response = ''
        for segment in element.text_anchor.text_segments:
            start_index = int(segment.start_index) if segment.start_index else 0
            end_index = int(segment.end_index) if segment.end_index else len(full_text)
            response += full_text[start_index:end_index]

        return response.strip()

    def _parse_marks_from_text(self, text: str) -> List[Dict[str, Any]]:
        """
        Parse structured marks from extracted text
        This is a simplified parser - in production, use more sophisticated NLP
        """
        import re

        marks = []
        lines = text.split('\n')

        for line in lines:
            # Look for patterns like "Math: 85" or "Physics 90"
            match = re.search(r'([A-Za-z\s]+)[\s:]+(\d{1,3})', line)
            if match:
                subject = match.group(1).strip()
                mark = int(match.group(2))

                if 0 <= mark <= 100:  # Validate mark range
                    marks.append({
                        'subject': subject,
                        'mark': mark
                    })

        return marks

    # Mock methods for when Document AI is not available

    def _mock_mark_sheet_extraction(self) -> Dict[str, Any]:
        """Mock mark sheet extraction"""
        return {
            'full_text': 'Student Mark Sheet\nStudent Name: John Doe\nMath: 85\nPhysics: 90\nChemistry: 88',
            'students': ['John Doe'],
            'subjects': ['Math', 'Physics', 'Chemistry'],
            'marks': ['85', '90', '88'],
            'structured_marks': [
                {'subject': 'Math', 'mark': 85},
                {'subject': 'Physics', 'mark': 90},
                {'subject': 'Chemistry', 'mark': 88}
            ]
        }

    def _mock_application_extraction(self) -> Dict[str, Any]:
        """Mock application form extraction"""
        return {
            'personal_info': {
                'name': 'Jane Smith'
            },
            'education': [
                {'field': 'High School', 'value': 'ABC High School'},
                {'field': 'Graduation Year', 'value': '2023'}
            ],
            'contact': {
                'email': 'jane.smith@example.com',
                'phone': '+1234567890'
            },
            'full_text': 'Application Form\nName: Jane Smith\nEmail: jane.smith@example.com'
        }

    def _mock_essay_text(self) -> str:
        """Mock essay text extraction"""
        return """
        This is a sample essay text extracted from a document.
        The essay discusses various topics related to education and technology.
        It demonstrates the integration of AI in learning systems.
        """


# Singleton instance
document_ai_service = DocumentAIService()
