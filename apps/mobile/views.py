"""Mobile views: mobile app workspace rendering and asset delivery."""

import base64
import os

from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import render

from apps.profile.models import Profile
from apps.reader.models import UserSubscription, UserSubscriptionFolders
from utils import json_functions as json
from utils import log as logging
from utils.user_functions import get_user


def index(request):
    """Mobile PWA workspace - serves the progressive web app interface"""
    if request.user.is_anonymous:
        from apps.reader.views import welcome
        
        # Get the welcome response tuple and render it properly
        context, template_name = welcome(request)
        return render(request, template_name, context)
    
    user = request.user
    feed_count = UserSubscription.objects.filter(user=request.user).count()
    preferences = json.decode(user.profile.preferences)
    
    logging.user(request, "~FBLoading mobile PWA")
    
    return render(request, "mobile/mobile_workspace.xhtml", {
        "user_profile": user.profile,
        "preferences": preferences,
        "feed_count": feed_count,
        "is_mobile": True,
    })
