"""Mobile views: mobile app workspace rendering and asset delivery."""

import base64
import os

from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import render

from apps.notifications.models import MUserNotificationTokens
from apps.profile.models import Profile
from apps.reader.models import UserSubscription, UserSubscriptionFolders
from utils import json_functions as json
from utils import log as logging
from utils.user_functions import ajax_login_required, get_user


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


@ajax_login_required
@json.json_view
def register_push_subscription(request):
    """
    Register a device for push notifications.
    Accepts the subscription object from the Service Worker's PushManager.subscribe().
    """
    user = get_user(request)
    
    # Handle both JSON and form POST data
    if request.POST.get("subscription"):
        subscription_json = request.POST.get("subscription")
    else:
        subscription_json = json.dumps(request.POST)
    
    try:
        subscription = json.loads(subscription_json)
    except (ValueError, TypeError):
        return {"code": -1, "message": "Invalid subscription object"}
    
    if not subscription.get("endpoint"):
        return {"code": -1, "message": "Subscription endpoint is required"}
    
    # Get or create tokens object for this user
    tokens = MUserNotificationTokens.get_tokens_for_user(user.pk)
    
    # Store the web push subscription endpoint
    endpoint = subscription.get("endpoint")
    if endpoint not in tokens.web_subscriptions:
        tokens.web_subscriptions.append(endpoint)
        tokens.save()
        logging.user(user, "~FCRegistered web push subscription")
        return {"message": "Push subscription registered successfully"}
    
    return {"message": "Push subscription already registered"}


@ajax_login_required
@json.json_view
def unregister_push_subscription(request):
    """
    Unregister a device from push notifications.
    """
    user = get_user(request)
    
    endpoint = request.POST.get("endpoint")
    if not endpoint:
        return {"code": -1, "message": "Endpoint is required"}
    
    tokens = MUserNotificationTokens.get_tokens_for_user(user.pk)
    
    if endpoint in tokens.web_subscriptions:
        tokens.web_subscriptions.remove(endpoint)
        tokens.save()
        logging.user(user, "~FCUnregistered web push subscription")
        return {"message": "Push subscription unregistered successfully"}
    
    return {"message": "Subscription not found"}
