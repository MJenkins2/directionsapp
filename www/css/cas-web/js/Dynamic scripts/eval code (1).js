//  Smart-App-Banner initialization code
$('<link/>', {
    rel: 'stylesheet',
    type: 'text/css',
    media: 'screen',
    href: '/cas-web/css/smart-app-banner.css'
}).appendTo('head');

$.getScript('/cas-web/js/smart-app-banner.js', function () {
    // Initialize SmartBanner properties
    new SmartBanner({
        daysHidden: 15, // days to hide banner after close button is clicked (defaults to 15)
        daysReminder: 90, // days to hide banner after "VIEW" button is clicked (defaults to 90)
        appStoreLanguage: 'us', // language code for the App Store (defaults to user's browser language)
        title: 'Hofstra Mobile',
        author: 'Hofstra University',
        button: 'View',
        store: {
            ios: 'On the App Store',
            android: 'In Google Play'
        },
        price: {
            ios: 'FREE',
            android: 'FREE'
        },
        icon: "/cas-web/images/DefaultIcon.png",  // Add an icon - full path to icon image if not using website icon image
        theme: 'ios'  // put platform type ('ios', 'android', etc.) here to force single theme on all device
    });
});
