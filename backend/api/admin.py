from django.contrib import admin
from api.models import Category, Content

# Register your models here.
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']

@admin.register(Content)
class ContentAdmin(admin.ModelAdmin):
    list_display = ['title', 'priority', 'category', 'source_platform', 'is_favorite', 'created_at']
    list_filter = ['priority', 'category', 'source_platform', 'is_favorite']
    search_fields = ['title', 'description']
    date_hierarchy = 'created_at'
    ordering = ['-created_at'] # Temp