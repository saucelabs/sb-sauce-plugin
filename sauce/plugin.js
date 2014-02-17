// Init namespace.
var sauce = {};

// Strings
// en
var m = builder.translate.locales['en'].mapping;
m.__sauce_settings = "Sauce Settings";
m.__sauce_username = "Sauce Username";
m.__sauce_access_key = "Sauce Access Key";
m.__sauce_lookup_access_key = "look up access key";
m.__sauce_get_account = "Don't have an account? Get one for free!";
m.__sauce_browser = "Browser";
m.__sauce_browser_1 = "Sel 1 Browser";
m.__sauce_browser_2 = "Sel 2 Browser";
m.__sauce_add_config_line = "Add";
m.__sauce_auto_show_job = "Automatically show Sauce jobs page";
m.__sauce_parallel = "Run multiple tests in parallel";
m.__sauce_parallel_disabled = "Parallel playback disabled when state is shared across suite"
m.__sauce_connection_error = "Unable to connect to the Sauce servers: {0}";
m.__sauce_on_os = "on";
m.__sauce_run_ondemand = "Run on Sauce OnDemand";
m.__sauce_run_suite_ondemand = "Run suite on Sauce OnDemand";
m.__sauce_account_exhausted = "Your OnDemand account has run out of minutes.";
m.__sauce_ondemand_connection_error = "Unable to connect to OnDemand: {0}";
m.__sauce_run_stopped = "Stopped";
m.__sauce_stopping = "Stopping...";
// de
m = builder.translate.locales['de'].mapping;
m.__sauce_settings = "Sauce: Einstellungen";
m.__sauce_username = "Sauce: Benutzername";
m.__sauce_access_key = "Sauce: Access Key";
m.__sauce_lookup_access_key = "Access Key abrufen ";
m.__sauce_get_account = "Gratis bei Sauce anmelden!";
m.__sauce_browser = "Browser";
m.__sauce_browser_1 = "Sel 1 Browser";
m.__sauce_browser_2 = "Sel 2 Browser";
m.__sauce_add_config_line = "Neue Zeile";
m.__sauce_auto_show_job = "Automatisch Abspiel-Details zeigen";
m.__sauce_parallel = "Mehrere Tests gleichzeitig abspielen";
m.__sauce_parallel_disabled = "Tests können nicht gleichzeitig abgespielt werden wenn Suites Daten teilen"
m.__sauce_connection_error = "Verbindung zum Server fehlgeschlagen: {0}";
m.__sauce_on_os = "auf";
m.__sauce_run_ondemand = "Auf Sauce OnDemand abspielen";
m.__sauce_run_suite_ondemand = "Suite auf Sauce OnDemand abspielen";
m.__sauce_account_exhausted = "Das OnDemand-Konto hat keine Minuten übrig.";
m.__sauce_ondemand_connection_error = "Verbindung zum Server fehlgeschlagen: {0}";
m.__sauce_run_stopped = "Gestoppt";
m.__sauce_stopping = "Stoppe...";

sauce.shutdown = function() {

};

sauce.loginManager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);

sauce.loginInfo = new Components.Constructor(
  "@mozilla.org/login-manager/loginInfo;1",
  Components.interfaces.nsILoginInfo,
  "init"
);

sauce.getCredentials = function() {
  // Migrate to new credentials storage system.
  var creds = sauce.getOldCredentials();
  if (creds.username && creds.accesskey) {
    sauce.setCredentials(creds.username, creds.accesskey);
    sauce.setOldCredentials("", "");
    return creds;
  }
  
  var logins = sauce.loginManager.findLogins(
    {},
    /*hostname*/      'chrome://seleniumbuilder',
    /*formSubmitURL*/ null,
    /*httprealm*/     'Sauce User Login'
  );
  
  for (var i = 0; i < logins.length; i++) {
    return {'username': logins[i].username, 'accesskey': logins[i].password};
  }
  return {'username': "", 'accesskey': ""};
};

sauce.setCredentials = function(username, accesskey) {
  var logins = sauce.loginManager.findLogins(
    {},
    /*hostname*/      'chrome://seleniumbuilder',
    /*formSubmitURL*/ null,
    /*httprealm*/     'Sauce User Login'
  );
  
  for (var i = 0; i < logins.length; i++) {
    sauce.loginManager.removeLogin(logins[i]);
  }
  
  var loginInfo = new sauce.loginInfo(
    /*hostname*/      'chrome://seleniumbuilder',
    /*formSubmitURL*/ null,
    /*httprealm*/     'Sauce User Login',
    /*username*/      username,
    /*password*/      accesskey,
    /*usernameField*/ "",
    /*passwordField*/ ""
  );
  sauce.loginManager.addLogin(loginInfo);
};

sauce.getOldCredentials = function() {
  return {
    username:
      (bridge.prefManager.prefHasUserValue("extensions.seleniumbuilder.plugins.sauce.username") ? bridge.prefManager.getCharPref("extensions.seleniumbuilder.plugins.sauce.username") : ""),
    accesskey:
      (bridge.prefManager.prefHasUserValue("extensions.seleniumbuilder.plugins.sauce.accesskey") ? bridge.prefManager.getCharPref("extensions.seleniumbuilder.plugins.sauce.accesskey") : "")
  };
};

sauce.setOldCredentials = function(username, accesskey) {
  bridge.prefManager.setCharPref("extensions.seleniumbuilder.plugins.sauce.username", username);
  bridge.prefManager.setCharPref("extensions.seleniumbuilder.plugins.sauce.accesskey", accesskey);
};

sauce.getBrowserOptionPrefs = function(sel2) {
  var prefName = sel2 ? "extensions.seleniumbuilder.plugins.sauce.browserOptions_sel2" : "extensions.seleniumbuilder.plugins.sauce.browserOptions_sel1";
  try {
    return JSON.parse(bridge.prefManager.prefHasUserValue(prefName) ? bridge.prefManager.getCharPref(prefName) : "{}");
  } catch (e) {
    return {};
  }
};

sauce.setBrowserOptionPrefs = function(sel2, os, browser, version) {
  var prefs = sauce.getBrowserOptionPrefs(sel2);
  prefs.os = os;
  if (!prefs.browsers) { prefs.browsers = {}; }
  if (!prefs.browsers[os]) { prefs.browsers[os] = {name: browser, versions: {}}; }
  prefs.browsers[os].name = browser;
  prefs.browsers[os].versions[browser] = version;
  var prefName = sel2 ? "extensions.seleniumbuilder.plugins.sauce.browserOptions_sel2" : "extensions.seleniumbuilder.plugins.sauce.browserOptions_sel1";
  try {
    bridge.prefManager.setCharPref(prefName, JSON.stringify(prefs));
  } catch (e) { /* ignore */ }
};

sauce.getBrowserOptionSettings = function(sel2) {
  var prefName = sel2 ? "extensions.seleniumbuilder.plugins.sauce.browserOptionSettings_sel2" : "extensions.seleniumbuilder.plugins.sauce.browserOptionSettings_sel1";
  try {
    return JSON.parse(bridge.prefManager.prefHasUserValue(prefName) ? bridge.prefManager.getCharPref(prefName) : "[]");
  } catch (e) {
    return [];
  }
};

sauce.setBrowserOptionSettings = function(sel2, settings) {
  var prefName = sel2 ? "extensions.seleniumbuilder.plugins.sauce.browserOptionSettings_sel2" : "extensions.seleniumbuilder.plugins.sauce.browserOptionSettings_sel1";
  try {
    bridge.prefManager.setCharPref(prefName, JSON.stringify(settings));
  } catch (e) { /* ignore */ }
};

sauce.getAutoShowJobPage = function() {
  return bridge.prefManager.prefHasUserValue("extensions.seleniumbuilder.plugins.sauce.autoshowjobpage") ? bridge.prefManager.getBoolPref("extensions.seleniumbuilder.plugins.sauce.autoshowjobpage") : true;
};

sauce.setAutoShowJobPage = function(asjp) {
  bridge.prefManager.setBoolPref("extensions.seleniumbuilder.plugins.sauce.autoshowjobpage", asjp);
};

sauce.getDoParallel = function() {
  return bridge.prefManager.prefHasUserValue("extensions.seleniumbuilder.plugins.sauce.doparallel") ? bridge.prefManager.getBoolPref("extensions.seleniumbuilder.plugins.sauce.doparallel") : true;
};

sauce.setDoParallel = function(dp) {
  bridge.prefManager.setBoolPref("extensions.seleniumbuilder.plugins.sauce.doparallel", dp);
};

sauce.settingspanel = {};
/** The dialog. */
sauce.settingspanel.dialog = null;
sauce.settingspanel.open = false;

sauce.settingspanel.browserListEntryID = 1;

sauce.doparallel = sauce.getDoParallel();
sauce.breakpointsWereEnabled = true;
sauce.restoreBreakpoints = false;
sauce.restoreParallel = false;
sauce.concurrency = 1;
sauce.mac_concurrency = 1;

sauce.storeAndDisableBreakpointsState = function() {
  if (!sauce.restoreBreakpoints) {
    sauce.breakpointsWereEnabled = builder.breakpointsEnabled;
    builder.breakpointsEnabled = false;
    sauce.restoreBreakpoints = true;
  }
};

sauce.restoreBreakpointsState = function() {
  if (sauce.restoreBreakpoints) {
    builder.breakpointsEnabled = sauce.breakpointsWereEnabled;
    sauce.restoreBreakpoints = false;
  }
};

sauce.addBrowserListEntry = function(sel2, sauceBrowsersTree1, sauceBrowsersTree2, os, browser, version) {
  var v = sel2 ? '2' : '1';
  var tree = sel2 ? sauceBrowsersTree2 : sauceBrowsersTree1;
  var id = 'sauce-browser-' + v + '-list-' + sauce.settingspanel.browserListEntryID++;
  jQuery('#sauce-browser-' + v + '-list').append(newNode('div', {'id': id},
    newNode('select', {'id': id + '-os'}), " ",
    newNode('select', {'id': id + '-browser'}), " ",
    newNode('select', {'id': id + '-version'}), " ",
    newNode('a', {'href': '#', 'click': function() { jQuery('#' + id).remove(); }}, 'x')
  ));
  sauce.populateOSDropdown(id + "-os", tree, sauce.getBrowserOptionPrefs(sel2));
  jQuery('#' + id + '-os').change(function() {
    sauce.populateBrowserDropdown(id + "-browser", tree, sauce.getBrowserOptionPrefs(sel2), jQuery("#" + id + "-os").val());
    sauce.populateVersionDropdown(id + "-version", tree, sauce.getBrowserOptionPrefs(sel2), jQuery("#" + id + "-os").val(), jQuery("#" + id + "-browser").val());
  });
  sauce.populateBrowserDropdown(id + "-browser", tree, sauce.getBrowserOptionPrefs(sel2), jQuery("#" + id + "-os").val());
  jQuery('#' + id + '-browser').change(function() {
    sauce.populateVersionDropdown(id + "-version", tree, sauce.getBrowserOptionPrefs(sel2), jQuery("#" + id + "-os").val(), jQuery("#" + id + "-browser").val());
  });
  sauce.populateVersionDropdown(id + "-version", tree, sauce.getBrowserOptionPrefs(sel2), jQuery("#" + id + "-os").val(), jQuery("#" + id + "-browser").val());
  if (os) {
    jQuery("#" + id + "-os").val(os);
    sauce.populateBrowserDropdown(id + "-browser", tree, sauce.getBrowserOptionPrefs(sel2), os);
  }
  if (browser) {
    jQuery("#" + id + "-browser").val(browser);
    sauce.populateVersionDropdown(id + "-version", tree, sauce.getBrowserOptionPrefs(sel2), jQuery("#" + id + "-os").val(), browser);
  }
  if (version) {
    jQuery("#" + id + "-version").val(version);
  }
};

sauce.getLimits = function(username, accesskey, cb) {
  jQuery.ajax(
    "https://" + username + ":" + accesskey + "@saucelabs.com/rest/v1/" + username + "/limits",
    {
      "headers": {"Authorization": "Basic " + btoa(username + ":" + accesskey)},
      success: function(ajr) {
        sauce.concurrency = ajr.concurrency;
        sauce.mac_concurrency = ajr.mac_concurrency;
        cb();
      },
      error: function() {
        cb();
      }
    }
  );
};

sauce.settingspanel.show = function(sel1, sel2, callback) {
  if (sauce.settingspanel.open) { return; }
  sauce.settingspanel.open = true;
  jQuery('#edit-rc-connecting').show();
  jQuery('#edit-panel').css('height', '29px');
  jQuery.ajax(
    "http://saucelabs.com/rest/v1/info/browsers",
    {
      success: function(sauceBrowsers1) {
        jQuery.ajax(
          "http://saucelabs.com/rest/v1/info/browsers/webdriver",
          {
            success: function(sauceBrowsers2) {
              var sauceBrowsersTree1 = sauce.browserOptionTree(sauceBrowsers1);
              var sauceBrowsersTree2 = sauce.browserOptionTree(sauceBrowsers2);
        
              jQuery('#edit-rc-connecting').hide();
              jQuery('#edit-panel').css('height', '');
              var credentials = sauce.getCredentials();
              sauce.settingspanel.dialog =
                newNode('div', {'class': 'dialog'},
                  newNode('h3', _t('__sauce_settings')),
                  newNode('table', {style: 'border: none;', id: 'rc-options-table'},
                    newNode('tr',
                      newNode('td', _t('__sauce_username') + " "),
                      newNode('td', newNode('input', {id: 'sauce-username', type: 'text', value: credentials.username, 'change': function() {
                        if (jQuery('#sauce-username').val() == "") {
                          jQuery('#sauce-account-link').show();
                        } else {
                          jQuery('#sauce-account-link').hide();
                        }
                      }}))
                    ),
                    newNode('tr',
                      newNode('td', _t('__sauce_access_key') + " "),
                      newNode('td', newNode('input', {id: 'sauce-accesskey', type: 'text', value: credentials.accesskey}))
                    ),
                    newNode('tr',
                      newNode('td', ""),
                      newNode('td', newNode('a', {'href': 'http://saucelabs.com/account/key', 'target': '_blank'}, "(" + _t('__sauce_lookup_access_key') + ")"))
                    ),
                    newNode('tr', {'id': 'sauce-account-link'},
                      newNode('td', ""),
                      newNode('td', newNode('a', {'href': 'http://saucelabs.com/signup', 'target': '_blank'}, "(" + _t('__sauce_get_account') + ")"))
                    ),
                    newNode('tr', {'id': 'sauce-browser-1-tr'},
                      newNode('td', {'style': 'vertical-align: top;'}, _t('__sauce_browser_1') + " "),
                      newNode('td',
                        newNode('div', {'id': 'sauce-browser-1-list'}),
                        newNode('a', {'class': 'button', 'id': 'sauce-browser-1-list-add', 'click': function() {sauce.addBrowserListEntry(false, sauceBrowsersTree1, sauceBrowsersTree2);}}, _t('__sauce_add_config_line'))
                      )
                    ),
                    newNode('tr', {'id': 'sauce-browser-2-tr'},
                      newNode('td', {'style': 'vertical-align: top;'}, _t('__sauce_browser_2') + " "),
                      newNode('td',
                        newNode('div', {'id': 'sauce-browser-2-list'}),
                        newNode('a', {'class': 'button', 'id': 'sauce-browser-2-list-add', 'click': function() {sauce.addBrowserListEntry(true, sauceBrowsersTree1, sauceBrowsersTree2);}}, _t('__sauce_add_config_line'))
                      )
                    ),
                    newNode('tr',
                      newNode('td', {'colspan': 2}, newNode('input', {'type':'checkbox', 'id': 'sauce-showjobpage'}), _t('__sauce_auto_show_job'))
                    ),
                    newNode('tr',
                      newNode('td', {'colspan': 2}, newNode('input', {'type':'checkbox', 'id': 'sauce-parallel'}), builder.shareSuiteState ? _t('__sauce_parallel_disabled') : _t('__sauce_parallel', sauce.concurrency))
                    )
                  ),
                  newNode('a', {'href': '#', 'class': 'button', 'id': 'sauce-ok', 'click': function() {
                    var username = jQuery('#sauce-username').val();
                    var accesskey = jQuery('#sauce-accesskey').val();
                    sauce.setCredentials(username, accesskey);
                    var dropdownValues = [];
                    jQuery('#sauce-browser-1-list select').each(function(i, dropdown) {
                      dropdownValues.push(jQuery(dropdown).val());
                    });
                    if (dropdownValues.length > 0) { sauce.setBrowserOptionSettings(false, dropdownValues); }
                    var browsers1 = [];
                    for (var i = 0; i < dropdownValues.length; i += 3) {
                      sauce.setBrowserOptionPrefs(false, dropdownValues[i], dropdownValues[i + 1], dropdownValues[i + 2]);
                      var option = sauce.getBrowserOptionChoice(sauceBrowsersTree1, dropdownValues[i], dropdownValues[i + 1], dropdownValues[i + 2]);
                      browsers1.push({'username': username, 'accesskey': accesskey, 'browserstring1': option.selenium_name, 'browserversion1': option.short_version, 'platform1': option.os, 'name': [dropdownValues[i], dropdownValues[i + 1], dropdownValues[i + 2]].join(" ")});
                    }
                    dropdownValues = [];
                    jQuery('#sauce-browser-2-list select').each(function(i, dropdown) {
                      dropdownValues.push(jQuery(dropdown).val());
                    });
                    if (dropdownValues.length > 0) { sauce.setBrowserOptionSettings(true, dropdownValues); }
                    var browsers2 = [];
                    for (var i = 0; i < dropdownValues.length; i += 3) {
                      sauce.setBrowserOptionPrefs(true, dropdownValues[i], dropdownValues[i + 1], dropdownValues[i + 2]);
                      var option = sauce.getBrowserOptionChoice(sauceBrowsersTree2, dropdownValues[i], dropdownValues[i + 1], dropdownValues[i + 2]);
                      browsers2.push({'username': username, 'accesskey': accesskey, 'browserstring2': option.api_name, 'browserversion2': option.short_version, 'platform2': option.os, 'name': [dropdownValues[i], dropdownValues[i + 1], dropdownValues[i + 2]].join(" ")});
                    }
                    sauce.setAutoShowJobPage(!!jQuery('#sauce-showjobpage').attr('checked'));
                    sauce.setDoParallel(!!jQuery('#sauce-parallel').attr('checked'));
                    sauce.doparallel = !!jQuery('#sauce-parallel').attr('checked') && !builder.shareSuiteState;
                    if (sauce.doparallel) {
                      sauce.storeAndDisableBreakpointsState();
                    }
                    sauce.settingspanel.hide();
                    if (callback) {
                      callback({
                        'username': username,
                        'accesskey': accesskey,
                        'sel1': browsers1,
                        'sel2': browsers2
                      });
                    }
                  }}, _t('ok')),
                  newNode('a', {'href': '#', 'class': 'button', 'id': 'sauce-cancel', 'click': function() {
                    sauce.settingspanel.hide();
                  }}, _t('cancel'))
                );
              builder.dialogs.show(sauce.settingspanel.dialog);
              if (sauce.runall.playing && callback) {
                jQuery('#sauce-ok').hide(); // Make the OK button for starting a new run invisible.
              }
              if (sauce.getAutoShowJobPage()) {
                jQuery('#sauce-showjobpage').attr('checked', 'checked');
              }
              if (sauce.getDoParallel() || sauce.restoreParallel) {
                jQuery('#sauce-parallel').attr('checked', 'checked');
                sauce.restoreParallel = false;
              }
              if (builder.shareSuiteState) {
                jQuery('#sauce-parallel').attr('disabled', 'disabled');
              }
              // Populate dialog.
              if (credentials.username != "") {
                jQuery('#sauce-account-link').hide();
              }
              if (sel1) {
                var settings = sauce.getBrowserOptionSettings(false);
                if (settings.length == 0) {
                  sauce.addBrowserListEntry(false, sauceBrowsersTree1, sauceBrowsersTree2);
                } else {
                  for (var i = 0; i < settings.length; i += 3) {
                    sauce.addBrowserListEntry(false, sauceBrowsersTree1, sauceBrowsersTree2, settings[i], settings[i + 1], settings[i + 2]);
                  }
                }
              } else {
                jQuery('#sauce-browser-1-tr').remove();
              }
              if (sel2) {
                var settings = sauce.getBrowserOptionSettings(true);
                if (settings.length == 0) {
                  sauce.addBrowserListEntry(true, sauceBrowsersTree1, sauceBrowsersTree2);
                } else {
                  for (var i = 0; i < settings.length; i += 3) {
                    sauce.addBrowserListEntry(true, sauceBrowsersTree1, sauceBrowsersTree2, settings[i], settings[i + 1], settings[i + 2]);
                  }
                }
              } else {
                jQuery('#sauce-browser-2-tr').remove();
              }
            },
            error: function(xhr, textStatus, errorThrown) {
              jQuery('#edit-rc-connecting').hide();
              alert(_t('__sauce_connection_error', errorThrown));
            }
          }
        );
      },
      error: function(xhr, textStatus, errorThrown) {
        jQuery('#edit-rc-connecting').hide();
        alert(_t('__sauce_connection_error', errorThrown));
      }
    }
  );
};

sauce.browserOptionName = function(entry) {
  return entry.long_name + " " + entry.short_version + " " + _t('__sauce_on_os') + " " + entry.os;
};

sauce.browserOptionTree = function(entries) {
  var tree = {};
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    if (!tree[e.os]) {
      tree[e.os] = {
        name: e.os,
        browsers: {}
      };
    }
    if (!tree[e.os].browsers[e.long_name]) {
      tree[e.os].browsers[e.long_name] = {
        name: e.long_name,
        versions: {}
      };
    }
    if (!tree[e.os].browsers[e.long_name].versions[e.short_version]) {
      tree[e.os].browsers[e.long_name].versions[e.short_version] = {
        name: e.short_version,
        entry: e,
        id: i
      };
    }
  }
  return tree;
};

sauce.populateOSDropdown = function(id, tree, prefs) {
  var def = sauce.getDefaultOSChoice(prefs);
  jQuery('#' + id).html('');
  for (var k in tree) {
    if (k == def) {
      jQuery('#' + id).append(newNode("option", {value: k, selected: "1"}, k));
    } else {
      jQuery('#' + id).append(newNode("option", {value: k}, k));
    }
  }
};

sauce.populateBrowserDropdown = function(id, tree, prefs, os) {
  var def = sauce.getDefaultBrowserChoice(prefs, tree, os);
  jQuery('#' + id).html('');
  for (var k in tree[os].browsers) {
    if (k == def) {
      jQuery('#' + id).append(newNode("option", {value: k, selected: "1"}, k));
    } else {
      jQuery('#' + id).append(newNode("option", {value: k}, k));
    }
  }
};

sauce.populateVersionDropdown = function(id, tree, prefs, os, browser) {
  var def = sauce.getDefaultVersionChoice(prefs, tree, os, browser);
  jQuery('#' + id).html('');
  for (var k in tree[os].browsers[browser].versions) {
    if (k == def) {
      jQuery('#' + id).append(newNode("option", {value: k, selected: "1"}, k));
    } else {
      jQuery('#' + id).append(newNode("option", {value: k}, k));
    }
  }
};

sauce.getBrowserOptionChoice = function(tree, os, browser, version) {
  return tree[os] && tree[os].browsers[browser] && tree[os].browsers[browser].versions[version] ? tree[os].browsers[browser].versions[version].entry : null;
};

sauce.getDefaultOSChoice = function(prefs) {
  return prefs.os || "Linux";
};

sauce.getDefaultBrowserChoice = function(prefs, tree, os) {
  if (prefs.browsers && prefs.browsers[os]) { return prefs.browsers[os].name; }
  if (tree[os] && tree[os].browsers["Firefox"]) { return "Firefox"; }
  return null;
};

function padVersionString(s) {
  return s.split(".").map(function(n) { return new Array(100 - n.length).join("0") + n; }).join(".");
}

sauce.getDefaultVersionChoice = function(prefs, tree, os, browser) {
  if (prefs.browsers && prefs.browsers[os] && prefs.browsers[os].versions && prefs.browsers[os].versions[browser]) { return prefs.browsers[os].versions[browser]; }
  if (tree[os] && tree[os].browsers[browser]) {
    var v = null;
    for (var k in tree[os].browsers[browser].versions) {
      if (v == null || padVersionString(v) < padVersionString(k)) { v = k; }
    }
    return v;
  }
  return null;
};

sauce.settingspanel.hide = function() {
  jQuery(sauce.settingspanel.dialog).remove();
  sauce.settingspanel.dialog = null;
  sauce.settingspanel.open = false;
};

sauce.runSel1ScriptWithSettings = function(result, callback, run) {
  jQuery('#edit-rc-connecting').show();
  jQuery.ajax(
    "http://" + result.username + ":" + result.accesskey + "@saucelabs.com/rest/v1/users/" + result.username + "/",
    {
      success: function(ajresult) {
        builder.suite.switchToScript(run.index);
        builder.stepdisplay.update();
        jQuery('#edit-rc-connecting').hide();
        if (ajresult.minutes <= 0) {
          alert(_t('__sauce_account_exhausted'));
        } else {
          var name = _t('sel2_untitled_run');
          if (builder.getScript().path) {
            var name = builder.getScript().path.path.split("/");
            name = name[name.length - 1];
            name = name.split(".")[0];
          }
          name = "Selenium Builder " + result.browserstring1 + " " + (result.browserversion1 ? result.browserversion1 + " " : "") + (result.platform1 ? result.platform1 + " " : "") + name;
          if (run.stopRequested) {
            if (!sauce.doparallel) { builder.views.script.onEndRCPlayback(); }
            jQuery("#script-num-" + run.runIndex).css('background-color', '#cccccc'); 
            jQuery("#script-num-" + run.runIndex + "-error").html(_t("__sauce_run_stopped")).show();
            return;
          }
          if (!sauce.doparallel) { builder.views.script.onStartRCPlayback(); }
          run.playbackRun = builder.selenium1.rcPlayback.run(
            {
              hostPort: "ondemand.saucelabs.com:80",
              browserstring: JSON.stringify({
                'username':        result.username,
                'access-key':      result.accesskey,
                'os':              result.platform1,
                'browser':         result.browserstring1,
                'browser-version': result.browserversion1,
                'name':            name
              }),
            },
            // Postrun callback
            function (runResult) {
              if (!sauce.doparallel) { builder.views.script.onEndRCPlayback(); }
              var data = null;
              if (runResult.success || !runResult.errormessage) {
                data = {"passed": runResult.success};
              } else {
                data = {"passed": runResult.success, 'custom-data': {'playback-error': runResult.errormessage}};
              }
              jQuery.ajax("https://" + result.username + ":" + result.accesskey + "@saucelabs.com/rest/v1/" + result.username + '/jobs/' + run.sessionId, {
                "cache": true,
                "type": "PUT",
                "contentType": "application/json",
                "data": JSON.stringify(data)
              });
              if (callback) {
                callback(runResult);
              }
            },
            // Start job callback
            function(rcResponse) {
              if (!sauce.doparallel) { builder.views.script.onConnectionEstablished(); }
              var sessionId = rcResponse.substring(3);
              run.sessionId = sessionId;
              if (sauce.getAutoShowJobPage()) {
                window.open("http://saucelabs.com/tests/" + sessionId,'_newtab');
              } else if (!sauce.doparallel) {
                var lnk = newNode('div', {'class': 'dialog', 'style': 'padding-top: 30px;'},
                  newNode('a', {'href': "http://saucelabs.com/jobs/" + sessionId, 'target': '_newtab'}, "Show job info")
                );
                builder.dialogs.show(lnk);
                var hide = function() { jQuery(lnk).remove(); builder.views.script.removeClearResultsListener(hide); };
                builder.views.script.addClearResultsListener(hide);
              }
            },
            sauce.doparallel ? function(r, script, step, stepIndex, state, message, error, percentProgress) { sauce.runall.updateScriptPlaybackState(run.runIndex, r, script, step, stepIndex, state, message, error, percentProgress); } : builder.stepdisplay.updateStepPlaybackState,
            run.initialVars,
            sauce.doparallel ? null : builder.views.script.onPauseRCPlayback
          );
        }
      },
      error: function(xhr, textStatus, errorThrown) {
        jQuery('#edit-rc-connecting').hide();
        alert(_t('__sauce_ondemand_connection_error', errorThrown));
      }
    }
  );
};

sauce.runSel2ScriptWithSettings = function(result, callback, run) {
  jQuery('#edit-rc-connecting').show();
  jQuery.ajax(
    "http://" + result.username + ":" + result.accesskey + "@saucelabs.com/rest/v1/users/" + result.username + "/",
    {
      success: function(ajresult) {
        builder.suite.switchToScript(run.index);
        builder.stepdisplay.update();
        jQuery('#edit-rc-connecting').hide();
        if (ajresult.minutes <= 0) {
          alert(_t('__sauce_account_exhausted'));
        } else {  
          if (run.stopRequested) {
            if (!sauce.doparallel) { builder.views.script.onEndRCPlayback(); }
            jQuery("#script-num-" + run.runIndex).css('background-color', '#cccccc'); 
            jQuery("#script-num-" + run.runIndex + "-error").html(_t("__sauce_run_stopped")).show();
            return;
          }
          if (!sauce.doparallel) { builder.views.script.onStartRCPlayback(); }
          run.playbackRun = builder.selenium2.rcPlayback.run(
            {
              hostPort: result.username + ":" + result.accesskey + "@ondemand.saucelabs.com:80",
              browserstring: result.browserstring2,
              browserversion: result.browserversion2,
              platform: result.platform2
            },
            // Postrun callback
            function (runResult) {
              if (!sauce.doparallel) { builder.views.script.onEndRCPlayback(); }
              var data = null;
              if (runResult.success || !runResult.errormessage) {
                data = {"passed": runResult.success};
              } else {
                data = {"passed": runResult.success, 'custom-data': {'playback-error': runResult.errormessage}};
              }
              jQuery.ajax("https://" + result.username + ":" + result.accesskey + "@saucelabs.com/rest/v1/" + result.username + '/jobs/' + run.sessionId, {
                "cache": true,
                "type": "PUT",
                "contentType": "application/json",
                "data": JSON.stringify(data)
              });
              if (callback) {
                callback(runResult);
              }
            },
            // Start job callback
            function(response) {
              if (!sauce.doparallel) { builder.views.script.onConnectionEstablished(); }
              run.sessionId = response.sessionId;
              if (sauce.getAutoShowJobPage()) {
                window.open("http://saucelabs.com/jobs/" + response.sessionId,'_newtab');
              } else if (!sauce.doparallel) {
                var lnk = newNode('div', {'class': 'dialog', 'style': 'padding-top: 30px;'},
                  newNode('a', {'href': "http://saucelabs.com/jobs/" + response.sessionId, 'target': '_newtab'}, "Show job info")
                );
                builder.dialogs.show(lnk);
                var hide = function() { jQuery(lnk).remove(); builder.views.script.removeClearResultsListener(hide); };
                builder.views.script.addClearResultsListener(hide);
              }
            },
            sauce.doparallel ? function(r, script, step, stepIndex, state, message, error, percentProgress) { sauce.runall.updateScriptPlaybackState(run.runIndex, r, script, step, stepIndex, state, message, error, percentProgress); } : builder.stepdisplay.updateStepPlaybackState,
            run.initialVars,
            sauce.doparallel ? null : builder.views.script.onPauseRCPlayback
          );
        }
      },
      error: function(xhr, textStatus, errorThrown) {
        jQuery('#edit-rc-connecting').hide();
        alert(_t('__sauce_ondemand_connection_error', errorThrown));
      }
    }
  );
};

builder.registerPostLoadHook(function() {  
  builder.gui.menu.addItem('file', _t('__sauce_settings'), 'file-sauce-settings', function() { sauce.settingspanel.show(true, true); });

  builder.gui.menu.addItem('run', _t('__sauce_run_ondemand'), 'run-sauce-ondemand', function() {
    jQuery('#edit-rc-connecting').show();
    sauce.settingspanel.show(/*sel1*/ false, /*sel2*/ true, function(result) {
      sauce.runall.run(result, false, result.username, result.accesskey);
    });
  });

  builder.gui.menu.addItem('run', _t('__sauce_run_ondemand'), 'run-sauce-ondemand-sel1', function() {
    jQuery('#edit-rc-connecting').show();
    sauce.settingspanel.show(/* sel1 */ true, /*sel2*/ false, function(result) {
      sauce.runall.run(result, false, result.username, result.accesskey);
    });
  });
  
  builder.gui.menu.addItem('run', _t('__sauce_run_suite_ondemand'), 'run-suite-ondemand', function() {
    // Figure out which settings panels need showing.
    var needs1 = false;
    var needs2 = false;
    for (var i = 0; i < builder.suite.scripts.length; i++) {
      if (builder.suite.scripts[i].seleniumVersion == builder.selenium1) {
        needs1 = true;
      } else {
        needs2 = true;
      }
    }
    jQuery('#edit-rc-connecting').show();
    sauce.settingspanel.show(/* sel1 */ needs1, /* sel2*/ needs2, function(result) {
      sauce.runall.run(result, true, result.username, result.accesskey);
    });
  });
});

builder.suite.addScriptChangeListener(function() {
  var script = builder.getScript();
  if (script && script.seleniumVersion === builder.selenium2) {
    jQuery('#run-sauce-ondemand').show();
    jQuery('#run-sauce-ondemand-sel1').hide();
  } else {
    jQuery('#run-sauce-ondemand').hide();
    jQuery('#run-sauce-ondemand-sel1').show();
  }
});

// Add Java exporters that talk to the Sauce infrastructure.
var to_add = [];
for (var name in builder.selenium2.io.lang_infos) {
  if (name.startsWith && name.startsWith("Java")) {
    to_add.push(name);
  }
}

function createDerivedInfo(name) {
  builder.selenium2.io.addDerivedLangFormatter(name, {
    name: name + "/Sauce On Demand",
    get_params: function(script, callback) { sauce.settingspanel.show(/* sel1 */ false, /* sel2 */ true, function(response) {
      response = response.sel2[0];
      if (response.browserstring2 == "internet explorer") {
        response.browserstring2 = "internetExplorer";
      }
      callback(response);
    }); },
    extraImports:
      "import java.net.URL;\n" +
      "import org.openqa.selenium.remote.DesiredCapabilities;\n" +
      "import org.openqa.selenium.remote.RemoteWebDriver;\n",
    driverVar:
      "RemoteWebDriver wd;",
    initDriver:
      "DesiredCapabilities caps = DesiredCapabilities.{browserstring2}();\n" +
      "            caps.setCapability(\"name\", \"{scriptName}\");\n" +
      "        wd = new RemoteWebDriver(\n" +
      "            new URL(\"http://{username}:{accesskey}@ondemand.saucelabs.com:80/wd/hub\"),\n" +
      "            caps);",
    junit_import_extra:
      "import com.saucelabs.common.SauceOnDemandAuthentication;\n" +
      "import com.saucelabs.common.SauceOnDemandSessionIdProvider;\n" +
      "import com.saucelabs.junit.SauceOnDemandTestWatcher;\n" +
      "import org.junit.Rule;\n" +
      "import org.junit.rules.TestName;\n",
    junit_class_extra: "implements SauceOnDemandSessionIdProvider ",
    junit_setup_extra: "        sessionId = wd.getSessionId().toString();\n",
    junit_fields_extra:
      "    private String sessionId;\n" +
      "    public SauceOnDemandAuthentication authentication = new SauceOnDemandAuthentication(\"{username}\", \"{accesskey}\");\n" +
      "    public @Rule SauceOnDemandTestWatcher resultReportingTestWatcher = new SauceOnDemandTestWatcher(this, authentication);\n" +
      "    public @Rule TestName testName = new TestName();\n" +
      "    @Override public String getSessionId() { return sessionId; }\n"
  });
};

for (var i = 0; i < to_add.length; i++) {
  createDerivedInfo(to_add[i]);
}

// Run suite feature
/**
 * Dialog that runs all scripts in the suite and keeps track of scripts being run.
 */
sauce.runall = {};
sauce.runall.dialog = null;

sauce.runall.scriptNames = [];
sauce.runall.runs = [];
sauce.runall.macRunIndex = -1;
sauce.runall.nonmacRunIndex = -1;
sauce.runall.mac_runs = [];
sauce.runall.nonmac_runs = [];

sauce.runall.info_p = null;
sauce.runall.scriptlist = null;
sauce.runall.stop_b = null;
sauce.runall.close_b = null;

sauce.runall.requestStop = false;
sauce.runall.playing = false;

sauce.runall.settings = null;

function makeViewResultLink(sid) {
  return newNode('a', {'class':"step-view", id:sid + "-view", style:"display: none", click: function(e) {
    window.bridge.getRecordingWindow().location = this.href;
    // We don't actually want the SB window to navigate to the script's page!
    e.preventDefault();
  }}, _t('view_run_result'));
}

sauce.runall.run = function(settings, runall, username, accesskey) {
  if (sauce.runall.playing) { return; }
  sauce.runall.hide();
  sauce.runall.playing = true;
  jQuery('#edit-suite-editing').hide();
  sauce.runall.requestStop = false;
  
  var scripts = [];
  var scriptIndexes = [];
  if (runall) {
    for (var i = 0; i < builder.suite.getScriptNames().length; i++) { scriptIndexes.push(i); }
    scripts = builder.suite.scripts;
  } else {
    scriptIndexes = [builder.suite.getSelectedScriptIndex()];
    scripts = [builder.getScript()];
  }
  sauce.runall.scriptNames = builder.suite.getScriptNames();
  builder.dialogs.runall.getAllRows(scripts, function(scriptsIndexToRows) {
    sauce.runall.runs = [];
    sauce.runall.mac_runs = [];
    sauce.runall.nonmac_runs = [];
    
    var ri = 0;
    for (var settingsIndex = 0; settingsIndex < settings.sel1.length; settingsIndex++) {
      for (var scriptIndex = 0; scriptIndex < scriptIndexes.length; scriptIndex++) {
        var script = builder.suite.scripts[scriptIndexes[scriptIndex]];
        if (script.seleniumVersion != builder.selenium1) { continue; }
        var rows = scriptsIndexToRows[scriptIndex];
        for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
          var row = rows[rowIndex];
          var name = sauce.runall.scriptNames[scriptIndexes[scriptIndex]] + " " + settings.sel1[settingsIndex].name;
          if (rows.length > 1) {
            name += " " + _t('row', rowIndex);
          }
          var isMac = settings.sel1[settingsIndex].platform1.startsWith("Mac");
          var new_run = {
            'name': name,
            'script': script,
            'settings': settings.sel1[settingsIndex],
            'index': scriptIndexes[settingsIndex],
            'sessionId': null,
            'complete': false,
            'runIndex': ri++,
            'mac': isMac,
            'playbackRun': null,
            'seleniumVersion': script.seleniumVersion,
            'stopRequested': false,
            'initialVars': row
          };
          sauce.runall.runs.push(new_run);
          (isMac ? sauce.runall.mac_runs : sauce.runall.nonmac_runs).push(new_run);
        }
      }
    }
    
    for (var settingsIndex = 0; settingsIndex < settings.sel2.length; settingsIndex++) {
      for (var scriptIndex = 0; scriptIndex < scriptIndexes.length; scriptIndex++) {
        var script = builder.suite.scripts[scriptIndexes[scriptIndex]];
        if (script.seleniumVersion != builder.selenium2) { continue; }
        var rows = scriptsIndexToRows[scriptIndex];
        for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
          var row = rows[rowIndex];
          var name = sauce.runall.scriptNames[scriptIndexes[scriptIndex]] + " " + settings.sel2[settingsIndex].name;
          if (rows.length > 1) {
            name += " " + _t('row', rowIndex);
          }
          var isMac = settings.sel2[settingsIndex].platform2.startsWith("Mac");
          var new_run = {
            'name': name,
            'script': script,
            'settings': settings.sel2[settingsIndex],
            'index': scriptIndexes[scriptIndex],
            'sessionId': null,
            'complete': false,
            'runIndex': ri++,
            'mac': isMac,
            'playbackRun': null,
            'seleniumVersion': script.seleniumVersion,
            'stopRequested': false,
            'initialVars': row
          };
          sauce.runall.runs.push(new_run);
          (isMac ? sauce.runall.mac_runs : sauce.runall.nonmac_runs).push(new_run);
        }
      }
    }
      
    sauce.runall.info_p = newNode('p', {id:'infop'}, _t('running_scripts'));
  
    // Display the scripts in a similar fashion to the steps are shown in the record interface.
    sauce.runall.scriptlist = newFragment();
  
    for (var i = 0; i < sauce.runall.runs.length; i++) {
      //var name = sauce.runall.scriptNames[sauce.runall.runs[i].index] + " " + sauce.runall.runs[i].settings.name;
      var name = sauce.runall.runs[i].name;
      var sid = 'script-num-' + i;

      sauce.runall.scriptlist.appendChild(
        newNode('div', {id: sid, 'class': 'b-suite-playback-script', style: 'padding: 2px; padding-left: 5px; padding-right: 5px; margin-bottom: 1px; border-radius: 5px;'},
          newNode('div',
            newNode('span', {}, name),
            makeViewResultLink(sid),
            newNode('div', {style:"width: 100px; height: 3px; background: #333333; display: none", id: i + "-run-progress-done"}),
            newNode('div', {style:"width: 0px; height: 3px; background: #bbbbbb; position: relative; top: -3px; left: 100px; display: none", id: i + "-run-progress-notdone"})
          ),
          newNode('div', {'class':"step-error", id:sid + "-error", style:"display: none"})
        )
      );
    }
  
    sauce.runall.stop_b = newNode('a', _t('stop'), {
      'class': 'button',
      click: function () {
        sauce.runall.stoprun();
      },
      href: '#stop'
    });
  
    sauce.runall.close_b = newNode('a', _t('close'), {
      'class': 'button',
      click: function () {
        sauce.runall.hide();
      },
      href: '#close'
    });
  
    sauce.runall.dialog = newNode('div', {'class': 'dialog'});
    jQuery(sauce.runall.dialog)
      .append(sauce.runall.info_p)
      .append(sauce.runall.scriptlist)
      .append(newNode('p',
        newNode('span', {id: 'suite-playback-stop'}, sauce.runall.stop_b),
        newNode('span', {id: 'suite-playback-close', style: 'display: none;'}, sauce.runall.close_b)
      ));
      
    sauce.runall.macRunIndex = -1; // Will get incremented to 0 in runNext.
    sauce.runall.nonmacRunIndex = -1; // Will get incremented to 0 in runNext.
    
    if (sauce.runall.runs.length == 1 && sauce.doparallel) {
      sauce.doparallel = false;
      sauce.restoreParallel = true; // Only turning off parallel for this run.
      sauce.runall.dialog = null;
    } else {
      builder.dialogs.show(sauce.runall.dialog);
    }
  
    if (sauce.doparallel) {
      sauce.getLimits(username, accesskey, function() {
        var macEnabled = Math.min(sauce.mac_concurrency, sauce.runall.mac_runs.length);
        var nonMacEnabled = Math.min(sauce.concurrency - macEnabled, sauce.runall.nonmac_runs.length);
        for (var i = 0; i < macEnabled; i++) {
          sauce.runall.runNext(/*mac*/true);
        }
        for (var i = 0; i < nonMacEnabled; i++) {
          sauce.runall.runNext(/*mac*/false);
        }
      });
    } else {
      sauce.runall.runNext();
    }
  });
};

sauce.runall.updateScriptPlaybackState = function(runIndex, run, script, step, stepIndex, state, message, error, percentProgress) {
  if (state == builder.stepdisplay.state.SUCCEEDED || state == builder.stepdisplay.state.FAILED || state == builder.stepdisplay.state.ERROR)
  {
    sauce.runall.setprogress(runIndex, 1 + (stepIndex + 1) * 99 / script.steps.length);
  }
}

sauce.runall.setprogress = function(runIndex, percent) {
  if (percent == 0) {
    jQuery('#' + runIndex + '-run-progress-done').css('width', 0).hide();
    jQuery('#' + runIndex + '-run-progress-notdone').css('left', 0).css('width', 100).hide();
  } else {
    jQuery('#' + runIndex + '-run-progress-done').css('width', percent).show();
    jQuery('#' + runIndex + '-run-progress-notdone').css('left', percent).css('width', 100 - percent).show();
  }
};

sauce.runall.stoprun = function() {
  jQuery(sauce.runall.info_p).html(_t('__sauce_stopping'));
  sauce.runall.requestStop = true;
  jQuery('#suite-playback-stop').hide();
  sauce.runall.runs.forEach(function (run) {
    run.stopRequested = true;
    if (run.playbackRun) {
      run.seleniumVersion.rcPlayback.stopTest(run.playbackRun);
    }
  });
};

sauce.runall.processResult = function(result, runIndex) {
  sauce.runall.setprogress(runIndex, 0);
  if (result.url) {
    jQuery("#script-num-" + runIndex + "-view").attr('href', result.url).show();
  }
  if (sauce.runall.runs[runIndex].stopRequested) {
    jQuery("#script-num-" + runIndex).css('background-color', '#cccccc'); 
    jQuery("#script-num-" + runIndex + "-error").html(_t("__sauce_run_stopped")).show();
  } else {
    if (result.success) {
      jQuery("#script-num-" + runIndex).css('background-color', '#bfee85');
    } else {
      if (result.errormessage) {
        jQuery("#script-num-" + runIndex).css('background-color', '#ff3333');
        jQuery("#script-num-" + runIndex + "-error").html(" " + result.errormessage).show();
      } else {
        jQuery("#script-num-" + runIndex).css('background-color', '#ffcccc');
      }
    }
  }
  sauce.runall.runs[runIndex].complete = true;
  sauce.runall.runs[runIndex].playbackRun = null;
  sauce.runall.runNext(sauce.runall.runs[runIndex].mac);
};

sauce.runall.hide = function () {
  jQuery(sauce.runall.dialog).remove();
};

sauce.runall.allComplete = function() {
  if (sauce.runall.requestStop) {
    for (var i = 0; i < sauce.runall.runs.length; i++) {
      if (sauce.runall.runs[i].playbackRun) { return false; }
    }
    return true;
  } else {
    for (var i = 0; i < sauce.runall.runs.length; i++) {
      if (!sauce.runall.runs[i].complete) { return false; }
    }
    return true;
  }
};

sauce.runall.checkComplete = function() {
  if (sauce.runall.allComplete()) {
    sauce.restoreBreakpointsState();
    sauce.runall.playing = false;
    jQuery('#sauce-ok').show(); // Make the OK button for starting a new run visible.
    jQuery('#suite-playback-stop').hide();
    jQuery('#suite-playback-close').show();
    jQuery(sauce.runall.info_p).html(_t('done_exclamation'));
    jQuery('#edit-suite-editing').show();
  }
};

sauce.runall.runNext = function(mac) {
  if (sauce.doparallel) {
    // respect mac-ness
    if (mac) {
      sauce.runall.macRunIndex++;
      if (sauce.runall.macRunIndex < sauce.runall.mac_runs.length && !sauce.runall.requestStop) {
        sauce.runall.runScript(sauce.runall.runs.indexOf(sauce.runall.mac_runs[sauce.runall.macRunIndex]));
        return;
      }
    }
    sauce.runall.nonmacRunIndex++;
    if (sauce.runall.nonmacRunIndex < sauce.runall.nonmac_runs.length && !sauce.runall.requestStop) {
      sauce.runall.runScript(sauce.runall.runs.indexOf(sauce.runall.nonmac_runs[sauce.runall.nonmacRunIndex]));
    } else {
      sauce.runall.checkComplete();
    }
  } else {
    // just pick one or the other
    sauce.runall.macRunIndex++;
    if (sauce.runall.macRunIndex < sauce.runall.mac_runs.length && !sauce.runall.requestStop) {
      sauce.runall.runScript(sauce.runall.runs.indexOf(sauce.runall.mac_runs[sauce.runall.macRunIndex]));
    } else {
      sauce.runall.nonmacRunIndex++;
      if (sauce.runall.nonmacRunIndex < sauce.runall.nonmac_runs.length && !sauce.runall.requestStop) {
        sauce.runall.runScript(sauce.runall.runs.indexOf(sauce.runall.nonmac_runs[sauce.runall.nonmacRunIndex]));
      } else {
        sauce.runall.checkComplete();
      }
    }
  }
};

sauce.runall.runScript = function(runIndex) {
  jQuery("#script-num-" + runIndex).css('background-color', '#ffffaa');
  if (sauce.runall.runs[runIndex].script.seleniumVersion == builder.selenium1) {
    sauce.runSel1ScriptWithSettings(sauce.runall.runs[runIndex].settings, function(result) { sauce.runall.processResult(result, runIndex); }, sauce.runall.runs[runIndex]);
  } else {
    sauce.runSel2ScriptWithSettings(sauce.runall.runs[runIndex].settings, function(result) { sauce.runall.processResult(result, runIndex); }, sauce.runall.runs[runIndex]);
  }
};