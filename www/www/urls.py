"""www URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
import os
from django.contrib import admin
from django.conf.urls import url, include
from django.conf.urls.static import static
import importlib

from . import settings
from . import views

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', views.index, name='index'),
]

# add apps urls
apps_dir = os.path.join(settings.BASE_DIR, "apps")
apps = os.listdir(apps_dir)
for app in apps:
    try:
        app_url_str =  app +'.urls'
        importlib.import_module(app_url_str)
        app_url = url(r'^' + app + '/', include(app_url_str))
    except Exception as e:
        print("not be able to load {:s} due to {:s}".format(app, str(e)))
        app_url = url(r'^' + app + '/', views.index, name='main_index')

    urlpatterns.append(app_url)

# add static and media urls
urlpatterns +=  static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
