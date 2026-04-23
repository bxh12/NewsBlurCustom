// NewsBlur Mobile PWA Application
// Handles service worker registration, push notifications, and app initialization

(function() {
    'use strict';

    window.NEWSBLUR = window.NEWSBLUR || {};
    
    // Mobile Reader View
    NEWSBLUR.MobileReader = Backbone.View.extend({
        el: '#NB-mobile-container',
        
        events: {
            'click #NB-mobile-menu-toggle': 'toggleSidebar',
            'click #NB-mobile-sidebar-close': 'closeSidebar',
            'click #NB-mobile-overlay': 'closeSidebar',
            'click #NB-mobile-add-feed': 'addFeed',
            'click #NB-mobile-settings-btn': 'showSettings',
            'click #NB-mobile-logout-btn': 'logout',
            'click #NB-mobile-back-btn': 'backToStories',
            'click .NB-mobile-story-item': 'viewStory',
            'click .NB-filter-tab': 'filterStories',
            'click #NB-mobile-star-btn': 'toggleStar',
            'click #NB-mobile-mark-read-btn': 'markAsRead',
        },

        initialize: function() {
            this.currentView = 'stories';
            this.currentFilter = 'unread';
            this.stories = [];
            this.feeds = [];
            this.currentStory = null;
            
            console.log('[Mobile] Initializing NewsBlur Mobile Reader');
        },

        init: function() {
            // Register service worker
            this.registerServiceWorker();
            
            // Request notification permission
            this.requestNotificationPermission();
            
            // Load initial data
            this.loadFeeds();
            this.loadStories();
        },

        registerServiceWorker: function() {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/static/js/service-worker.js')
                    .then((registration) => {
                        console.log('[Mobile] Service Worker registered');
                    })
                    .catch((error) => {
                        console.warn('[Mobile] Service Worker registration failed:', error);
                    });
            }
        },

        requestNotificationPermission: function() {
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
            }
        },

        toggleSidebar: function(e) {
            e.preventDefault();
            $('#NB-mobile-sidebar').toggleClass('active');
            $('#NB-mobile-overlay').toggleClass('active');
        },

        closeSidebar: function(e) {
            if (e) e.preventDefault();
            $('#NB-mobile-sidebar').removeClass('active');
            $('#NB-mobile-overlay').removeClass('active');
        },

        addFeed: function(e) {
            e.preventDefault();
            const url = prompt('Enter feed URL:');
            if (url) this.subscribeToFeed(url);
        },

        logout: function(e) {
            e.preventDefault();
            if (confirm('Logout?')) window.location.href = '/account/logout/';
        },

        backToStories: function(e) {
            e.preventDefault();
            $('#NB-mobile-story-view').hide();
            $('#NB-mobile-stories-view').show();
        },

        viewStory: function(e) {
            e.preventDefault();
            const storyId = $(e.currentTarget).data('story-id');
            this.currentStory = _.find(this.stories, { id: storyId });
            if (this.currentStory) {
                this.renderStoryDetail();
                $('#NB-mobile-stories-view').hide();
                $('#NB-mobile-story-view').show();
            }
        },

        filterStories: function(e) {
            e.preventDefault();
            this.currentFilter = $(e.currentTarget).data('filter');
            $('.NB-filter-tab').removeClass('active');
            $(e.currentTarget).addClass('active');
            this.renderStories();
        },

        loadFeeds: function() {
            $.ajax({
                url: '/reader/feeds/',
                type: 'GET',
                dataType: 'json',
                success: (data) => {
                    this.feeds = data.feeds || [];
                    this.renderSidebar();
                },
            });
        },

        loadStories: function() {
            $.ajax({
                url: '/reader/feed/',
                type: 'GET',
                dataType: 'json',
                data: { read_filter: this.currentFilter },
                success: (data) => {
                    this.stories = data.stories || [];
                    this.renderStories();
                },
            });
        },

        subscribeToFeed: function(url) {
            $.ajax({
                url: '/reader/add_url/',
                type: 'POST',
                data: { url: url },
                success: () => {
                    this.closeSidebar();
                    this.loadFeeds();
                    this.loadStories();
                },
                error: () => alert('Failed to add feed'),
            });
        },

        renderSidebar: function() {
            const $list = $('#NB-mobile-feeds-list');
            $list.empty();
            this.feeds.forEach((feed) => {
                const unread = feed.unread || 0;
                $list.append(
                    $('<div>').addClass('NB-mobile-feed-item').data('feed-id', feed.id).append(
                        $('<span>').addClass('NB-mobile-feed-name').text(feed.feed_title),
                        unread > 0 ? $('<span>').addClass('NB-mobile-feed-unread').text(unread) : ''
                    )
                );
            });
        },

        renderStories: function() {
            const $list = $('#NB-mobile-stories-list');
            $list.empty();
            const stories = this.stories.filter((s) => {
                if (this.currentFilter === 'unread') return !s.read;
                if (this.currentFilter === 'starred') return s.starred;
                return true;
            });
            stories.forEach((story) => {
                $list.append(
                    $('<div>').addClass('NB-mobile-story-item').toggleClass('unread', !story.read).data('story-id', story.id).append(
                        $('<div>').addClass('NB-mobile-story-content').append(
                            $('<h4>').addClass('NB-mobile-story-title').text(story.title || 'Untitled'),
                            $('<p>').addClass('NB-mobile-story-feed').text(story.feed_title || 'Feed'),
                            $('<p>').addClass('NB-mobile-story-date').text(story.story_date || '')
                        )
                    )
                );
            });
        },

        renderStoryDetail: function() {
            if (!this.currentStory) return;
            $('#NB-mobile-story-title').text(this.currentStory.title || 'Untitled');
            $('#NB-mobile-story-feed').text(this.currentStory.feed_title || 'Feed');
            $('#NB-mobile-story-date').text(this.currentStory.story_date || '');
            $('#NB-mobile-story-body').html(this.currentStory.story_content || '');
            $('#NB-mobile-story-link').attr('href', this.currentStory.story_permalink);
        },
    });

})();
