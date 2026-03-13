import insights from '@hanzo/insights'

const INSIGHTS_APP_ID = 'phc_VjA2YNcSdMhTmTjNr98b27mkQUlSZMg5UWisnfeu10Z'
const INSIGHTS_HOST_URL = 'https://proxy-api.lux.network/ph'

export default {
    install(Vue, options) {
        Vue.prototype.$insights = insights.init(INSIGHTS_APP_ID, {
            loaded: (ph) => {
                if (!localStorage.getItem('consentsToAnalytics')) {
                    // opting out if no consent
                    ph.opt_out_capturing()
                }
            },
            api_host: INSIGHTS_HOST_URL,
            // By default users are opted in (and we show the cookie banner)
            opt_out_capturing_by_default: false,
            // This disables automatic capturing of user events for privacy concerns
            autocapture: false,
            // capture_pageview doesn't work for SPAs, so disable it (see useTrackPageview hook instead).
            capture_pageview: false,
            // Opt out of session recording for privacy concerns.
            disable_session_recording: true,
            // Used for storage of the User ID and other data needed to track users between sessions.
            persistence: 'cookie',
            // if this is true, Insights will automatically determine City, Region and Country data using
            // the IP address of the client
            ip: false,
            // Disable persisting user data across pages. This will disable cookies, session storage and local storage.
            disable_persistence: false,
            // disable_cookie is a fallback to disable_persistence, so disable cookies too.
            disable_cookie: false,
        })
    },
}
