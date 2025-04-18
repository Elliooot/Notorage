from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ContentViewSet, fetch_title

router = DefaultRouter()
router.register('categories', CategoryViewSet)
router.register('contents', ContentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('fetch-title/', fetch_title, name='fetch-title'),
]