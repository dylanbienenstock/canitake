from django.conf.urls import url
from django.contrib import admin
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    url(r'^contribute$', views.contribute),
    url(r'^$', views.index),
]
