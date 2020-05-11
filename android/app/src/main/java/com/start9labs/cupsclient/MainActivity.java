package com.start9labs.cupsmessenger;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;

import tor.plugin.TorPlugin;
import http.plugin.HttpPlugin;
import start9.webview.plugin.WebviewPlugin;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Initializes the Bridge
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      // Additional plugins you've installed go here
      // Ex: add(TotallyAwesomePlugin.class);
      add(TorPlugin.class);
      add(HttpPlugin.class);
      add(WebviewPlugin.class);
    }});
  }
}
