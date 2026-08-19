package com.wolfion.app;

import android.content.res.Configuration;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

/**
 * On Android 15+ (targetSdk 35/36) edge-to-edge is force-enabled, so the WebView
 * draws underneath the status bar and gesture/navigation bar. Because this is a
 * remote-mirror app, CSS env(safe-area-inset-*) reports 0 on these devices, so the
 * web layer cannot pad itself. We fix it natively: pad the WebView by the real
 * system-bar + display-cutout insets so app content never overlaps the phone's
 * status icons / camera cutout, and paint that inset strip to match the active
 * light/dark theme background.
 */
public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    boolean isDark =
        (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK)
            == Configuration.UI_MODE_NIGHT_YES;

    // Match the web app: light --background ~ #FAFAFA, dark body ~ #050505.
    int stripColor = isDark ? Color.parseColor("#050505") : Color.parseColor("#FAFAFA");

    final View webView = getBridge().getWebView();
    if (webView != null) {
      // A View draws its background across its padding, so the inset strip picks
      // up this color while the rendered page is pushed below the bars.
      webView.setBackgroundColor(stripColor);
      webView.setFitsSystemWindows(false);

      ViewCompat.setOnApplyWindowInsetsListener(
          webView,
          (v, insets) -> {
            Insets bars =
                insets.getInsets(
                    WindowInsetsCompat.Type.systemBars()
                        | WindowInsetsCompat.Type.displayCutout());
            v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            return insets;
          });
      ViewCompat.requestApplyInsets(webView);

      // Ensure status/navigation bar icons are legible against the strip color.
      WindowInsetsControllerCompat controller =
          WindowCompat.getInsetsController(getWindow(), webView);
      controller.setAppearanceLightStatusBars(!isDark);
      controller.setAppearanceLightNavigationBars(!isDark);
    }
  }
}
