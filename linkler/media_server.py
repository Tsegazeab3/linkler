from django.core.files.storage import default_storage
from django.http import Http404, FileResponse
from django.conf import settings
import os
import logging

logger = logging.getLogger(__name__)

def serve_media(request, path):
    """
    A simple view to serve media files during development 
    or in environments where Nginx isn't handling /media/.
    """
    full_path = os.path.join(settings.MEDIA_ROOT, path)
    
    # DEBUG LOGS
    print(f"--- MEDIA REQUEST ---")
    print(f"Requested Path: {path}")
    print(f"Calculated Full Path: {full_path}")
    print(f"File exists: {os.path.exists(full_path)}")
    
    if os.path.exists(full_path):
        try:
            return FileResponse(open(full_path, 'rb'))
        except Exception as e:
            print(f"Error opening file: {e}")
            raise Http404(f"Error serving file: {e}")
            
    print(f"File NOT found at {full_path}")
    raise Http404("Media file not found")
