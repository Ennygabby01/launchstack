from django.contrib import admin
from django.urls import path
from django.http import JsonResponse
from datetime import datetime


def health(request):
    return JsonResponse({'status': 'ok', 'timestamp': datetime.utcnow().isoformat()})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health),
]
