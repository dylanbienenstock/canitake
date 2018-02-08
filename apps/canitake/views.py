# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render, redirect

def index(request):
	context = {
		"page": "home"
	}

	return render(request, "index.html", context)

def contribute(request):
	context = {
		"page": "contribute"
	}

	return render(request, "contribute.html", context)

def select_substance(request):
	context = {
		"page": "contribute"
	}

	return render(request, "select_substance.html", context)