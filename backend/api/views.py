import requests
from bs4 import BeautifulSoup
from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Category, Content
from .serializers import CategorySerializer, ContentSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ContentViewSet(viewsets.ModelViewSet):
    queryset = Content.objects.all()
    serializer_class = ContentSerializer
    
    def perform_create(self, serializer):
        category_id = self.request.data.get('category')
        if category_id:
            serializer.save(category_id=category_id)
        else:
            serializer.save()

@api_view(['POST'])
def fetch_title(request):
    url = request.data.get('url')
    if not url:
        return Response({'error': 'URL is required'}, status=400)
    
    try:
        # 設定User-Agent避免被某些網站阻擋
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()  # 檢查HTTP錯誤
        
        # 使用BeautifulSoup解析HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        title = soup.title.string.strip() if soup.title else ''
        
        return Response({'title': title})
    except Exception as e:
        return Response({'error': str(e)}, status=500)