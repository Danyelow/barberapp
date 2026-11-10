from django.urls import path

from . import views

urlpatterns = [
    path('health/', views.health, name='health'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/register/', views.register_view, name='register'),
    path('auth/me/', views.me_view, name='me'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('shops/', views.shops_view, name='shops'),
    path('shops/<int:pk>/', views.shop_detail_view, name='shop-detail'),
    path('availability/', views.availability_view, name='availability'),
    path('bookings/', views.bookings_view, name='bookings'),
    path('bookings/<int:pk>/', views.booking_detail_view, name='booking-detail'),
]
