from rest_framework import serializers
from api.models import Category, Content

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class ContentSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Content
        fields = [
            'id', 'title', 'link', 'description', 'priority', 
            'category', 'category_id', 'source_platform', 'is_favorite', 
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']