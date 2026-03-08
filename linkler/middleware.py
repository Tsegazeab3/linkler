import json
import bleach
from django.utils.deprecation import MiddlewareMixin

class SanitizationMiddleware(MiddlewareMixin):
    """
    Global middleware to sanitize all incoming POST, PUT, and PATCH data.
    Uses 'bleach' to strip all HTML tags and prevent XSS attacks.
    """
    
    # Fields that should NEVER be sanitized (to avoid breaking passwords or tokens)
    EXCLUDED_FIELDS = ['password', 'password1', 'password2', 'token', 'access', 'refresh', 'secret', 'key']

    def process_request(self, request):
        # 0. SKIP if request contains files or is multipart (to prevent corrupting binary data)
        content_type = request.content_type or ''
        if request.FILES or 'multipart/form-data' in content_type:
            return None

        if request.method in ['POST', 'PUT', 'PATCH']:
            # 1. Handle Form Data (Multipart or URL-encoded)
            if request.POST:
                # We make it mutable to clean the values
                mutable_post = request.POST.copy()
                for key in mutable_post:
                    if key not in self.EXCLUDED_FIELDS:
                        value = mutable_post.get(key)
                        if isinstance(value, str):
                            mutable_post[key] = bleach.clean(value, tags=[], strip=True)
                request.POST = mutable_post

            # 2. Handle JSON Data (Common in DRF/React)
            if request.content_type == 'application/json' and request.body:
                try:
                    data = json.loads(request.body)
                    cleaned_data = self.sanitize_data(data)
                    # Update the internal body with cleaned JSON
                    request._body = json.dumps(cleaned_data).encode('utf-8')
                except (json.JSONDecodeError, AttributeError):
                    # If it's not valid JSON or can't be modified, skip it
                    pass

    def sanitize_data(self, data):
        """Recursively sanitize strings in dictionaries and lists."""
        if isinstance(data, dict):
            return {
                k: self.sanitize_data(v) if k not in self.EXCLUDED_FIELDS else v 
                for k, v in data.items()
            }
        elif isinstance(data, list):
            return [self.sanitize_data(item) for item in data]
        elif isinstance(data, str):
            return bleach.clean(data, tags=[], strip=True)
        return data
