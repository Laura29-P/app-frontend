package com.aventurakids.app;

import android.speech.tts.TextToSpeech;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Locale;

@CapacitorPlugin(name = "NativeSpeech")
public class SpeechPlugin extends Plugin {
    private TextToSpeech engine;
    private boolean ready;
    private PluginCall pending;

    @PluginMethod
    public void speak(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            if (ready) {
                speakNow(call);
                return;
            }
            if (pending != null) pending.reject("Se solicitó otra pronunciación.");
            pending = call;
            if (engine == null) {
                engine = new TextToSpeech(getContext(), status -> getActivity().runOnUiThread(() -> {
                    ready = status == TextToSpeech.SUCCESS;
                    PluginCall waiting = pending;
                    pending = null;
                    if (!ready) {
                        if (engine != null) engine.shutdown();
                        engine = null;
                        if (waiting != null) waiting.reject("Activa un motor de texto a voz en Ajustes de Android.");
                    } else if (waiting != null) {
                        speakNow(waiting);
                    }
                }));
            }
        });
    }

    private void speakNow(PluginCall call) {
        String text = call.getString("text", "");
        if (text.isEmpty()) { call.resolve(); return; }
        int language = engine.setLanguage(Locale.forLanguageTag(call.getString("lang", "en-US")));
        if (language == TextToSpeech.LANG_MISSING_DATA || language == TextToSpeech.LANG_NOT_SUPPORTED) {
            call.reject("Instala la voz de inglés en Ajustes de Android > Texto a voz.");
            return;
        }
        engine.setSpeechRate(0.85f);
        int result = engine.speak(text, TextToSpeech.QUEUE_FLUSH, null, "aventura-pronunciation");
        if (result == TextToSpeech.ERROR) call.reject("No se pudo reproducir la voz. Revisa el motor de texto a voz de Android.");
        else call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            if (pending != null) { pending.resolve(); pending = null; }
            if (engine != null && ready) engine.stop();
            call.resolve();
        });
    }

    @Override
    protected void handleOnDestroy() {
        if (pending != null) { pending.reject("Reproducción cancelada."); pending = null; }
        if (engine != null) { engine.stop(); engine.shutdown(); engine = null; }
        ready = false;
    }
}
