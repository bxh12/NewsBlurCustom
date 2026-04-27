from django.conf.urls import url

from apps.mobile import views

urlpatterns = [
    url(r"^$", views.index, name="mobile-index"),
    url(r"^push/subscribe/?$", views.register_push_subscription, name="mobile-push-subscribe"),
    url(r"^push/unsubscribe/?$", views.unregister_push_subscription, name="mobile-push-unsubscribe"),
]
