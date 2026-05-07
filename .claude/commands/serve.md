Start a local development server to test the PWA in the browser.

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

Note: Service Worker scope is `/fitness/` in production but `/` locally, so SW registration may behave differently. Test PWA install and offline behavior in production or via a tunneling tool (e.g. ngrok).
