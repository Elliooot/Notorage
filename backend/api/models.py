from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Content(models.Model):
    PRIORITY_CHOICES = [
        (1, 'Lowest'),
        (2, 'Low'),
        (3, 'Medium'),
        (4, 'High'),
        (5, 'Highest'),
    ]
    
    title = models.CharField(max_length=255)
    link = models.URLField()
    description = models.TextField(blank=True, null=True)
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=3)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='contents')
    source_platform = models.CharField(max_length=100, blank=True)
    is_favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title