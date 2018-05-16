# -*- coding: utf-8 -*-
import os
import sys
import json
from collections import OrderedDict
import shutil

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from core import helper

def initialise_app(project_root, app_root, app_name):
    remove_app(project_root, app_root, app_name)
    settings_py = os.path.join(project_root, "settings.py")
    #create app
    app_dir = os.path.join(app_root, app_name)
    app_dir = helper.make_dir(app_dir, re_create_dir=True)
    os.system("python manage.py startapp {:s} {:s}".format(app_name, app_dir))
    # create required directories
    static_dir = os.path.join(app_dir, "static", app_name)
    css_dir  =  os.path.join(static_dir, "css")
    js_dir  =  os.path.join(static_dir, "js")
    scss_dir  =  os.path.join(static_dir, "scss")
    template_dir = os.path.join(app_dir, "templates", app_name, )
    utils_dir = os.path.join(app_dir, "utils")
    helper.make_dir([static_dir, css_dir, js_dir, scss_dir, template_dir, utils_dir])
    package_content = OrderedDict({
        "name": app_name,
        "version": "1.0.0",
        "description": "Research work",
        "repository": "https://github.com/sabesantmv/civildeep.git",
        "homepage": "https://trademark.vision/",
        "license": "Contact author any re-production of this work.",
        "dependencies": {
            "node-sass": "^3.8.0",
            "nodemon": "^1.9.2"
        },
        "scripts": {
            "build-css": "node-sass scss/ -o css/",
            "watch-css": "nodemon --watch scss -x \"npm run build-css\"",
            "watch": "concurrently \"npm run watch-css\"",
            "build": "npm run build-css"
        }
    })
    package_json = os.path.join(static_dir, "package.json")
    with open(package_json, 'w') as fp:
        json.dump(package_content, fp, indent=2)

    
    app_config = app_name.title().replace("_", "") + "Config"
    app_config_data = "from __future__ import unicode_literals\nfrom django.apps import AppConfig\n\n\nclass {:s}(AppConfig):\n    name = '{:s}'".format(app_config, app_name)

    #app_config
    app_config_py  = os.path.join(app_dir, "apps.py")
    with open(app_config_py, 'w') as fp:
        fp.write(app_config_data)
    
    # write the app url file
    url_py  = os.path.join(app_dir, "urls.py")
    url_data = "from django.conf.urls import url\nfrom . import views\nurlpatterns = [\n\n]"
    with open(url_py, 'w') as fp:
        fp.write(url_data)
    #updated the setting if that is not already done
    with open(settings_py, 'r') as fp:
        settings_data = fp.read()
    
    if settings_data.find(app_config) < 0:
        updated_settings = settings_data.replace("INSTALLED_APPS = [\n", "INSTALLED_APPS = [\n    '" + app_name +".apps." + app_config  + "',\n")
        with open(settings_py, 'w') as fp:
            fp.write(updated_settings)
    #utils_init
    utils_init = os.path.join(utils_dir, "__init__.py")
    open(utils_init, 'w').close()

def remove_app(project_root, app_root, app_name):
    app_dir = os.path.join(app_root, app_name)
    shutil.rmtree(app_dir)
    settings_py = os.path.join(project_root, "settings.py")
    app_config = app_name.title().replace("_", "") + "Config"

    #updated the setting if that is not already done
    with open(settings_py, 'r') as fp:
        settings_data = fp.read()

    if settings_data.find(app_config) > 0:
        updated_settings = settings_data.replace("    '" + app_name + ".apps." + app_config  + "',\n", "")
        with open(settings_py, 'w') as fp:
            fp.write(updated_settings)

if __name__ == "__main__":
    
    project_root  = os.path.join(BASE_DIR, "www", "www")
    app_root = os.path.join(BASE_DIR, "www", "apps/")
    app_name = "cfss_fire"
    ## currently it is not cross verify and simply delete the existing file and create new fresh app. 
    ## be carefull on running this on the existing one
    
    # initialise_app(project_root, app_root, app_name)
    # remove_app(project_root, app_root, app_name)